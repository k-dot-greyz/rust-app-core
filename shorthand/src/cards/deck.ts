import type { Card } from "./types.ts";

export const FIXTURE: Card[] = [
  {
    id: "card.hero",
    kind: "hero",
    rev: 1,
    title: "Kind carries the variant.",
    body: {
      kicker: "Solid 2.0.3",
      lede: "This deck is the shorthand, running. Drag Integrity and one copper count moves in both columns. Reconcile one line changes a single list detail. This page does not call Hull.",
    },
  },
  {
    id: "card.roots",
    kind: "stat",
    rev: 1,
    title: "Second root",
    body: {
      label: "Islands",
      value: 2,
      unit: "roots",
      hint: "The inspector is another render, reading this store.",
    },
  },
  {
    id: "card.gauge",
    kind: "gauge",
    rev: 1,
    title: "One field",
    body: {
      label: "Integrity",
      value: 64,
      caption: "Copper digits count how many times that node ran. The hero line should stay put.",
    },
  },
  {
    id: "card.tracked",
    kind: "list",
    rev: 1,
    title: "What held",
    body: {
      items: [
        {
          title: "Cards hold the variants",
          detail: "kind is the union. The shell only renders it.",
          tone: "sea",
        },
        {
          title: "Setup runs once",
          detail: "The function binds fields to nodes, then it stands aside.",
          tone: "copper",
        },
        {
          title: "Projection is in 2.0",
          detail: "createProjection derives a store and reconciles by id.",
          tone: "sea",
        },
        {
          title: "Roots stay separate",
          detail: "Two render calls. One module. Context does not cross.",
          tone: "ink",
        },
      ],
    },
  },
  {
    id: "card.tighten",
    kind: "list",
    rev: 1,
    title: "Tighten the prompt",
    body: {
      items: [
        {
          title: "Pin the Solid 2 adapter",
          detail: "npm @astrojs/solid-js on 21 Nov 2026 is 7.1.6, a Solid 1 peer. Solid 2 needs @8.",
          tone: "deny",
        },
        {
          title: "Import the 2.0 paths",
          detail: "createStore and reconcile live in solid-js. render and dynamic live in @solidjs/web.",
          tone: "deny",
        },
        {
          title: "Store plain objects",
          detail: "A class in the store hides methods from the proxy, and JSON drops them.",
          tone: "copper",
        },
        {
          title: "Stay inside the kinds",
          detail: "hero, stat, list, form, note, gauge, media. Unknown fields are refused.",
          tone: "ink",
        },
      ],
    },
  },
  {
    id: "card.doctrine",
    kind: "note",
    rev: 1,
    title: "Doctrine",
    body: {
      tone: "ink",
      text: "The component function is the setup. It runs once. Keep classes out of the store: Solid tracks fields on plain objects, and a prototype method disappears in JSON. Read props in the JSX. A destructured prop keeps the first value and the binding goes quiet. Import stores from solid-js. The renderer is @solidjs/web.",
    },
  },
  {
    id: "card.plate",
    kind: "form",
    rev: 1,
    title: "File a line",
    body: {
      pipe: "ingress.trace",
      submit: "File it",
      fields: [
        { name: "title", label: "Line", type: "text", required: true, max: 48 },
        { name: "detail", label: "Detail", type: "text", required: false, max: 80 },
      ],
    },
  },
  {
    id: "card.trace",
    kind: "list",
    rev: 1,
    title: "Filed",
    body: {
      items: [
        {
          title: "Night shift",
          detail: "The pass is local. Nothing has been sent.",
          tone: "ink",
        },
      ],
    },
  },
  {
    id: "card.bay",
    kind: "media",
    rev: 1,
    title: "Bay 3",
    body: {
      medium: "video",
      src: "",
      caption: "Empty source. The plate stays dark.",
      fallback: "No reel loaded. The hatch does not turn white.",
    },
  },
];

export function freshDeck(): Card[] {
  return structuredClone(FIXTURE);
}
