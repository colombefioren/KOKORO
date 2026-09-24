import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MessageReactions from "../message-reactions";

const PICKER = { width: 142, height: 76 };

const mockRects = (trigger: { top: number; left: number }) => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      if (this.getAttribute("role") === "menu") {
        return {
          ...PICKER,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }
      return {
        width: 24,
        height: 24,
        top: trigger.top,
        left: trigger.left,
        right: trigger.left + 24,
        bottom: trigger.top + 24,
        x: trigger.left,
        y: trigger.top,
        toJSON: () => ({}),
      };
    },
  );
};

const renderReactions = (onToggle = vi.fn()) => {
  const utils = render(
    <div data-testid="message">
      <MessageReactions messageId="m1" reactions={[]} onToggle={onToggle} />
    </div>,
  );
  return { ...utils, onToggle };
};

const openPicker = () =>
  fireEvent.click(screen.getByRole("button", { name: "Add reaction" }));

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    value: 1024,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MessageReactions picker", () => {
  it("renders in a portal on document.body above everything else", () => {
    mockRects({ top: 400, left: 500 });
    renderReactions();
    openPicker();

    const picker = screen.getByRole("menu");
    expect(picker.parentElement).toBe(document.body);
    expect(screen.getByTestId("message")).not.toContainElement(picker);
    expect(picker).toHaveClass("fixed", "z-[100001]");
  });

  it("toggles the chosen emoji and closes", () => {
    mockRects({ top: 400, left: 500 });
    const { onToggle } = renderReactions();
    openPicker();

    fireEvent.click(screen.getByRole("menuitem", { name: "🔥" }));

    expect(onToggle).toHaveBeenCalledWith("m1", "🔥");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on outside click and on Escape", () => {
    mockRects({ top: 400, left: 500 });
    renderReactions();

    openPicker();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    openPicker();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("sits above the trigger when there is room", () => {
    mockRects({ top: 400, left: 500 });
    renderReactions();
    openPicker();

    const picker = screen.getByRole("menu");
    expect(picker.style.top).toBe(`${400 - PICKER.height - 6}px`);
    expect(picker.style.left).toBe(`${500 + 12 - PICKER.width / 2}px`);
    expect(picker.style.visibility).toBe("visible");
  });

  it("flips below the trigger near the top of the screen", () => {
    mockRects({ top: 20, left: 500 });
    renderReactions();
    openPicker();

    expect(screen.getByRole("menu").style.top).toBe(`${20 + 24 + 6}px`);
  });

  it("stays inside the viewport near the edges", () => {
    mockRects({ top: 400, left: 1010 });
    renderReactions();
    openPicker();

    expect(screen.getByRole("menu").style.left).toBe(
      `${1024 - PICKER.width - 8}px`,
    );
  });
});
