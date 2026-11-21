import { assertNever, type Card } from "./types.ts";

export function toPretext(cards: Card[]): string {
  return cards.map(block).join("\n\n");
}

function block(card: Card): string {
  const head = `${card.kind}  ${card.title}`;
  switch (card.kind) {
    case "hero":
      return [head, card.body.kicker ?? "", card.body.lede].filter((line) => line.length > 0).join("\n");
    case "stat":
      return [head, `${card.body.label} ${card.body.value} ${card.body.unit}`, card.body.hint].join("\n");
    case "gauge":
      return [head, `${card.body.label} ${card.body.value}`, card.body.caption].join("\n");
    case "note":
      return [head, card.body.text].join("\n");
    case "list":
      return [head, ...card.body.items.map((item) => `${item.title}: ${item.detail}`)].join("\n");
    case "form":
      return [head, card.body.pipe, ...card.body.fields.map((field) => field.label)].join("\n");
    case "media":
      return [head, card.body.fallback, card.body.caption].join("\n");
    default:
      return assertNever(card);
  }
}
