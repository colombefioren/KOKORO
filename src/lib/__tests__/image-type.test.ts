import { describe, it, expect } from "vitest";
import { detectRasterImage } from "../image-type";

const blob = (bytes: number[] | string, type = "") =>
  new Blob([typeof bytes === "string" ? bytes : new Uint8Array(bytes)], {
    type,
  });

describe("detectRasterImage", () => {
  it("recognises png, jpeg, gif and webp by their magic bytes", async () => {
    expect(
      await detectRasterImage(
        blob([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]),
      ),
    ).toEqual({ contentType: "image/png", extension: "png" });
    expect(await detectRasterImage(blob([0xff, 0xd8, 0xff, 0xe0]))).toEqual({
      contentType: "image/jpeg",
      extension: "jpg",
    });
    expect(await detectRasterImage(blob("GIF89a"))).toEqual({
      contentType: "image/gif",
      extension: "gif",
    });
    expect(await detectRasterImage(blob("RIFF\0\0\0\0WEBPVP8 "))).toEqual({
      contentType: "image/webp",
      extension: "webp",
    });
  });

  it("rejects svg even when it claims to be an image", async () => {
    const svg = blob(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      "image/svg+xml",
    );
    expect(await detectRasterImage(svg)).toBeNull();
  });

  it("rejects html renamed as a png", async () => {
    expect(
      await detectRasterImage(blob("<html><script></script>", "image/png")),
    ).toBeNull();
  });
});
