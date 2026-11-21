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

  function note(text: string) {
    setDeck((draft) => {
      draft.log.unshift({ id: `note-${(serial += 1)}`, text });
      if (draft.log.length > TAPE_MAX) draft.log.pop();
    });
  }

  function accept(raw: unknown, tape?: string): Issue[] {
    const result = validateDeck(raw);
    if (!result.ok) {
      setDeck((draft) => {
        draft.fault = issuesText(result.issues);
      });
      return result.issues;
    }
    const changes = cardChanges(snapshot(deck.cards), result.cards);
    setDeck((draft) => {
      reconcile(result.cards, "id")(draft.cards);
      draft.fault = null;
      if (!draft.cards.some((card) => card.id === draft.selectedId)) {
        draft.selectedId = draft.cards[0]?.id ?? "";
      }
    });
    if (tape) note(`${tape} ${changes.join(", ") || "no leaf changes"}`);
    return [];
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
      const next = Math.max(0, Math.min(100, Math.round(value)));
      setDeck((draft) => {
        const card = draft.cards.find((item) => item.id === id);
        if (!card || card.kind !== "gauge") return;
        card.body.value = next;
      });
    },
    nudgeLine() {
      const next = structuredClone(snapshot(deck.cards));
      const list = next.find((card) => card.id === "card.tracked");
      if (!list || list.kind !== "list") return;
      const item = list.body.items[0];
      if (!item) return;
      item.detail = item.detail.endsWith(MARK) ? item.detail.slice(0, -MARK.length) : `${item.detail}${MARK}`;
      accept(next, "Reconciled one list line.");
    },
    offerBadKind() {
      const next = structuredClone(snapshot(deck.cards)) as { kind: string }[];
      const first = next[0];
      if (!first) return;
      first.kind = "sparkle";
      accept(next);
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
      let filed = false;
      setDeck((draft) => {
        const list = draft.cards.find((card) => card.id === "card.trace");
        if (!list || list.kind !== "list") return;
        if (list.body.items.length >= 24) {
          draft.fault = "/body/items: a list holds at most 24";
          return;
        }
        const tone: Tone = list.body.items[0]?.tone ?? "ink";
        list.body.items.push({ title, detail, tone });
        draft.fault = null;
        filed = true;
      });
      if (filed) note("Filed a line on the trace.");
      return [];
    },
  };
}

export const bridge = createDeckBridge(freshDeck());
