import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { validateDeck } from "../src/cards/validate.ts";

it("accepts the hull sample cards the Rust pass ships", () => {
  const dir = fileURLToPath(new URL("../../modules/cards/", import.meta.url));
  const cards = readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as unknown);
  const result = validateDeck(cards);
  expect(result.ok ? result.cards.map((card) => card.id) : result.issues).toEqual([
    "card.bay",
    "card.covers",
    "card.doctrine",
    "card.hero",
    "card.log",
    "card.pass",
    "card.plate",
    "card.pressure",
    "card.trace",
    "card.verdicts",
  ]);
});
