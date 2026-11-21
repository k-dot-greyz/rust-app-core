export const chrome = {
  select: "Select",
  skipToDeck: "Skip to the deck",
  skipToPretext: "Skip to Pretext",
  emptyTape: "The tape is empty.",
  copy: "Copy the prompt",
  copied: "On the clipboard.",
  clipboardBlocked: "Clipboard stayed shut. Select the prompt and copy it yourself.",
  surfaceToPretext: "Pretext",
  surfaceToDeck: "Deck",
  promptTitle: "Prompt",
  countsTitle: "Projection",
  countsHint: "Counts of cards by kind.",
  tapeTitle: "Tape",
  tapeHint: "Paths that changed on the last write.",
  drillsHint: "Reconcile one line toggles a mark on one list detail. Offer an unknown kind is refused, and the deck stays.",
  jsonTitle: "Selected card",
} as const;

export const drills = [
  { id: "nudge", label: "Reconcile one line" },
  { id: "bad", label: "Offer an unknown kind" },
] as const;

export type DrillId = (typeof drills)[number]["id"];
