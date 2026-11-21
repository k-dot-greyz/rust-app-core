// @vitest-environment happy-dom
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bridge } from "../src/bridge/deck-store.ts";
import { freshDeck } from "../src/cards/deck.ts";
import { DeckIsland } from "../src/islands/DeckIsland.tsx";
import { InspectorIsland } from "../src/islands/InspectorIsland.tsx";
import { watchPretext } from "../src/surface.ts";

let stop = () => {};

beforeEach(() => {
  expect(bridge.load(freshDeck())).toEqual([]);
  flush();
  document.body.replaceChildren();
  const deck = document.createElement("div");
  const inspector = document.createElement("div");
  const pre = document.createElement("pre");
  pre.id = "pretext-body";
  document.body.append(deck, inspector, pre);
  const stopDeck = render(() => <DeckIsland />, deck);
  const stopInspector = render(() => <InspectorIsland />, inspector);
  const stopPretext = watchPretext(pre);
  flush();
  stop = () => {
    stopDeck();
    stopInspector();
    stopPretext();
  };
});

afterEach(() => {
  stop();
});

function stamp(name: string) {
  const node = document.querySelector(`[data-stamp="${name}"]`);
  const value = node?.parentElement?.querySelector(".field-value");
  return {
    mount: node?.getAttribute("data-mount") ?? "",
    meta: node?.textContent ?? "",
    value: value?.textContent ?? "",
  };
}

function click(label: string) {
  const button = [...document.querySelectorAll("button")].find((el) => el.textContent?.includes(label));
  if (!button) throw new Error(`missing button ${label}`);
  button.click();
  flush();
}

describe("both islands on one store", () => {
  it("paints the gauge in both roots and leaves the hero on its first paint", () => {
    const hero = stamp("hero-lede");
    const gaugeMount = stamp("gauge-value").mount;
    const inspectorMount = stamp("gauge-value-inspector").mount;
    const input = document.querySelector('input[type="range"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("missing gauge");
    input.value = "81";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flush();

    expect(stamp("gauge-value").value).toBe("81");
    expect(stamp("gauge-value-inspector").value).toBe("81");
    expect(stamp("gauge-value").meta).toBe(" · 2");
    expect(stamp("gauge-value-inspector").meta).toBe(" · 2");
    expect(stamp("gauge-value").mount).toBe(gaugeMount);
    expect(stamp("gauge-value-inspector").mount).toBe(inspectorMount);
    expect(stamp("hero-lede")).toEqual(hero);

    const counts = [...document.querySelectorAll(".counts li")].map((row) =>
      [...row.querySelectorAll("span")].map((span) => span.textContent).join(" "),
    );
    expect(counts).toContain("list 3");
    expect(counts).toContain("gauge 1");

    const pre = document.getElementById("pretext-body")?.textContent ?? "";
    expect(pre).toContain("Integrity 81");
    expect(pre).not.toContain("<");
  });

  it("reconciles one list line and names only that path on the tape", () => {
    const hero = stamp("hero-lede");
    click("Reconcile one line");
    expect(stamp("card.tracked-0").value?.endsWith(" ·")).toBe(true);
    expect(stamp("card.tracked-0").meta).toBe(" · 2");
    expect(stamp("hero-lede")).toEqual(hero);
    const tape = document.querySelector(".tape")?.textContent ?? "";
    expect(tape).toContain("/card.tracked/body/items/0/detail");
    expect(tape).not.toContain("/card.bay");
  });

  it("shows a fault for an unknown kind and keeps the nine cards", () => {
    click("Offer an unknown kind");
    expect(document.querySelector('[role="alert"]')?.textContent).toContain("unknown card kind");
    expect(document.getElementById("card.hero")).not.toBeNull();
    expect(document.querySelectorAll("article")).toHaveLength(9);
  });

  it("files a trace line from the form and ignores an empty title", () => {
    const plate = document.getElementById("card.plate");
    const form = plate?.querySelector("form");
    if (!(form instanceof HTMLFormElement)) throw new Error("missing form");
    const title = form.querySelector('input[name="title"]');
    const detail = form.querySelector('input[name="detail"]');
    if (!(title instanceof HTMLInputElement) || !(detail instanceof HTMLInputElement)) throw new Error("missing fields");

    expect(title.hasAttribute("maxlength")).toBe(false);
    const line = "🚀".repeat(48);
    title.value = `${line}🚀`;
    title.dispatchEvent(new Event("input", { bubbles: true }));
    expect(title.value).toBe(line);
    detail.value = "Still local.";
    form.requestSubmit();
    flush();

    const trace = () => document.getElementById("card.trace");
    expect(trace()?.textContent).toContain(line);
    expect(title.value).toBe("");
    expect(detail.value).toBe("");
    expect(trace()?.textContent).toContain("Still local.");
    expect(document.querySelector('[role="alert"]')).toBeNull();

    title.value = "";
    detail.value = "no title";
    form.requestSubmit();
    flush();
    expect(trace()?.textContent).not.toContain("no title");
    expect(trace()?.querySelectorAll("li")).toHaveLength(2);
  });

  it("keeps the form input when the trace is full", () => {
    const cards = freshDeck();
    const trace = cards.find((card) => card.id === "card.trace");
    if (trace?.kind !== "list" || !trace.body.items[0]) throw new Error("missing trace fixture");
    trace.body.items = Array.from({ length: 24 }, () => ({ ...trace.body.items[0]! }));
    expect(bridge.load(cards)).toEqual([]);
    flush();

    const form = document.querySelector('[id="card.plate"] form');
    if (!(form instanceof HTMLFormElement)) throw new Error("missing form");
    const title = form.querySelector('input[name="title"]');
    const detail = form.querySelector('input[name="detail"]');
    if (!(title instanceof HTMLInputElement) || !(detail instanceof HTMLInputElement)) throw new Error("missing fields");
    title.value = "Hull radio";
    detail.value = "Still local.";
    form.requestSubmit();
    flush();

    expect(document.querySelector('[role="alert"]')?.textContent).toContain("a list holds at most 24");
    expect(document.getElementById("card.trace")?.querySelectorAll("li")).toHaveLength(24);
    expect(title.value).toBe("Hull radio");
    expect(detail.value).toBe("Still local.");
  });
});
