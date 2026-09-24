import { render, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEffect, useRef } from "react";

const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

type Handler = (data: unknown) => void;

class FakeSocket {
  handlers = new Map<string, Set<Handler>>();
  emitted: { event: string; data: Record<string, unknown> }[] = [];
  constructor(private room: FakeSocket[]) {
    room.push(this);
  }
  on(event: string, fn: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(fn);
  }
  off(event: string, fn: Handler) {
    this.handlers.get(event)?.delete(fn);
  }
  emit(event: string, data: Record<string, unknown>) {
    this.emitted.push({ event, data });
    if (event === "update-video-state") {
      for (const other of this.room) {
        if (other !== this) other.receive("new-video-state", data);
      }
    }
  }
  receive(event: string, data: unknown) {
    this.handlers.get(event)?.forEach((fn) => fn(data));
  }
  updates() {
    return this.emitted.filter((e) => e.event === "update-video-state");
  }
}

interface FakePlayer {
  state: number;
  time: number;
  fireStateChange: (state: number) => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (t: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  cueVideoById: () => void;
}

const players: FakePlayer[] = [];

vi.mock("react-youtube", () => ({
  default: function FakeYouTube(props: {
    onReady: (e: { target: FakePlayer }) => void;
    onStateChange: (e: { data: number }) => void;
  }) {
    const propsRef = useRef(props);
    propsRef.current = props;

    useEffect(() => {
      const player: FakePlayer = {
        state: PlayerState.CUED,
        time: 0,
        fireStateChange(state) {
          player.state = state;
          propsRef.current.onStateChange({ data: state });
        },
        getPlayerState: () => player.state,
        getCurrentTime: () => player.time,
        getDuration: () => 300,
        seekTo(t) {
          player.time = t;
        },
        playVideo() {
          Promise.resolve().then(() =>
            player.fireStateChange(PlayerState.PLAYING),
          );
        },
        pauseVideo() {
          Promise.resolve().then(() =>
            player.fireStateChange(PlayerState.PAUSED),
          );
        },
        cueVideoById() {},
      };
      players.push(player);
      propsRef.current.onReady({ target: player });
    }, []);

    return null;
  },
}));

vi.mock("@/store/useSocketStore", async () => {
  const react = await import("react");
  const SocketContext = react.createContext<unknown>(null);
  return {
    SocketContext,
    useSocketStore: (selector: (s: { socket: unknown }) => unknown) =>
      selector({ socket: react.useContext(SocketContext) }),
  };
});

const { SocketContext } =
  (await import("@/store/useSocketStore")) as unknown as {
    SocketContext: React.Context<FakeSocket | null>;
  };
const { default: VideoPlayer } = await import("../youtube/video-player");

const flush = () => act(async () => {});

const mount = (room: FakeSocket[], userId: string, canControl: boolean) => {
  const socket = new FakeSocket(room);
  const { container } = render(
    <SocketContext.Provider value={socket}>
      <VideoPlayer
        videoId="dQw4w9WgXcQ"
        isHost={canControl}
        roomId="room-1"
        userId={userId}
      />
    </SocketContext.Provider>,
  );
  const player = players[players.length - 1];
  const clickPlayPause = () => {
    const button = container
      .querySelector(".lucide-play, .lucide-pause")
      ?.closest("button");
    if (!button) throw new Error(`no play/pause button for ${userId}`);
    act(() => button.click());
  };
  return { socket, player, clickPlayPause };
};

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setInterval",
      "clearInterval",
      "setTimeout",
      "clearTimeout",
      "Date",
    ],
  });
  (globalThis as unknown as { YT: unknown }).YT = { PlayerState };
  players.length = 0;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("video sync in a free-for-all room", () => {
  it("plays for everyone without the other member echoing it back", async () => {
    const room: FakeSocket[] = [];
    const a = mount(room, "a", true);
    const b = mount(room, "b", true);
    await flush();

    a.clickPlayPause();
    await flush();
    await flush();

    expect(b.player.state).toBe(PlayerState.PLAYING);
    expect(a.socket.updates()).toHaveLength(1);
    expect(a.socket.updates()[0].data).toMatchObject({ paused: false });
    expect(b.socket.updates()).toHaveLength(0);
  });

  it("only the member who acted last sends the heartbeat", async () => {
    const room: FakeSocket[] = [];
    const a = mount(room, "a", true);
    const b = mount(room, "b", true);
    await flush();

    a.clickPlayPause();
    await flush();
    await flush();
    act(() => vi.advanceTimersByTime(10_000));

    expect(a.socket.updates().length).toBeGreaterThanOrEqual(5);
    expect(b.socket.updates()).toHaveLength(0);
  });

  it("does not broadcast a member's buffering recovery", async () => {
    const room: FakeSocket[] = [];
    const a = mount(room, "a", true);
    const b = mount(room, "b", true);
    await flush();

    a.clickPlayPause();
    await flush();
    await flush();
    act(() => vi.advanceTimersByTime(5_000));

    act(() => {
      b.player.fireStateChange(PlayerState.BUFFERING);
      b.player.fireStateChange(PlayerState.PLAYING);
    });

    expect(b.socket.updates()).toHaveLength(0);
  });

  it("hands control to whoever pauses and ignores a stale heartbeat", async () => {
    const room: FakeSocket[] = [];
    const a = mount(room, "a", true);
    const b = mount(room, "b", true);
    await flush();

    a.clickPlayPause();
    await flush();
    await flush();
    act(() => vi.advanceTimersByTime(3_000));

    b.clickPlayPause();
    await flush();
    await flush();

    expect(b.socket.updates().at(-1)?.data).toMatchObject({ paused: true });
    expect(a.player.state).toBe(PlayerState.PAUSED);

    act(() =>
      b.socket.receive("new-video-state", {
        videoId: "dQw4w9WgXcQ",
        paused: false,
        currentTime: 3,
        roomId: "room-1",
        lastUpdatedBy: "a",
        lastUpdatedAt: new Date(),
      }),
    );
    await flush();
    expect(b.player.state).toBe(PlayerState.PAUSED);

    const aHeartbeatsBefore = a.socket.updates().length;
    act(() => vi.advanceTimersByTime(10_000));
    expect(a.socket.updates().length).toBe(aHeartbeatsBefore);
    expect(
      b.socket.updates().filter((u) => u.data.paused === true).length,
    ).toBeGreaterThanOrEqual(5);
  });
});

describe("video sync in a host-controlled room", () => {
  it("members follow the host and never broadcast", async () => {
    const room: FakeSocket[] = [];
    const host = mount(room, "host", true);
    const member = mount(room, "member", false);
    await flush();

    host.clickPlayPause();
    await flush();
    await flush();
    act(() => vi.advanceTimersByTime(10_000));

    expect(member.player.state).toBe(PlayerState.PLAYING);
    expect(host.socket.updates().length).toBeGreaterThanOrEqual(5);
    expect(member.socket.updates()).toHaveLength(0);
  });
});
