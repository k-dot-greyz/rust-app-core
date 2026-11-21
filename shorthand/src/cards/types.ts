export const KINDS = ["hero", "stat", "list", "form", "note", "gauge", "media"] as const;
export type Kind = (typeof KINDS)[number];

export const TONES = ["ink", "copper", "sea", "deny"] as const;
export type Tone = (typeof TONES)[number];

export const MEDIA = ["video", "audio", "frame"] as const;
export type Medium = (typeof MEDIA)[number];

export type ListItem = {
  title: string;
  detail: string;
  tone: Tone;
};

export type FormField = {
  name: string;
  label: string;
  type: "text";
  required: boolean;
  max: number;
};

export type HeroBody = { kicker?: string; lede: string };
export type StatBody = { label: string; value: number; unit: string; hint: string };
export type ListBody = { items: ListItem[] };
export type FormBody = { pipe: string; submit: string; fields: FormField[] };
export type NoteBody = { text: string; tone: Tone };
export type GaugeBody = { label: string; value: number; caption: string };
export type MediaBody = { medium: Medium; src?: string; caption: string; fallback: string };

type CardBase<K extends Kind, B> = {
  id: string;
  kind: K;
  rev: number;
  title: string;
  body: B;
};

export type HeroCard = CardBase<"hero", HeroBody>;
export type StatCard = CardBase<"stat", StatBody>;
export type ListCard = CardBase<"list", ListBody>;
export type FormCard = CardBase<"form", FormBody>;
export type NoteCard = CardBase<"note", NoteBody>;
export type GaugeCard = CardBase<"gauge", GaugeBody>;
export type MediaCard = CardBase<"media", MediaBody>;

export type Card = HeroCard | StatCard | ListCard | FormCard | NoteCard | GaugeCard | MediaCard;

export type Issue = {
  path: string;
  detail: string;
};

export type DeckResult = { ok: true; cards: Card[] } | { ok: false; issues: Issue[] };

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
