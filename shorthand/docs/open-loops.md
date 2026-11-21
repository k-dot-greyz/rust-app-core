# Open loops

Dump from the chat that produced the shorthand, captured 21 Nov 2026. Nothing in this file was fixed. It is a list of threads that still need a look.

The deck, the handbook, the island tests, and the published page already exist. This list is what was left beside them.

## Hull

The original ask was a proof of concept that could sit on rust-app-core or become an update to it. `shorthand/` is that candidate, copied onto this branch. The hull does not serve it. `assets/island.js` is still the view the pass loads. `Cargo.toml` is still empty. `tasks.md` keeps the shorthand out of the hull's done-when.

Pipes, the airlock, and `sysex-delta/1` stay in the crate. The shorthand opens no socket. Filing a line appends to the local store. The form's pipe id is `ingress.trace`, and the trace seed says nothing has been sent. `load()` replaces the whole deck and clears the tape. The handbook calls that a full payload, not a delta.

The hull already has a Next.js port that serves `wasm/hull.wasm`. The shorthand is a separate Vite app so that port and the empty crate list would stay put. Those two front ends are not one app.

`SPEC.md` is the hull's map of what shipped and what is still a daydream. This pass did not edit it.

The hull's night-canvas check looks at the hull page. The shorthand palette was chosen to sit on that night canvas (`#0c0b0a`, no white). The cargo test does not see `shorthand/src/shell.css`.

`cargo test` does not run `pnpm test`. Nothing in this repo's automation runs the shorthand suite.

The agent pickup note still says the source of truth, until a public GitHub remote exists, is Origin `greyzxcursor/rust-web-scaffold`. The public GitHub remote exists. This pass did not compare the two trees, and it did not copy the agent note onto the dev-master path that note says it belongs on.

## Two other copies

The published page and the Origin repo `greyzxcursor/rust-core-app-test-solid2` are a third tree, package name `hull-shorthand`. This branch is the hull copy. Nothing keeps them in sync. A later edit on one does not land on the other.

## Security

Dev and preview now default to `127.0.0.1`. `HOST=0.0.0.0` still opens every interface, with no login, for a sandbox that has to reach the machine. The published site is the static build and does not run Vite. The earlier publishes of the separate Origin tree still had the open bind. That tree is not this branch.

## Pins that will go stale

On 21 Nov 2026, npm's `@astrojs/solid-js` was 7.1.6 and peers `solid-js` 1.9. Solid 2 support was Astro pull request 18783, `@astrojs/solid-js@8`. `CONTEXT.md` says to leave `astro add solid` alone until the resolver installs @8. Those sentences need a fresh check when the adapter ships. The deck is Vite plus two `render()` roots until then.

`CONTEXT.md` is pinned to solid-js 2.0.3 and `@solidjs/web` 2.0.3. The handbook says to move the pin, the prompt, and the test together.

## Schema

The TypeScript checker is a twin of the hull card rules with one gap the shorthand README already states. The hull parser refuses exponent forms. This twin sees the number `JSON.parse` already produced, so an exponent can become an integer before the check.

`CONTEXT.md` says to resolve inheritance into plain objects before hydration. The hull schema has no inheritance. The deck has no resolver and no example card.

The prompt tells a model to put the first unresolved read under `Loading` and to read `isPending` for a held update. This deck never shows a held async read.

## View

The hull's done-when includes the page working with the island script removed, because the document is server-rendered. The shorthand mounts are empty until the module runs. Pretext is filled by an effect. `noscript` only points at the prompt.

The media shell paints the fallback plate and the caption. A non-empty local `src` is allowed by the validator and is not played. The fixture source is empty on purpose.

Header, skip link, mount labels, and the empty-tape line live outside the cards. That was kept so the two render roots stay visible. It is a break from "no hardcoded copy."

## Tests that were left out

Playwright stayed out so install would not download a browser. The two-island pass runs in happy-dom. A manual browser pass is not part of `pnpm test`.

Left out on purpose, and still untested: clipboard success and the select-the-prompt fallback, paint counts on fields the story does not change, viewport width, favicon, skip-link geometry. The empty-title case passes whether the DOM blocks the submit or the store rejects a blank title. It does not say which layer ran.

## Install weight

Direct runtime packages are `solid-js@2.0.3` and `@solidjs/web@2.0.3`, pinned exact. They publish compiled JavaScript plus types. The install also fetches `@solidjs/signals`, `seroval`, `seroval-plugins`, and `csstype`. A client chunk from this pass had no `seroval` string. A sandbox install still downloads it.

`happy-dom@21.0.4` is the test DOM. It brings its own packages, including `ws`. That was the accepted extra so the island tests could drive an input and `FormData`.

`npm install` is not the path. npm 10.9.9's arborist crashed on Vitest's peer set. The repo uses pnpm. The heavy tree is TypeScript, Vite, Vitest, and the native compilers, paid at install and absent from the static page.

`tests/supply.test.ts` fails if a third runtime package appears, or if Playwright, Astro, or React lands in devDependencies.

## Words from the ask that never got a home

The user mentioned turning the worthwhile assumptions into end-to-end tests as part of a vitrine upgrade. No separate vitrine repo was opened. The island tests in this directory are the tests that were judged worth keeping.

"Constructor pattern OOP, where appropriate" was the phrase that fights Solid. The prompt now says factories and plain objects. There is no class example kept around to show the failure, and nothing stops a later session from pasting the old shorthand.
