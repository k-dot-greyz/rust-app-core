# Hull shorthand

## Story

As a person wiring a deck of JSON cards, I want one page that shows the corrected Solid 2 shorthand and a live pass of hull cards, so I can see that `kind` picks the shell, that two render roots share a store, and that one changed field is the only paint that moves.

## MVP flow

1. Open the pass and read the hero.
2. Drag Integrity in the inspector. Its copper count moves. The hero line stays on its first paint.
3. Reconcile one list line. That line's count moves. The hero proxy stays.
4. Offer an unknown kind. Read the fault. The deck stays.
5. File a line through the form. It shows on the trace list and in the other island.
6. Copy the prompt.

## Done when

- `pnpm test` passes the card contract, the reconcile identity check, the two-island pass, the supply allow-list, and the prompt pins.
- The page runs on port 4483.
- The deck and the inspector are two `render()` roots over one module store.
