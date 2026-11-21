# Decision log

21 Nov 2026. Public record of the session that took this repo from the seed template to the Solid 2 shorthand and the hull wire. Decisions live here. What a later pass should keep is `docs/lessons.md`. Work that is still open is `shorthand/docs/open-loops.md` and GitHub issues [#2](https://github.com/k-dot-greyz/rust-app-core/issues/2) through [#9](https://github.com/k-dot-greyz/rust-app-core/issues/9).

The chat transcript stays in the chat. This file is the record that belongs in the tree.

The original aim, kept as an attitude and not a deletion: this is a pure Rust core that happens to support an Astro island by design, and the shorthand is where the Solid 2.0.3 rules are implemented. The Vite deck, the hull proxy, and the wasm port stay. Nothing from those implementations was removed for the release candidate.

## This repo is a reference template

Three uses, said in the README before the vocabulary:

1. Build the next app on this tree. Replace the sample cards in `modules/`.
2. Reuse a component. A card kind, a pipe, the airlock, the delta handshake, the module loader, or the night canvas. `SPEC.md` is the contract. The files are one implementation.
3. Reimplement the architecture in another language or another UI. Keep JSON cards, closed kinds, named pipes, a default-deny egress check, and sparse sync.

`Cargo.toml` stays empty on purpose. There is no library package to import. The way to take a piece is to copy the files or rewrite them against `SPEC.md`. The running pass is the demo of that architecture. It is the thing a fork replaces.

Landed on `main` as `60c67ea`, after pull request #1 had already merged. The sample pass kicker is “Reference template”.

## Two programs, one contract

Hull is the Rust server. `cargo run` listens on `http://127.0.0.1:4471`. It server-renders the pass. `assets/island.js` only applies a view the server already computed.

`shorthand/` is a Solid 2.0.3 candidate for that island. The hull does not serve the directory. `tasks.md` keeps the shorthand out of the hull done-when. Replacing `assets/island.js` is issue [#2](https://github.com/k-dot-greyz/rust-app-core/issues/2).

The Next.js port (`app/[[...path]]/route.js`, `wasm/hull.wasm`) is a third front end. It calls the same `dispatch`. It is not the shorthand, and the shorthand is not it.

## Solid 2.0.3, pinned

Checked against solid-js 2.0.3, `@solidjs/web` 2.0.3, and `@solidjs/vite-plugin` 3.0.1.

- `createStore`, `reconcile`, `createProjection`, `createMemo`, `createSignal`, `createEffect`, and `flush` come from `"solid-js"`.
- `render` and `dynamic()` come from `"@solidjs/web"`.
- `solid-js/store` and `solid-js/web` are gone. The `<Dynamic>` component is deprecated. `dynamic()` is the function that replaced it.
- `createProjection` is a real Solid 2 primitive. An earlier note marked it “[Citation needed]”. That note was wrong. `shorthand/docs/handbook.md` says so.
- Leave these Solid 1 calls out: `createResource`, `produce`, `batch`, `startTransition`, `on`, `onMount`, `createComputed`, `createMutable`, `Suspense`, `ErrorBoundary`, `splitProps`, `mergeProps`, `unwrap`.
- This hull has no card inheritance and no held async read. Do not add `Loading` or `isPending`.
- `dynamic()` picks the shell. An exhaustive switch next to it fails the build when a kind has no shell. `Show` narrows the card union inside the shell. Switch and Match do not replace that pair. A later audit asked to drop `dynamic()`. The prompt test locks the refusal.

`shorthand/CONTEXT.md` is the prompt. `shorthand/tests/validate.test.ts` fails if that prompt drifts back into Solid 1.

## Astro waits on adapter @8

On 21 Nov 2026, npm’s `@astrojs/solid-js` was 7.1.6 and peers `solid-js` ^1.9. Solid 2 support was `@astrojs/solid-js@8`, Astro pull request 18783, and that major was not what the resolver installed. `astro add solid` on that day would have installed a Solid 1 peer.

The deck is Vite plus two `render()` roots that import one module store. That is the island boundary. Leave `astro add solid` alone until the resolver installs @8. When it does, move the pin, the prompt, and the test together. Issue [#8](https://github.com/k-dot-greyz/rust-app-core/issues/8).

## Supply chain stays small

Runtime dependencies of the shorthand are `solid-js@2.0.3` and `@solidjs/web@2.0.3`, exact pins, no caret. Playwright, Astro, and React stay out of that package. `happy-dom@21.0.4` is the test DOM. pnpm is the installer because npm 10.9.9’s arborist crashed resolving Vitest’s peers (`edgesOut`).

The install still downloads `@solidjs/signals`, `seroval`, `seroval-plugins`, and `csstype`. A client chunk from this session had no `seroval` string. The download is install cost. `tests/supply.test.ts` fails the suite if a banned runtime or a `.js` file appears under `shorthand/src`.

## HTTPS on the road, HTTP on loopback

A URL that names a host other than loopback is `https://`, except an intentional denial fixture. The metadata probe (`http://169.254.169.254`) and the plain-HTTP probe stay on `http://` so the airlock can refuse them. `modules/policy.json` keeps `https_only: true`.

Loopback dev servers stay `http://127.0.0.1`. That address is a secure context, and the bytes never leave the machine. A TLS listener would need a crate or a self-signed certificate people click through. Both were refused. `Cargo.toml` stays empty. The published host terminates TLS. `scripts/wasm-smoke.mjs` uses `https://hull.local/...` for that reason. Dispatch reads the path, not the scheme.

## Ports and the bind

Preferred ports stay uncommon and stable: hull `4471`, shorthand `4483`. They are not `3000`, `5173`, or `8080`.

- `HOST` defaults to `127.0.0.1`. `PORT=0`, or a taken `4471`, asks the OS for a free port. The process prints the URL that opened.
- A busy `4483` walks forward. Vite prints the URL. There is no TLS plugin.
- `HOST=0.0.0.0` listens on every interface, with no login. It is an opt-in. The process still prints `http://127.0.0.1:{port}` and warns on stderr.

An earlier default of `0.0.0.0` disagreed with the README. That was a bug. The README’s “no outbound socket” line is a different fact from “which interfaces the process listens on”. Both sentences stay.

## Review fixes that landed with pull request #1

Pull request #1 merged to `main` as `e652305`. The head it merged was `363dfaf`. These holes were closed before that merge, in the shorthand and, where the twin had to match, in the crate:

- Duplicate card ids are rejected.
- A missing trace and a full trace (24) return issues. The form keeps the input.
- A non-finite gauge is ignored. The reconcile drill reads the staged draft and refuses a mark past 180 Unicode code points.
- Media names `.` and `..` are refused in the TypeScript twin and in `src/schema.rs`.
- Title and detail length are counted in code points. The inputs do not use `maxlength`, which counts UTF-16 units.
- The reconcile test reads the store. The round-trip test checks order with `toStrictEqual`.
- The supply test uses `fileURLToPath`.
- The skip link follows the visible surface.

Grammar nits on the handbook were left. The night-shift voice stays.

Review threads on pull request #1 were resolved after the merge. Issues #2 through #9 were filed for the work that was still open. The one commit after the merge, `60c67ea`, was the template wording. It was already on `main` before this log. A second pull request for it would have been empty.

## The shorthand reads the hull when the hull is up

A follow-up audit listed five seams. The ones that were real, and safe to take, landed on `greyzxcursor/solid2-shorthand-2692` as `0938e6b` (pull request #10):

- `pnpm dev` and `pnpm preview` proxy `/api` to `http://127.0.0.1:4471`. `HULL_ORIGIN` overrides the target. The browser stays on the shorthand origin, so `Sec-Fetch-Site` stays `same-origin`.
- The page polls `GET /api/view` on the same cadence as `assets/island.js`: 3 seconds when the hull answers, then 1s, 2s, 4s, and 8s when it does not. One tape line covers a whole outage. The last good deck stays.
- An unchanged epoch and cursor does not reconcile. A local gauge drag survives an idle poll. A new cursor, or a new epoch, reconciles `view.deck` after `validateDeck`.
- The form posts `POST /api/pipes/{pipe}/push` with `X-Airlock-Intent: 1`. The pipe id and the field names come from the form card. On the live pass that pipe is `ingress.pass` and the fields are `dish` and `note`. On the fixture it is `ingress.trace` with `title` and `detail`.
- Offline, `fileLine` still appends to `card.trace`. The list cap is checked before the store write, so the updater does not push into an outer issues array.
- The night-canvas test reads `shorthand/src/shell.css` as well as the hull stylesheet.
- `shorthand/tests/hull-cards.test.ts` requires the ten sample cards in `modules/cards` to pass the TypeScript twin.

Checked live on this machine: through the shorthand dev server, `ingress.pass` accepted a plate and the cover count moved. That plate lived in the running process only.

Refused from the same audit:

- Rewriting `nudgeLine` to mark the first list. The drill targets `card.tracked`. The pasted store would have failed `store.test.ts`.
- Dropping `dynamic()` for Switch and Match. The shells already narrow with `Show`. `dynamic()` is the Solid 2 picker.
- Adding `.DS_Store` to `.gitignore`. The line was already there, and no such file is in the tree.

Still refused, and still open: making `wasm/hull.wasm` the only schema checker, teaching the shorthand page to speak `sysex-delta/1` itself, running `pnpm test` from `cargo test`, and serving `shorthand/` from the hull. A static `vite build` has no proxy. A published shorthand host has to provide `/api` or the page stays on the fixture.

## What this session did not copy into the repo

The published page at `https://rust-core-app-test-solid2.apps.grok.bot` and the Origin repo `greyzxcursor/rust-core-app-test-solid2` are a third tree. This session did not republish them. Issue [#9](https://github.com/k-dot-greyz/rust-app-core/issues/9).

A full chat dump was requested and then stopped. It is not in the tree. This log, `docs/lessons.md`, `shorthand/docs/handbook.md`, and `shorthand/docs/open-loops.md` are the durable notes.

## Release candidate

The open issues from this session were closed by a decision or by a small fix. No crate was added. No implementation was deleted.

- The hull does not serve `shorthand/`, and it does not replace `assets/island.js`. The core stays Rust. The shorthand stays the island candidate you run beside it. Issue 2.
- When the hull is up, the form posts the pipe and the fields on the card. When it is down, the form says the write stays on the page. `sysex-delta/1` stays in the crate and in `assets/island.js`. The shorthand polls `GET /api/view`. Issue 3.
- `scripts/rc-check.sh` runs `cargo test` and the shorthand suite. `cargo test` does not call Node, so a Rust-only check of the core still has nothing to install. The night-canvas test already reads `shorthand/src/shell.css`. Issue 4.
- `validateDeckSource` scans raw JSON before `JSON.parse`. A number token with `.` or `e` or `E` is refused with the hull sentence. Parsed objects are unchanged, because `1e2` is already `100` by then. Issue 5.
- A shorthand media card plays a non-empty `/assets/` file the way the hull does, and keeps the dark plate when the file is missing or the source is refused. Issue 6.
- The empty-title test names the DOM constraint and, after that attribute is removed, the store refusal. Issue 7.
- Rechecked 21 Nov 2026: `@astrojs/solid-js` is still 7.1.6, peer `solid-js` ^1.9.13. `astro add solid` stays on hold. The Vite deck is the island boundary until @8 is what the resolver installs. Issue 8.
- This GitHub repo is the reference. `https://rust-core-app-test-solid2.apps.grok.bot` is an earlier snapshot and was not republished. Issue 9.
