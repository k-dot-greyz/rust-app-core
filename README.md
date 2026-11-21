# rust-app-core

A reference template for a hosted app. Build the next app on this tree. Lift a component into another project. Or reimplement the architecture and keep the contract in `SPEC.md`.

The shell you run is called Hull. It is the sample, so you can see the shape before you add a feature of your own. Cards are JSON. Pipes move them. Egress waits on a permit, and the dry dock does not own a socket.

## What you do with it

Three uses. Pick one, or mix them.

1. **Build on it.** Fork or copy the tree. Replace the sample cards in `modules/` with the ones your app needs. The pass at `http://127.0.0.1:4471` is the demo of the architecture. Your app is what you put in its place.
2. **Reuse a component.** Take a card kind, a pipe, the airlock, the delta handshake, the module loader, or the night canvas into another tree. `SPEC.md` is the contract for that piece. The files are one implementation of it.
3. **Reimplement the architecture.** Write it again in another language or another UI. Keep JSON cards, a closed set of kinds, named pipes, a default-deny egress check, and sparse sync. The Rust here is one way to meet that contract.

`Cargo.toml` has an empty dependency list. The way to take a piece is to copy the files, or to rewrite them against `SPEC.md`.

Roast it. The vocabulary is closed on purpose. `SPEC.md` maps what shipped against what is still a daydream. Issues and pull requests are the point.

## Words

Read this once. The rest of the repo uses the short names.

- **Hull.** The Rust server in this repo. `cargo run` listens on `127.0.0.1:4471`.
- **Card.** One JSON record. `kind` is a closed set: `hero`, `stat`, `list`, `form`, `note`, `gauge`, `media`.
- **Pass.** The sample page: the deck of cards shipped in `modules/`.
- **Plate.** One line you submit through the form on that page.
- **Pipe.** A named JSON workflow. `ingress.pass` adds a plate. `ingress.trace` files a short note. `egress.probe` asks the airlock.
- **Airlock.** The egress check. The default is deny.
- **Dry dock.** A permit is recorded and `sent` stays false. Nothing leaves the machine.
- **Deck.** The panel. **Pretext** is the same state as plain text (`?surface=pretext`), and it is also what remains if the panel paint throws.
- **Shorthand.** The separate Solid 2 page in `shorthand/`. It does not talk to Hull.

Agents pick this up from `agent-flow/references/cursor/rust-app-core.md`. That file is the copy that belongs on the dev-master instruction path.

## Quickstart

Rust **1.99.1** is the floor (`Cargo.toml` `rust-version`). `rust-toolchain.toml` tracks stable, and `scripts/rc-check.sh` refuses an older compiler. No crates.

```bash
rustup toolchain install stable --profile minimal --component rustfmt,clippy
rustup target add wasm32-unknown-unknown
cargo test
cargo run
```

The pass ships on the night shift. Deck is the panel. Pretext (`?surface=pretext`) is the native text surface, and it is also the fallback when the deck is stripped off. An empty media bay stays dark instead of becoming a broken white player. Copy snapshot builds a local debug bundle and does not send it. File a line on the pass only if you mean to.

Open the pass, send a plate through `ingress.pass`, then knock on the airlock. The metadata address is denied even if a policy file tries to allow it. A permit is a record. Nothing is sent.

## Run it

The pass is at `http://127.0.0.1:4471`. That scheme is the right one: loopback never leaves the machine, and `http://127.0.0.1` is already a secure context. `PORT` and `HOST` change the bind. `PORT=0` asks the OS for a free port. If `4471` is already taken, the process does that on its own and prints the URL that opened. `HOST` defaults to `127.0.0.1`. `HOST=0.0.0.0` listens on every interface, with no login. `HULL_MODULES` points at the module directory (default `modules/`). Set `HULL_WATCH=0` to stop the file poll.

```bash
cargo test
```

Drop a card in `modules/cards`, a pipe in `modules/pipes`, and the dev server picks them up. A file that does not validate leaves the last good bundle up and shows a fault.

## Schemes and ports

A URL that names a host other than loopback is `https://`, unless it is an intentional denial fixture. The metadata probe and the plain-HTTP probe stay on `http://` so the airlock can refuse them. `modules/policy.json` sets `https_only: true`.

Loopback dev servers stay `http://`. Do not add a TLS crate, and do not ship a self-signed certificate for someone to click through. The published host terminates TLS. `scripts/wasm-smoke.mjs` uses `https://hull.local/...` for that reason. Dispatch still reads only the path.

Preferred ports stay uncommon and stable: hull `4471`, shorthand `4483`. They are not `3000`, `5173`, or `8080`. If the preferred port is taken, the process binds one the OS assigns and prints that URL.

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

`shorthand/` is a Solid 2.0.3 candidate for the view `assets/island.js` hand-rolls. Same card kinds. The hull does not serve that directory, and `Cargo.toml` stays empty. `pnpm dev` prefers `http://127.0.0.1:4483` and proxies `/api` to the hull at `http://127.0.0.1:4471`. Set `HULL_ORIGIN` to point the proxy somewhere else. When the hull is up, the page takes its deck and posts the form card's pipe. When the hull is down, the page keeps the fixture deck and files a line locally. `shorthand/CONTEXT.md` is the prompt. `shorthand/docs/handbook.md` is the companion. From that directory: `pnpm install`, `pnpm test`, `pnpm dev`. A busy port walks to the next free one, and Vite prints the URL that opened. `HOST=0.0.0.0` opens that dev server on every interface, with no login. That is a listening socket on the machine running Vite. The hull does not open outbound sockets. There is no TLS plugin.

## Release check

`scripts/rc-check.sh` runs `cargo test`, then `pnpm test` and `pnpm typecheck` in `shorthand/`. `cargo test` stays the Rust suite and does not call Node. GitHub runs that script on pull requests and on `main` (`.github/workflows/rc.yml`). The hull does not serve the shorthand, and `assets/island.js` stays the view on the pass. That is the release candidate: a pure Rust core, with the Solid 2 deck as the island candidate beside it.

The reference is this repository. `https://rust-core-app-test-solid2.apps.grok.bot` is an earlier snapshot. This candidate does not republish that page.

## Session record

`docs/decision-log.md` is the decision record for the 21 Nov 2026 session. `docs/lessons.md` is what a later pass should keep. `shorthand/docs/open-loops.md` lists what the candidate decided and what it still watches.
