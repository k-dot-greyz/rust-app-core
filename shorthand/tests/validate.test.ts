import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { freshDeck } from "../src/cards/deck.ts";
import { toPretext } from "../src/cards/pretext.ts";
import { issuesText, validateDeck } from "../src/cards/validate.ts";

describe("hull card contract", () => {
  it("accepts the fixture deck without rewriting a field", () => {
    const cards = freshDeck();
    const result = validateDeck(cards);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cards).toHaveLength(9);
      expect(result.cards).toStrictEqual(cards);
    }
  });

  it("rejects the later occurrence of a duplicate card ID", () => {
    const [hero, ...cards] = freshDeck();
    expect(validateDeck([hero, ...cards, hero])).toEqual({
      ok: false,
      issues: [{ path: "/9/id", detail: "duplicate card id" }],
    });
  });

  it("refuses an unknown field", () => {
    const [hero] = freshDeck();
    const result = validateDeck([{ ...hero, body: { ...hero?.body, extra: 1 } }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.path === "/0/body/extra" && issue.detail === "unknown field")).toBe(
        true,
      );
    }
  });

  it("refuses an unknown kind", () => {
    const [hero] = freshDeck();
    const result = validateDeck([{ ...hero, kind: "sparkle" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.some((issue) => issue.path === "/0/kind" && issue.detail === "unknown card kind")).toBe(true);
  });

  it.each(["https://evil.example/reel.mp4", "/assets/.", "/assets/.."])("refuses media src %s", (src) => {
    const bay = freshDeck().find((card) => card.kind === "media");
    const result = validateDeck([
      {
        ...bay,
        body: { ...bay?.body, src },
      },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.path === "/0/body/src")).toBe(true);
    }
  });

  it("refuses a gauge past 100 and a bidi character", () => {
    const gauge = freshDeck().find((card) => card.id === "card.gauge");
    const high = validateDeck([{ ...gauge, body: { ...gauge?.body, value: 101 } }]);
    expect(high.ok).toBe(false);
    if (!high.ok) expect(issuesText(high.issues)).toContain("outside 0..=100");

    const [hero] = freshDeck();
    const bidi = validateDeck([{ ...hero, body: { ...hero?.body, lede: "hull\u202aleak" } }]);
    expect(bidi.ok).toBe(false);
    if (!bidi.ok) expect(issuesText(bidi.issues)).toContain("control or bidi character");
  });

  it("refuses a list past 24 items", () => {
    const items = Array.from({ length: 25 }, (_, index) => ({
      title: `Line ${index}`,
      detail: "held",
      tone: "ink",
    }));
    const result = validateDeck([
      { id: "card.trace", kind: "list", rev: 1, title: "Filed", body: { items } },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(issuesText(result.issues)).toContain("a list holds at most 24");
  });
});

describe("pretext", () => {
  it("prints the gauge and the bay plate as text", () => {
    const text = toPretext(freshDeck());
    expect(text).toContain("Integrity 64");
    expect(text).toContain("No reel loaded. The hatch does not turn white.");
    expect(text).not.toContain("<");
  });
});

describe("shorthand prompt", () => {
  const prompt = readFileSync(new URL("../CONTEXT.md", import.meta.url), "utf8");

  it("pins Solid 2 and names the adapter that is not the npm latest", () => {
    expect(prompt).toContain("solid-js@2.0.3");
    expect(prompt).toContain("@astrojs/solid-js@8");
    expect(prompt).toContain("7.1.6");
    expect(prompt).toContain("solid-js/store");
    expect(prompt).toContain("@solidjs/web");
  });

  it("bans the Solid 1 calls a model will otherwise emit", () => {
    expect(prompt).toContain("createResource");
    expect(prompt).toContain("onMount");
    expect(prompt).toContain("Never destructure props");
    expect(prompt).toContain("createProjection");
    expect(prompt).toContain('reconcile(next, "id")');
    expect(prompt).toContain("dynamic(");
    expect(prompt).toContain("Switch and Match do not replace it");
    expect(prompt).toContain("This hull has no card inheritance");
    expect(prompt).toContain("Do not add Loading or isPending");
    expect(prompt).not.toContain("Resolve inheritance");
  });
});
