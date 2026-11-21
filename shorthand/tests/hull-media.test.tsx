// @vitest-environment happy-dom
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { afterEach, expect, it } from "vitest";
import type { Card, Medium } from "../src/cards/types.ts";
import { CardView } from "../src/ui/CardView.tsx";

const FALLBACK = "No reel loaded. The hatch does not turn white.";
const stops: Array<() => void> = [];

afterEach(() => {
  for (const stop of stops) stop();
  stops.length = 0;
  document.body.replaceChildren();
});

function mediaCard(src: string, medium: Medium = "video"): Card {
  return {
    id: "card.bay",
    kind: "media",
    rev: 1,
    title: "Bay 3",
    body: {
      medium,
      src,
      caption: "Empty source. The plate stays dark.",
      fallback: FALLBACK,
    },
  };
}

function mount(card: Card) {
  const host = document.createElement("div");
  document.body.append(host);
  stops.push(render(() => <CardView card={card} />, host));
  flush();
  return host;
}

it("paints only the dark plate when the source is empty", () => {
  const host = mount(mediaCard(""));
  expect(host.querySelector("video, audio, iframe")).toBeNull();
  expect(host.querySelector(".bay-fallback")?.textContent).toContain(FALLBACK);
  expect(host.querySelector(".bay-fallback")?.hasAttribute("hidden")).toBe(false);
});

it("renders a local video file", () => {
  const host = mount(mediaCard("/assets/mark.svg", "video"));
  const video = host.querySelector("video");
  expect(video?.getAttribute("src")).toBe("/assets/mark.svg");
  expect(video?.hasAttribute("controls")).toBe(true);
  expect(video?.hasAttribute("playsinline")).toBe(true);
  expect(video?.getAttribute("preload")).toBe("none");
  expect(video?.hasAttribute("hidden")).toBe(false);
  expect(host.textContent).toContain(FALLBACK);
  const plateBefore = host.querySelector(".bay-fallback");
  expect(plateBefore?.hasAttribute("hidden")).toBe(true);
  expect(plateBefore?.hasAttribute("data-state")).toBe(false);

  video?.dispatchEvent(new Event("error"));
  flush();
  const plate = host.querySelector(".bay-fallback");
  expect(plate?.hasAttribute("hidden")).toBe(false);
  expect(plate?.getAttribute("data-state")).toBe("dark");
  expect(plate?.textContent).toContain(FALLBACK);
});

it("renders a local audio file", () => {
  const host = mount(mediaCard("/assets/mark.svg", "audio"));
  const audio = host.querySelector("audio");
  expect(audio?.getAttribute("src")).toBe("/assets/mark.svg");
  expect(audio?.hasAttribute("controls")).toBe(true);
  expect(audio?.getAttribute("preload")).toBe("none");
  expect(host.querySelector("video, iframe")).toBeNull();
});

it("renders a sandboxed local frame", () => {
  const host = document.createElement("div");
  stops.push(render(() => <CardView card={mediaCard("/assets/mark.svg", "frame")} />, host));
  flush();
  const frame = host.querySelector("iframe");
  expect(frame?.getAttribute("src")).toBe("/assets/mark.svg");
  expect(frame?.getAttribute("title")).toBe("Bay 3");
  expect(frame?.getAttribute("sandbox")).toBe("");
  expect(frame?.getAttribute("referrerpolicy")).toBe("no-referrer");
  expect(host.querySelector("video, audio")).toBeNull();
  expect(host.querySelector(".bay-fallback")?.textContent).toContain(FALLBACK);
});

it("does not emit an unsafe media src", () => {
  const remote = mount(mediaCard("https://example.com/a.mp4"));
  expect(remote.querySelector("video, audio, iframe")).toBeNull();
  expect(remote.innerHTML).not.toContain("https://example.com/a.mp4");
  expect(remote.querySelector(".bay-fallback")?.textContent).toContain(FALLBACK);

  const parent = mount(mediaCard("/assets/.."));
  expect(parent.querySelector("video, audio, iframe")).toBeNull();
  expect(parent.innerHTML).not.toContain("/assets/..");
});
