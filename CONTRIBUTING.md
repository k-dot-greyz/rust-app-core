# Contributing

This repository is a reference template. A change should stay useful to the next person who builds on the tree, reuses one component, or reimplements the architecture from `SPEC.md`.

The contract is `SPEC.md`. The human quickstart is `README.md`. Agents read `agent-flow/references/cursor/rust-app-core.md`. This page is the habit those three already state, so a change lands in the same place a stranger will read it.

Keep the three uses obvious. The README says them first: build on this tree, reuse a component, or reimplement the architecture. A new file, a new card, or a port to another stack should still read as one of those. The sample pass is the demo. It is the thing a fork replaces.

## Schemes

A URL that names a host other than loopback is `https://`. The exception is an intentional denial fixture: the metadata probe and the plain-HTTP probe stay on `http://`, and `modules/policy.json` keeps `https_only: true`.

Loopback dev servers stay `http://127.0.0.1`. That address is a secure context, and the bytes never leave the machine. Do not add a TLS crate. `Cargo.toml` has an empty dependency list. Do not ship a self-signed certificate for someone to click through.

The published host terminates TLS. `scripts/wasm-smoke.mjs` uses `https://hull.local/...` for that reason. `lib/hull.mjs` still dispatches on the path alone.

## Ports

Preferred ports stay uncommon and stable so the README stays true.

- Hull: `4471`. `HOST` defaults to `127.0.0.1`. `PORT=0`, or a taken `4471`, asks the OS for a free port. The process prints the URL that opened.
- Shorthand: `4483`, on `127.0.0.1`. A busy port walks to the next free one. Vite prints that URL. There is no TLS plugin.
- Neither is `3000`, `5173`, or `8080`.
- `HOST=0.0.0.0` listens on every interface, with no login. It is an opt-in.

## What stays put

New behavior is a new file in the closed vocabulary: card kinds and pipe steps listed in `SPEC.md`. A bad module file must not replace the last good bundle. The dry dock records a permit and leaves `sent` false. The night canvas stays `#0c0b0a`.

```bash
cargo test
cargo clippy --all-targets -- -D warnings
```

From `shorthand/`: `pnpm test` and `pnpm typecheck`. `cargo test` does not run that suite.
