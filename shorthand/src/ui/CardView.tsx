import { dynamic } from "@solidjs/web";
import { For, Show } from "solid-js";
import { bridge } from "../bridge/deck-store.ts";
import { assertNever, type Card } from "../cards/types.ts";
import { Field } from "./Field.tsx";

const STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function CardView(props: { card: Card }) {
  const Shell = dynamic(() => shellFor(props.card.kind));
  return (
    <div class="card-body">
      <h2>{props.card.title}</h2>
      <Shell card={props.card} />
    </div>
  );
}

function shellFor(kind: Card["kind"]) {
  switch (kind) {
    case "hero":
      return HeroCard;
    case "stat":
      return StatCard;
    case "list":
      return ListCard;
    case "form":
      return FormCard;
    case "note":
      return NoteCard;
    case "gauge":
      return GaugeCard;
    case "media":
      return MediaCard;
    default:
      return assertNever(kind);
  }
}

function HeroCard(props: { card: Card }) {
  return (
    <Show when={props.card.kind === "hero" ? props.card : undefined}>
      {(card) => (
        <div>
          <Show when={card().body.kicker}>
            <p class="kicker">{card().body.kicker}</p>
          </Show>
          <p class="lede">
            <Field stamp="hero-lede" value={card().body.lede} mark />
          </p>
        </div>
      )}
    </Show>
  );
}

function StatCard(props: { card: Card }) {
  return (
    <Show when={props.card.kind === "stat" ? props.card : undefined}>
      {(card) => (
        <p class="stat">
          <span class="stat-label">{card().body.label}</span>
          <Field stamp="stat-value" value={card().body.value} mark />
          <span class="unit">{card().body.unit}</span>
          <span class="hint">{card().body.hint}</span>
        </p>
      )}
    </Show>
  );
}

function GaugeCard(props: { card: Card }) {
  return (
    <Show when={props.card.kind === "gauge" ? props.card : undefined}>
      {(card) => (
        <div class="gauge">
          <p class="stat-label">{card().body.label}</p>
          <div class="cells" aria-hidden="true">
            <For each={STEPS}>
              {(step) => (
                <span class="cell" data-on={card().body.value >= (step + 1) * 10 ? "true" : "false"} />
              )}
            </For>
          </div>
          <p>
            <Field stamp="gauge-value" value={card().body.value} mark />
          </p>
          <p class="hint">{card().body.caption}</p>
        </div>
      )}
    </Show>
  );
}

function ListCard(props: { card: Card }) {
  return (
    <Show when={props.card.kind === "list" ? props.card : undefined}>
      {(card) => (
        <ul class="items">
          <For each={card().body.items}>
            {(item, index) => (
              <li class={`tone tone-${item.tone}`}>
                <h3>{item.title}</h3>
                <Field
                  stamp={`${card().id}-${index()}`}
                  value={item.detail}
                  mark={card().id === "card.tracked" && index() === 0}
                />
              </li>
            )}
          </For>
        </ul>
      )}
    </Show>
  );
}

function NoteCard(props: { card: Card }) {
  return (
    <Show when={props.card.kind === "note" ? props.card : undefined}>
      {(card) => (
        <p class={`tone tone-${card().body.tone}`}>
          <Field stamp={card().id} value={card().body.text} mark={card().id === "card.doctrine"} />
        </p>
      )}
    </Show>
  );
}

function MediaCard(props: { card: Card }) {
  return (
    <Show when={props.card.kind === "media" ? props.card : undefined}>
      {(card) => (
        <figure class="bay">
          <div class="bay-fallback">{card().body.fallback}</div>
          <figcaption>{card().body.caption}</figcaption>
        </figure>
      )}
    </Show>
  );
}

function FormCard(props: { card: Card }) {
  return (
    <Show when={props.card.kind === "form" ? props.card : undefined}>
      {(card) => (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (!(form instanceof HTMLFormElement)) return;
            const data = new FormData(form);
            const plate = card();
            if (bridge.deck.connected) {
              const payload: Record<string, string> = {};
              for (const field of plate.body.fields) payload[field.name] = String(data.get(field.name) ?? "");
              void bridge.pushPipe(plate.body.pipe, payload).then((issues) => {
                if (issues.length === 0) form.reset();
              });
              return;
            }
            const title = String(data.get("title") ?? "");
            const detail = String(data.get("detail") ?? "");
            const issues = bridge.fileLine(title, detail);
            if (issues.length === 0) form.reset();
          }}
        >
          <p class="pipe">{card().body.pipe}</p>
          <For each={card().body.fields}>
            {(field) => (
              <label>
                <span>{field.label}</span>
                <input
                  name={field.name}
                  type="text"
                  required={field.required}
                  onInput={(event) => {
                    const input = event.currentTarget;
                    if (!(input instanceof HTMLInputElement)) return;
                    const points = [...input.value];
                    if (points.length > field.max) input.value = points.slice(0, field.max).join("");
                  }}
                  autocomplete="off"
                />
              </label>
            )}
          </For>
          <button type="submit">{card().body.submit}</button>
        </form>
      )}
    </Show>
  );
}
