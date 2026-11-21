import shorthand from "../../CONTEXT.md?raw";
import { createSignal, For, Show } from "solid-js";
import { bridge } from "../bridge/deck-store.ts";
import { chrome, drills, type DrillId } from "../cards/chrome.ts";
import { assertNever } from "../cards/types.ts";
import { Field } from "../ui/Field.tsx";

export function InspectorIsland() {
  const [status, setStatus] = createSignal("");
  return (
    <div class="inspector">
      <section>
        <h2>{chrome.countsTitle}</h2>
        <p class="hint">{chrome.countsHint}</p>
        <ol class="counts">
          <For each={bridge.kindCounts}>
            {(row) => (
              <li>
                <span>{row.id}</span>
                <span>{row.count}</span>
              </li>
            )}
          </For>
        </ol>
      </section>
      <Show when={bridge.deck.cards.find((card) => card.id === "card.gauge")}>
        {(card) => (
          <Show
            when={(() => {
              const current = card();
              return current.kind === "gauge" ? current : undefined;
            })()}
          >
            {(gauge) => (
              <section>
                <h2>{gauge().title}</h2>
                <label class="range">
                  <span>{gauge().body.label}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gauge().body.value}
                    onInput={(event) => {
                      const target = event.currentTarget;
                      if (target instanceof HTMLInputElement) bridge.setGauge(gauge().id, Number(target.value));
                    }}
                  />
                  <Field stamp="gauge-value-inspector" value={gauge().body.value} mark />
                </label>
                <p class="hint">{gauge().body.caption}</p>
              </section>
            )}
          </Show>
        )}
      </Show>
      <section class="drills">
        <p class="hint">{chrome.drillsHint}</p>
        <For each={drills}>
          {(drill) => (
            <button type="button" onClick={() => runDrill(drill.id)}>
              {drill.label}
            </button>
          )}
        </For>
      </section>
      <section>
        <h2>{chrome.tapeTitle}</h2>
        <p class="hint">{chrome.tapeHint}</p>
        <ul class="tape" aria-live="polite">
          <For each={bridge.deck.log} fallback={<li>{chrome.emptyTape}</li>}>
            {(line) => <li>{line.text}</li>}
          </For>
        </ul>
      </section>
      <section>
        <h2>{chrome.jsonTitle}</h2>
        <pre>{bridge.preview()}</pre>
      </section>
      <section>
        <h2>{chrome.promptTitle}</h2>
        <pre id="shorthand">{shorthand}</pre>
        <button
          type="button"
          onClick={() => {
            void copyPrompt(setStatus);
          }}
        >
          {chrome.copy}
        </button>
        <Show when={status()}>
          {(text) => <p role="status">{text()}</p>}
        </Show>
      </section>
    </div>
  );
}

function runDrill(id: DrillId) {
  switch (id) {
    case "nudge":
      bridge.nudgeLine();
      return;
    case "bad":
      bridge.offerBadKind();
      return;
    default:
      assertNever(id);
  }
}

async function copyPrompt(setStatus: (value: string) => void) {
  try {
    await navigator.clipboard.writeText(shorthand);
    setStatus(chrome.copied);
  } catch {
    const pre = document.getElementById("shorthand");
    if (pre) {
      const range = document.createRange();
      range.selectNodeContents(pre);
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    setStatus(chrome.clipboardBlocked);
  }
}
