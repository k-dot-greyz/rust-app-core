import { createMemo, createProjection, createStore, deep, reconcile, snapshot } from "solid-js";
import { cardChanges } from "../cards/delta.ts";
import { freshDeck } from "../cards/deck.ts";
import type { Card, Issue, Tone } from "../cards/types.ts";
import { KINDS } from "../cards/types.ts";
import { checkPlain, issuesText, validateDeck } from "../cards/validate.ts";

const MARK = " ·";
const TAPE_MAX = 8;

export type TapeLine = {
  id: string;
  text: string;
};

type DeckState = {
  cards: Card[];
  selectedId: string;
  fault: string | null;
  log: TapeLine[];
};

export type DeckBridge = {
  deck: DeckState;
  kindCounts: { id: string; count: number }[];
  preview: () => string;
  load: (raw: unknown) => Issue[];
  select: (id: string) => void;
  setGauge: (id: string, value: number) => void;
  nudgeLine: () => void;
  offerBadKind: () => void;
  fileLine: (title: string, detail: string) => Issue[];
};

export function createDeckBridge(initial: Card[]): DeckBridge {
  let serial = 0;
  const [deck, setDeck] = createStore<DeckState>(
    {
      cards: initial,
      selectedId: initial.find((card) => card.kind === "gauge")?.id ?? initial[0]?.id ?? "",
      fault: null,
      log: [],
    },
    { name: "deck" },
  );

  const kindCounts = createProjection(
    () =>
      KINDS.map((kind) => ({
        id: kind,
        count: deck.cards.filter((card) => card.kind === kind).length,
      })),
    KINDS.map((kind) => ({ id: kind, count: 0 })),
    { key: "id", name: "kind-counts" },
  );

  const preview = createMemo(() => {
    deep(deck.cards);
    const card = deck.cards.find((item) => item.id === deck.selectedId);
    return JSON.stringify(card ? snapshot(card) : null, null, 2);
  });

  function note(draft: DeckState, text: string) {
    draft.log.unshift({ id: `note-${(serial += 1)}`, text });
    if (draft.log.length > TAPE_MAX) draft.log.pop();
  }

  function accept(draft: DeckState, raw: unknown, tape?: string) {
    const result = validateDeck(raw);
    if (!result.ok) {
      draft.fault = issuesText(result.issues);
      return;
    }
    const changes = cardChanges(snapshot(draft.cards), result.cards);
    reconcile(result.cards, "id")(draft.cards);
    draft.fault = null;
    if (!draft.cards.some((card) => card.id === draft.selectedId)) {
      draft.selectedId = draft.cards[0]?.id ?? "";
    }
    if (tape) note(draft, `${tape} ${changes.join(", ") || "no leaf changes"}`);
  }

  return {
    deck,
    kindCounts,
    preview,
    load(raw) {
      const result = validateDeck(raw);
      if (!result.ok) {
        setDeck((draft) => {
          draft.fault = issuesText(result.issues);
        });
        return result.issues;
      }
      setDeck((draft) => {
        reconcile(result.cards, "id")(draft.cards);
        draft.fault = null;
        draft.log.splice(0, draft.log.length);
        const gauge = result.cards.find((card) => card.kind === "gauge");
        draft.selectedId = gauge?.id ?? result.cards[0]?.id ?? "";
      });
      return [];
    },
    select(id) {
      setDeck((draft) => {
        if (draft.cards.some((card) => card.id === id)) draft.selectedId = id;
      });
    },
    setGauge(id, value) {
      if (!Number.isFinite(value)) return;
      const next = Math.max(0, Math.min(100, Math.round(value)));
      setDeck((draft) => {
        const card = draft.cards.find((item) => item.id === id);
        if (!card || card.kind !== "gauge") return;
        card.body.value = next;
      });
    },
    nudgeLine() {
      setDeck((draft) => {
        const next = structuredClone(snapshot(draft.cards));
        const list = next.find((card) => card.id === "card.tracked");
        if (list?.kind !== "list") return;
        const item = list.body.items[0];
        if (!item) return;
        if (item.detail.endsWith(MARK)) {
          item.detail = item.detail.slice(0, -MARK.length);
        } else {
          const marked = `${item.detail}${MARK}`;
          if ([...marked].length > 180) {
            draft.fault = "Cannot reconcile the line: the marker would exceed the 180 code point detail limit.";
            return;
          }
          item.detail = marked;
        }
        accept(draft, next, "Reconciled one list line.");
      });
    },
    offerBadKind() {
      setDeck((draft) => {
        const next = structuredClone(snapshot(draft.cards)) as { kind: string }[];
        const first = next[0];
        if (!first) return;
        first.kind = "sparkle";
        accept(draft, next);
      });
    },
    fileLine(title, detail) {
      const issues: Issue[] = [];
      const titleIssue = checkPlain(title, 1, 48);
      if (titleIssue) issues.push({ path: "/title", detail: titleIssue });
      const detailIssue = checkPlain(detail, 0, 80);
      if (detailIssue) issues.push({ path: "/detail", detail: detailIssue });
      if (issues.length > 0) {
        setDeck((draft) => {
          draft.fault = issuesText(issues);
        });
        return issues;
      }
      setDeck((draft) => {
        const list = draft.cards.find((card) => card.id === "card.trace");
        if (list?.kind !== "list") {
          issues.push({ path: "/card.trace", detail: "expected a trace list" });
        } else if (list.body.items.length >= 24) {
          issues.push({ path: "/body/items", detail: "a list holds at most 24" });
        } else {
          const tone: Tone = list.body.items[0]?.tone ?? "ink";
          list.body.items.push({ title, detail, tone });
          note(draft, "Filed a line on the trace.");
        }
        draft.fault = issues.length > 0 ? issuesText(issues) : null;
      });
      return issues;
    },
  };
}

export const bridge = createDeckBridge(freshDeck());
