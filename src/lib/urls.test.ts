import { describe, expect, it } from "vitest";
import { asset, verificationUrl } from "./urls";

describe("static hosting URLs", () => {
  it("supports root and project hosting without double slashes", () => {
    expect(asset("/demo/video.mp4", "")).toBe("/demo/video.mp4");
    expect(asset("/demo/video.mp4", "/muson")).toBe("/muson/demo/video.mp4");
  });
  it("encodes certificate numbers in absolute verification links", () => {
    const url = new URL(
      verificationUrl("MUSON/2026/001", "https://example.org"),
    );
    expect(url.searchParams.get("number")).toBe("MUSON/2026/001");
    expect(url.pathname.endsWith("/verify/")).toBe(true);
  });
});
