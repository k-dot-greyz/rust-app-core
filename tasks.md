# Hull

## Story

As a developer starting a hosted app, I want a reference template I can build on, reuse a piece from, or reimplement, so the cards, pipes, schema, and shut airlock are a shape I can see before I add a feature of my own.

## MVP flow

1. Open the shell and read the pass.
2. Send a plate through `ingress.pass`.
3. Watch the list, the cover count, and the delta tape change.
4. Run the four airlock probes and read four different verdicts.
5. Fetch `/api/schema` and `/api/sync/handshake`.

The Solid 2 shorthand in `shorthand/` is a sibling pass. The release candidate keeps it that way. The hull does not serve that directory, and it does not replace `assets/island.js`. `scripts/rc-check.sh` runs `cargo test` and then the shorthand suite. `cargo test` itself stays free of Node.

## Done when

- `cargo test` is green on Rust 1.99 with zero crates.
- The page works with and without the island script.
- A metadata destination is denied even if policy allows it.
- The dry dock never sets `sent` to true.
- The same wasm module answers the published host.
