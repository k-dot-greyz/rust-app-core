import { createMemo, createRoot, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { cardChanges } from "../src/cards/delta.ts";
import { freshDeck } from "../src/cards/deck.ts";
import { createDeckBridge } from "../src/bridge/deck-store.ts";

describe("deck bridge", () => {
  it("writes one gauge field through the draft setter", () => {
    const bridge = createDeckBridge(freshDeck());
    const hero = bridge.deck.cards.find((card) => card.id === "card.hero");
    bridge.setGauge("card.gauge", 81.4);
    flush();
    const gauge = bridge.deck.cards.find((card) => card.id === "card.gauge");
    expect(gauge?.kind === "gauge" && gauge.body.value).toBe(81);
    expect(bridge.deck.cards.find((card) => card.id === "card.hero")).toBe(hero);
  });

  it("reconciles one list line and keeps the hero proxy", () => {
    let dispose = () => {};
    let nudge = () => {};
    createRoot((done) => {
      dispose = done;
      const bridge = createDeckBridge(freshDeck());
      let hero: ReturnType<typeof freshDeck>[number] | undefined;
      createMemo(() => {
        hero = bridge.deck.cards.find((card) => card.id === "card.hero");
        return hero?.title;
      });
      flush();
      const captured = hero;
      const before = freshDeck();
      nudge = () => {
        bridge.nudgeLine();
        flush();
        const tracked = bridge.deck.cards.find((card) => card.id === "card.tracked");
        expect(tracked?.kind === "list" && tracked.body.items[0]?.detail.endsWith(" ·")).toBe(true);
        expect(bridge.deck.cards.find((card) => card.id === "card.hero")).toBe(captured);
        expect(bridge.deck.fault).toBeNull();
        expect(bridge.deck.log[0]?.text).toContain("/card.tracked/body/items/0/detail");
        const after = freshDeck();
        const item = after.find((card) => card.id === "card.tracked");
        if (item?.kind === "list" && item.body.items[0]) item.body.items[0].detail = `${item.body.items[0].detail} ·`;
        expect(cardChanges(before, after)).toEqual(["/card.tracked/body/items/0/detail"]);
      };
    });
    nudge();
    dispose();
  });

  it("refuses an unknown kind without replacing the deck", () => {
    const bridge = createDeckBridge(freshDeck());
    const hero = bridge.deck.cards.find((card) => card.id === "card.hero");
    bridge.offerBadKind();
    flush();
    expect(bridge.deck.fault).toContain("unknown card kind");
    expect(bridge.deck.cards.find((card) => card.id === "card.hero")).toBe(hero);
    expect(bridge.deck.cards).toHaveLength(9);
  });

  it("files a trace line and refuses an empty title", () => {
    const bridge = createDeckBridge(freshDeck());
    const empty = bridge.fileLine("", "quiet");
    flush();
    expect(empty.length).toBeGreaterThan(0);
    expect(bridge.deck.fault).toContain("length");
    const trace = () => {
      const card = bridge.deck.cards.find((item) => item.id === "card.trace");
      if (card?.kind !== "list") throw new Error("trace card missing");
      return card;
    };
    expect(trace().body.items).toHaveLength(1);

    expect(bridge.fileLine("Hull radio", "Still local.")).toEqual([]);
    flush();
    expect(trace().body.items).toHaveLength(2);
    expect(bridge.deck.fault).toBeNull();
  });

  it("replaces the deck from a full payload and clears a filed line", () => {
    const bridge = createDeckBridge(freshDeck());
    expect(bridge.fileLine("Hull radio", "Still local.")).toEqual([]);
    flush();
    expect(bridge.load(freshDeck())).toEqual([]);
    flush();
    const card = bridge.deck.cards.find((item) => item.id === "card.trace");
    if (card?.kind !== "list") throw new Error("trace card missing");
    expect(card.body.items).toHaveLength(1);
    expect(bridge.deck.fault).toBeNull();
    expect(bridge.deck.log).toHaveLength(0);
    expect(bridge.deck.selectedId).toBe("card.gauge");
  });

  it("projects a count per kind", () => {
    const bridge = createDeckBridge(freshDeck());
    flush();
    const list = bridge.kindCounts.find((row) => row.id === "list");
    const gauge = bridge.kindCounts.find((row) => row.id === "gauge");
    expect(list?.count).toBe(3);
    expect(gauge?.count).toBe(1);
  });
});
