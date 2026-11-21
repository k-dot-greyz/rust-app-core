# rust-app-core

Public reference template for a Rust web app core. The shell you run is called Hull. Cards are JSON. Pipes move them. Egress waits on a permit, and the dry dock does not own a socket.

Roast it. The vocabulary is closed on purpose, the dependency list is empty, and `SPEC.md` is the map of what shipped versus what is still a daydream. Issues and pull requests are the point.

Agents pick this up from `agent-flow/references/cursor/rust-app-core.md`. That file is the copy that belongs on the dev-master instruction path.

## Quickstart

Rust **1.99.1** is pinned in `rust-toolchain.toml`. No crates.

```bash
rustup toolchain install 1.99.1 --profile minimal --component rustfmt,clippy
rustup target add wasm32-unknown-unknown
cargo test
cargo run
```

The pass ships on the night shift. Deck is the panel. Pretext (`?surface=pretext`) is the native text surface, and it is also the fallback when the deck is stripped off. An empty media bay stays dark instead of becoming a broken white player. Copy snapshot builds a local debug bundle and does not send it. File a line on the pass only if you mean to.

Open the pass, send a plate through `ingress.pass`, then knock on the airlock. The metadata address is denied even if a policy file tries to allow it. A permit is a record. Nothing is sent.

## Run it

The pass is at `http://127.0.0.1:4471`. `PORT` and `HOST` change the bind. `HULL_MODULES` points at the module directory (default `modules/`). Set `HULL_WATCH=0` to stop the file poll.

```bash
cargo test
```

Drop a card in `modules/cards`, a pipe in `modules/pipes`, and the dev server picks them up. A file that does not validate leaves the last good bundle up and shows a fault.

## The shape

| Idea | Where it lives |
| --- | --- |
| Astro, without Astro | Server-rendered HTML. The document is a real form. `assets/island.js` only applies a view model. |
| Vite, without Vite | `modules/` is the graph. The server polls mtimes and swaps a valid bundle. |
| Sysex delta | `GET /api/sync/handshake`, then `GET /api/sync/delta?cursor=` for changed paths only. |
| Airlock | `src/airlock.rs`. Hull class beats the allowlist. `dry_dock` consumes a single-use permit and sets `sent` to false. |

`Cargo.toml` has an empty dependency list. The codec, the HTTP server, and the schema are in the tree. The blueprint, including what got cut, is `SPEC.md`.

## Pipes

`ingress.pass` appends a plate and then calls `internal.tally`. Internal pipes are not pushable from HTTP. `egress.probe` takes one of `unlisted`, `metadata`, `plain-http`, `allowlisted`. The destination is a server table, not a field in the body. Unknown fields are refused.

JSON writes need `X-Airlock-Intent: 1`. A form post with `Sec-Fetch-Site: cross-site` is refused.

## Publish port

cursor.app runs web `Request` handlers, not this TCP server. `app/[[...path]]/route.js` loads `wasm/hull.wasm` and calls the same `dispatch`. Next is the port. The crate is still the product.

```bash
cargo build --release --target wasm32-unknown-unknown --lib
cp target/wasm32-unknown-unknown/release/hull.wasm wasm/hull.wasm
npm run smoke
npm run build
```

A cold start on the host plates a fresh service. The wasm instance keeps state until the isolate goes away. Say so if you were expecting a database. There isn't one.

## Modules

Kinds are `hero`, `stat`, `list`, `form`, `note`, `gauge`, `media`. Steps are `append-list`, `inc-stat`, `set-gauge`, `airlock`. Both sets are closed and matched exhaustively. New behavior is a new file in that vocabulary, not a new interpreter.

## Shorthand

`shorthand/` is a Solid 2.0.3 candidate for the view `assets/island.js` hand-rolls. Same card kinds. The hull does not serve it, and `Cargo.toml` stays empty. `shorthand/CONTEXT.md` is the prompt. `shorthand/docs/handbook.md` is the companion. From that directory: `pnpm install`, `pnpm test`, `pnpm dev`. The dev server is its own port. It opens no socket.
