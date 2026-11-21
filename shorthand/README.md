# Hull shorthand

A Solid 2.0.3 reference for the card shells in [rust-app-core](https://github.com/k-dot-greyz/rust-app-core). Copy a shell into another UI, or reimplement the same `kind` switch. The page is that reference, running. It sits in this directory and the hull does not serve it. Pipes, the airlock, and the socket stay in the crate. The parent README names the three uses of the whole repo: build on the tree, reuse a component, or reimplement the architecture.

Two `render()` roots share one module store. Cards are plain JSON with a closed `kind`. Components are shells. A copper digit next to a field is how many times that text node ran. Drag **Integrity** and only that digit moves. **Reconcile one line** updates a single list detail and leaves the hero's node on its first paint. **Offer an unknown kind** is refused before it touches the store.

`CONTEXT.md` is the prompt to paste into later sessions. `docs/handbook.md` is the companion: what that prompt got right, the supply-chain split, and which tests are worth keeping.

## Words

Same names as the hull, said once.

- **Hull.** The Rust server in the parent repo. It listens on `127.0.0.1:4471`. This page does not call it.
- **Card.** One JSON record. `kind` is `hero`, `stat`, `list`, `form`, `note`, `gauge`, or `media`.
- **Deck.** The left column, one render root. **Pretext** is the same cards as plain text. The header button switches them.
- **Inspector.** The right column, a second render root, reading the same store.
- **Projection.** A count of cards by kind.
- **Tape.** The paths that changed on the last write.
- **Integrity.** The gauge. Drag it. One copper count should move in both columns.
- **Reconcile one line.** Toggles a mark on a single list detail.
- **Offer an unknown kind.** A refused write. The deck stays.

## What the Gemini note got right

The instinct tracks. Fine-grained signals are the runtime version of a JSON-card pipe: the component function runs once, and each binding updates on its own. `createProjection` is real in Solid 2.0.0 (17 Nov 2026), and `createResource` is gone. Stores are proxies over plain objects, so a class instance is the wrong shape. Sibling islands do not share a reactive owner.

Three lines in that note need a tighter pin, or a model will emit Solid 1:

- `npm` latest `@astrojs/solid-js` on 21 Nov 2026 is **7.1.6**, which peers `solid-js` 1.9. Solid 2 support is `@astrojs/solid-js@8`, still in [withastro/astro#18783](https://github.com/withastro/astro/pull/18783). `astro add solid` installs the Solid 1 adapter.
- Imports moved. `createStore` and `reconcile` come from `solid-js`. `render` and `dynamic()` come from `@solidjs/web`. There is no `solid-js/store` and no `solid-js/web`. `<Dynamic>` is deprecated.
- `reconcile(next, "id")` is applied to the draft (`setState((draft) => { reconcile(next, "id")(draft.cards) })`). Returning a fresh array from the setter is only a shallow index diff.

The polymorphism in this pass lives in `kind`, the same closed set as the hull: `hero`, `stat`, `list`, `form`, `note`, `gauge`, `media`.

## How this sits on rust-app-core

The hull already renders the document and serves cards. This page is the island update: same card shape, same refusal of unknown fields, two client roots instead of `assets/island.js`. Pipes, the airlock, and `sysex-delta/1` stay in the Rust crate. `pnpm dev` proxies `/api` to `http://127.0.0.1:4471`, so a running hull replaces the fixture deck and the form posts the pipe named on the form card. When the hull is down, the fixture stays and a filed line is appended locally to `card.trace`. The TypeScript checker is a browser twin of the card rules in `src/schema.rs`. One gap: the hull's own JSON parser refuses exponent forms, and this twin sees the number `JSON.parse` already produced. Sharing `wasm/hull.wasm` as the only checker is still a later pass.

## Run

Node 22.12 or newer. pnpm, because npm 10.9.9's arborist crashed on Vitest's peer set (`edgesOut`).

Runtime dependencies are `solid-js` and `@solidjs/web`, floored at 2.0.3. The lockfile records the resolution. They publish compiled JavaScript and type declarations. This repo authors TypeScript only. Vite, Vitest, TypeScript, and the Solid compiler are the install weight, and they stay out of the browser bundle. `happy-dom` is the test DOM. The reasoning is in `docs/handbook.md`.

```bash
pnpm install
pnpm test
pnpm dev
```

`pnpm dev` and `pnpm preview` prefer `http://127.0.0.1:4483`. A busy port walks to the next free one, and Vite prints the URL that opened. `/api` is proxied to `HULL_ORIGIN`, which defaults to `http://127.0.0.1:4471`. There is no TLS plugin. Set `HOST=0.0.0.0` when a sandbox has to reach the dev server. That opens a listening socket on every interface, with no login. It is not an outbound socket, and the hull's airlock is a separate rule. `?surface=pretext` is the text surface. The header toggle switches it. The skip link follows the visible surface.

```bash
pnpm typecheck
pnpm build
pnpm preview
```
