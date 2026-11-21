import { For, Show } from "solid-js";
import { bridge } from "../bridge/deck-store.ts";
import { chrome } from "../cards/chrome.ts";
import { CardView } from "../ui/CardView.tsx";

export function DeckIsland() {
  return (
    <div class="deck">
      <p class="hint" data-hull={bridge.deck.connected ? "up" : "down"}>
        {bridge.deck.seal.word}. {bridge.deck.seal.detail}
      </p>
      <Show when={bridge.deck.fault}>
        {(fault) => (
          <p class="fault" role="alert">
            {fault()}
          </p>
        )}
      </Show>
      <For each={bridge.deck.cards}>
        {(card) => (
          <article
            class="card"
            id={card.id}
            data-kind={card.kind}
            data-selected={bridge.deck.selectedId === card.id ? "true" : "false"}
          >
            <div class="card-bar">
              <button type="button" onClick={() => bridge.select(card.id)}>
                <span class="sr-only">{chrome.select} </span>
                {card.id}
              </button>
            </div>
            <CardView card={card} />
          </article>
        )}
      </For>
    </div>
  );
}
