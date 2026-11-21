export const chrome = {
  select: "Select",
  emptyTape: "The tape is empty.",
  copy: "Copy the prompt",
  copied: "On the clipboard.",
  clipboardBlocked: "Clipboard stayed shut. Select the prompt and copy it yourself.",
  surfaceToPretext: "Pretext",
  surfaceToDeck: "Deck",
  promptTitle: "Prompt",
  countsTitle: "Projection",
  tapeTitle: "Tape",
  jsonTitle: "Selected card",
} as const;

export const drills = [
  { id: "nudge", label: "Reconcile one line" },
  { id: "bad", label: "Offer an unknown kind" },
] as const;

export type DrillId = (typeof drills)[number]["id"];
