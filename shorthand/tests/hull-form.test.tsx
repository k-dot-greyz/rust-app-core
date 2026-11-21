// @vitest-environment happy-dom
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { afterEach, expect, it } from "vitest";
import { bridge } from "../src/bridge/deck-store.ts";
import { freshDeck } from "../src/cards/deck.ts";
import { CardView } from "../src/ui/CardView.tsx";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  document.body.replaceChildren();
});

it("posts the pipe and field names written on the form card", async () => {
  const cards = freshDeck();
  const plate = cards.find((card) => card.kind === "form");
  if (plate?.kind !== "form") throw new Error("missing form");
  plate.body.pipe = "ingress.pass";
  plate.body.fields = [
    { name: "dish", label: "Dish", type: "text", required: true, max: 48 },
    { name: "note", label: "Note", type: "text", required: false, max: 80 },
  ];
  expect(bridge.applyView({ epoch: "abc", cursor: 1, seal: { word: "SEALED", detail: "shut" }, deck: cards })).toBe(true);
  flush();

  const seen: { url: string; body: string }[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    seen.push({ url: String(url), body: String(init?.body ?? "") });
    return new Response(
      JSON.stringify({
        ok: true,
        view: { epoch: "abc", cursor: 2, seal: { word: "SEALED", detail: "shut" }, deck: cards },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  const host = document.createElement("div");
  document.body.append(host);
  render(() => {
    const card = bridge.deck.cards.find((item) => item.kind === "form");
    return card ? <CardView card={card} /> : null;
  }, host);

  const form = host.querySelector("form");
  if (!(form instanceof HTMLFormElement)) throw new Error("missing form");
  const dish = form.querySelector('input[name="dish"]');
  const note = form.querySelector('input[name="note"]');
  if (!(dish instanceof HTMLInputElement) || !(note instanceof HTMLInputElement)) throw new Error("missing fields");
  dish.value = "Morning plate";
  note.value = "Still on this machine.";
  form.requestSubmit();
  await viWait();

  expect(seen).toEqual([
    {
      url: "/api/pipes/ingress.pass/push",
      body: JSON.stringify({ dish: "Morning plate", note: "Still on this machine." }),
    },
  ]);
  expect(dish.value).toBe("");
  expect(note.value).toBe("");
});

function viWait(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
