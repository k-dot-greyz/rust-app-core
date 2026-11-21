import { createEffect, createRoot, deep, snapshot } from "solid-js";
import { bridge } from "./bridge/deck-store.ts";
import { toPretext } from "./cards/pretext.ts";

export function watchPretext(node: Element): () => void {
  return createRoot((dispose) => {
    createEffect(
      () => {
        const cards = deep(bridge.deck.cards);
        return toPretext(snapshot(cards));
      },
      (text) => {
        node.textContent = text;
      },
    );
    return dispose;
  });
}
