import { createMemo, createProjection, createStore, deep, reconcile, snapshot } from "solid-js";
import { cardChanges } from "../cards/delta.ts";
import { freshDeck } from "../cards/deck.ts";
import type { Card, Issue, Tone } from "../cards/types.ts";
import { KINDS } from "../cards/types.ts";
import { checkPlain, issuesText, validateDeck } from "../cards/validate.ts";

const MARK = " ·";
const TAPE_MAX = 8;
const NOTE_MAX = 240;
const POLL_OK_MS = 3000;
const POLL_BACKOFF_MS = 1000;
const POLL_CAP_MS = 8000;

export type TapeLine = {
  id: string;
  text: string;
};

export type HullSeal = {
  word: string;
  detail: string;
};

export type HullView = {
  epoch?: string;
  cursor?: number;
  seal?: HullSeal;
  notice?: string;
  fault?: string | null;
  deck: unknown[];
};

type DeckState = {
  cards: Card[];
  selectedId: string;
  fault: string | null;
  log: TapeLine[];
  epoch: string;
  cursor: number;
  seal: HullSeal;
  connected: boolean;
};

export type DeckBridge = {
  deck: DeckState;
  kindCounts: { id: string; count: number }[];
  preview: () => string;
  load: (raw: unknown) => Issue[];
  applyView: (view: HullView) => boolean;
  syncNow: () => Promise<boolean>;
  startSync: () => () => void;
  select: (id: string) => void;
  setGauge: (id: string, value: number) => void;
  nudgeLine: () => void;
  offerBadKind: () => void;
  pushPipe: (pipeId: string, payload: Record<string, string>) => Promise<Issue[]>;
  fileLine: (title: string, detail: string) => Issue[];
};

export function createDeckBridge(initial: Card[], baseUrl = ""): DeckBridge {
  let serial = 0;
  let inflight = 0;
  let backoff = POLL_BACKOFF_MS;
  let pollNoted = false;
  const [deck, setDeck] = createStore<DeckState>(
    {
      cards: initial,
      selectedId: initial.find((card) => card.kind === "gauge")?.id ?? initial[0]?.id ?? "",
      fault: null,
      log: [],
      epoch: "",
      cursor: -1,
      seal: { word: "LOCAL", detail: "Hull offline. The fixture deck is on the counter." },
      connected: false,
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
    draft.log.unshift({ id: `note-${(serial += 1)}`, text: [...text].slice(0, NOTE_MAX).join("") });
    if (draft.log.length > TAPE_MAX) draft.log.pop();
  }

  function rememberSelection(draft: DeckState) {
    if (draft.cards.some((card) => card.id === draft.selectedId)) return;
    const gauge = draft.cards.find((card) => card.kind === "gauge");
    draft.selectedId = gauge?.id ?? draft.cards[0]?.id ?? "";
  }

  function applyView(view: HullView): boolean {
    if (!view || typeof view !== "object" || !Array.isArray(view.deck)) return false;
    const nextEpoch = typeof view.epoch === "string" ? view.epoch : deck.epoch;
    const epochChanged = nextEpoch.length > 0 && nextEpoch !== deck.epoch;
    const seen = epochChanged ? -1 : deck.cursor;
    if (typeof view.cursor === "number" && view.cursor < seen) return true;
    if (
      deck.connected &&
      !epochChanged &&
      typeof view.cursor === "number" &&
      view.cursor === deck.cursor
    ) {
      return true;
    }
    const validated = validateDeck(view.deck);
    if (!validated.ok) {
      setDeck((draft) => {
        draft.fault = `Hull view rejected: ${issuesText(validated.issues)}`;
      });
      return false;
    }
    setDeck((draft) => {
      const changes = cardChanges(snapshot(draft.cards), validated.cards);
      reconcile(validated.cards, "id")(draft.cards);
      draft.epoch = nextEpoch;
      if (typeof view.cursor === "number") draft.cursor = view.cursor;
      if (view.seal && typeof view.seal.word === "string") {
        draft.seal = { word: view.seal.word, detail: view.seal.detail ?? "" };
      }
      draft.fault = typeof view.fault === "string" && view.fault.length > 0 ? view.fault : null;
      draft.connected = true;
      rememberSelection(draft);
      if (changes.length > 0) note(draft, `Hull sync c${draft.cursor}: ${changes.join(", ")}`);
      else if (typeof view.notice === "string" && view.notice.length > 0) note(draft, view.notice);
    });
    return true;
  }

  async function syncNow(): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/api/view`, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as HullView;
      if (!applyView(body)) throw new Error("Invalid view payload");
      backoff = POLL_BACKOFF_MS;
      pollNoted = false;
      return true;
    } catch {
      const firstMiss = !pollNoted;
      pollNoted = true;
      setDeck((draft) => {
        draft.connected = false;
        if (firstMiss) note(draft, "Holding the last good view. The pass did not answer.");
      });
      return false;
    }
  }

  function startSync(): () => void {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = (wait: number) => {
      if (stopped) return;
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        void tick();
      }, wait);
    };
    const tick = async () => {
      if (stopped) return;
      if ((typeof document !== "undefined" && document.hidden) || inflight > 0) {
        schedule(pollNoted ? backoff : POLL_OK_MS);
        return;
      }
      const ok = await syncNow();
      const wait = ok ? POLL_OK_MS : backoff;
      if (!ok) backoff = Math.min(POLL_CAP_MS, backoff * 2);
      schedule(wait);
    };
    void tick();
    return () => {
      stopped = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }

  async function pushPipe(pipeId: string, payload: Record<string, string>): Promise<Issue[]> {
    inflight += 1;
    try {
      const response = await fetch(`${baseUrl}/api/pipes/${encodeURIComponent(pipeId)}/push`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "x-airlock-intent": "1",
        },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as {
        view?: HullView;
        error?: { detail?: string };
      } | null;
      if (!response.ok) {
        const detail = body?.error?.detail ?? `Hull refused pipe ${pipeId} (${response.status}).`;
        setDeck((draft) => {
          draft.fault = detail;
        });
        return [{ path: `/pipes/${pipeId}`, detail }];
      }
      if (body?.view && !applyView(body.view)) {
        return [{ path: `/pipes/${pipeId}`, detail: "Hull returned a deck this page refused." }];
      }
      const hullFault = typeof body?.view?.fault === "string" && body.view.fault.length > 0;
      setDeck((draft) => {
        if (!hullFault) draft.fault = null;
        note(draft, `Pushed ${pipeId} to hull.`);
      });
      return [];
    } catch {
      const detail = "The hull missed a beat. The plate is still on the counter.";
      setDeck((draft) => {
        draft.connected = false;
        draft.fault = detail;
      });
      return [{ path: `/pipes/${pipeId}`, detail }];
    } finally {
      inflight = Math.max(0, inflight - 1);
    }
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
        draft.epoch = "";
        draft.cursor = -1;
        draft.connected = false;
        draft.seal = { word: "LOCAL", detail: "Hull offline. The fixture deck is on the counter." };
        const gauge = result.cards.find((card) => card.kind === "gauge");
        draft.selectedId = gauge?.id ?? result.cards[0]?.id ?? "";
      });
      return [];
    },
    applyView,
    syncNow,
    startSync,
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
    pushPipe,
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
      const traceCard = deck.cards.find((card) => card.id === "card.trace");
      if (traceCard?.kind !== "list") {
        const missing: Issue = { path: "/card.trace", detail: "expected a trace list" };
        setDeck((draft) => {
          draft.fault = issuesText([missing]);
        });
        return [missing];
      }
      if (traceCard.body.items.length >= 24) {
        const cap: Issue = { path: "/body/items", detail: "a list holds at most 24" };
        setDeck((draft) => {
          draft.fault = issuesText([cap]);
        });
        return [cap];
      }
      const tone: Tone = traceCard.body.items[0]?.tone ?? "ink";
      setDeck((draft) => {
        const list = draft.cards.find((card) => card.id === "card.trace");
        if (list?.kind !== "list" || list.body.items.length >= 24) return;
        list.body.items.push({ title, detail, tone });
        draft.fault = null;
        note(draft, "Filed a line on the trace.");
      });
      return [];
    },
  };
}

export const bridge = createDeckBridge(freshDeck());
