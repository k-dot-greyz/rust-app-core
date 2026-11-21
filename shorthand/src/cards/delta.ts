import type { Card } from "./types.ts";

export function leafChanges(before: unknown, after: unknown, path = ""): string[] {
  if (Object.is(before, after)) return [];
  if (Array.isArray(before) && Array.isArray(after)) {
    const paths: string[] = [];
    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index += 1) {
      paths.push(...leafChanges(before[index], after[index], `${path}/${index}`));
    }
    return paths;
  }
  if (isRecord(before) && isRecord(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const paths: string[] = [];
    for (const key of keys) {
      paths.push(...leafChanges(before[key], after[key], `${path}/${key}`));
    }
    return paths;
  }
  return [path.length > 0 ? path : "/"];
}

export function cardChanges(before: Card[], after: Card[]): string[] {
  const paths: string[] = [];
  const previous = new Map(before.map((card) => [card.id, card]));
  const nextIds = new Set(after.map((card) => card.id));
  for (const card of after) {
    const prior = previous.get(card.id);
    if (!prior) {
      paths.push(`/${card.id} added`);
      continue;
    }
    for (const leaf of leafChanges(prior, card)) paths.push(`/${card.id}${leaf}`);
  }
  for (const card of before) {
    if (!nextIds.has(card.id)) paths.push(`/${card.id} removed`);
  }
  return paths;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
