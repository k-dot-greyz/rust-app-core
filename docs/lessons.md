# Lessons and considerations

21 Nov 2026. Read this before changing the shorthand, the bind, the schema twin, or the prompt in `shorthand/CONTEXT.md`. The decisions those lessons come from are `docs/decision-log.md`.

## The template

Say the three uses in the first screen a stranger reads: build on the tree, reuse a component, reimplement the architecture. The pass is the demo. An empty `[dependencies]` in `Cargo.toml` is the contract. A crate added “to get JSON” or “to get TLS” breaks the hull.

New behavior is a new file in the closed vocabulary. Kinds: `hero`, `stat`, `list`, `form`, `note`, `gauge`, `media`. Steps: `append-list`, `inc-stat`, `set-gauge`, `airlock`. Unknown fields are refused. A bad module file must not replace the last good bundle.

## Solid 2, as this tree actually runs it

Node’s export of `solid-js` and `@solidjs/web` is the server build (`dist/server.js`). Vitest is Node, so it loads that build unless the test config aliases the exact package names to `dist/solid.js` and `dist/web.js`. A prefix alias is wrong: `@solidjs/web/jsx-runtime` has to stay on the package exports. The Solid Vite plugin turns its dev runtime on under Vitest. Set `dev: false` when Vite’s mode is `"test"`, or the compiler injects the dev refresh runtime next to the production client. The symptom of the wrong build is a store that does not keep proxy identity, or a write that throws `SERVER_WRITE`.

`reconcile(next, "id")` is applied to the draft:

```ts
setState((draft) => {
  reconcile(next, "id")(draft.cards);
});
```

Returning a fresh array from the setter is only a shallow index diff.

A row keeps its proxy only after something in a tracking scope has read it. An untracked first read is a raw object, and the next reconcile replaces it. Establish the read with `createMemo` and `flush()` before a drill that has to keep the hero proxy.

Writes inside the function passed to `createRoot` throw `REACTIVE_WRITE_IN_OWNED_SCOPE` on the client build. Call the write after that function returns.

Writes stage until the next microtask or `flush()`. A second update that needs to see the first one has to read the draft inside the setter. Reading `deck.cards` outside the setter sees the last flushed value. That is why the reconcile drill snapshots `draft.cards` inside `setDeck`, and why the list-cap check for `fileLine` now happens before `setDeck` on the flushed list. Do not `push` into an outer `issues` array from inside the producer. Solid does call the producer synchronously today. The updater should still be a store write, not a side channel.

`createProjection` is real. Key it by `"id"`. Do not mark it citation-needed without opening the 2.0.3 docs.

`dynamic()` is the shell picker. Keep the exhaustive `switch` beside it so a new kind fails the build. `Show` narrows the discriminated union inside the shell. Switch and Match do not replace that pair, and they do not restore the type narrowing `dynamic()` plus `Show` already has. `<Dynamic>` stays deprecated.

Never destructure props. The component function runs once. A destructured prop keeps the first value and the binding goes quiet. Class instances do not belong in the store. JSON drops the prototype, and the proxy cannot see the methods.

Do not add `Loading`, `isPending`, or card inheritance because an older prompt mentioned them. This hull has neither. The prompt test fails if those sentences disappear.

## The schema twin

`shorthand/src/cards/validate.ts` is a twin of `src/schema.rs`. `validateDeck` sees values `JSON.parse` already produced, so `1e2` is `100` and `1.0` is `1`. `validateDeckSource` scans the raw text first. A number token outside a string that contains `.`, `e`, or `E` is refused with "Integers are bare digits. Exponents are not integers." Feed raw JSON through that function. Do not expect `validateDeck` to recover an exponent from a parsed number.

The ten sample cards in `modules/cards` must pass `validateDeck`. `shorthand/tests/hull-cards.test.ts` locks that. A hull card the twin rejects means the live poll will fault and hold the fixture forever.

Sharing `wasm/hull.wasm` as the only checker would remove the drift. It is not this pass. Do not “fix” the gap by loosening the hull parser.

Lengths are Unicode code points, not UTF-16 units. An emoji is one code point and two UTF-16 units. `maxlength` on an input counts the wrong unit. Clamp in the input handler. The trace detail cap is 180. The form detail cap is 80. A mark that would pass 180 is a fault, and the previous detail stays.

The names `.` and `..` are not media file names. `safe_media_src` in the crate and `safeMediaSrc` in the twin both refuse them.

## The hull wire

The shorthand dev server proxies `/api` to `http://127.0.0.1:4471`. `HULL_ORIGIN` overrides it. `changeOrigin` is on so the hull sees its own host. The browser’s request is same-origin to the shorthand, which is what the hull’s `Sec-Fetch-Site` check allows. JSON writes need `X-Airlock-Intent: 1`. `require_json` enforces that header. A pipe push without it is a 400.

Poll the way `assets/island.js` polls. Success waits 3 seconds. The first failure waits 1 second, then 2, then 4, then 8, and the cap stays at 8. Reset the backoff when a view lands. Write the “pass did not answer” line once per outage, not once per tick. Skip the poll while a push is in flight, and while `document.hidden` is set.

Ignore a cursor older than the one already applied, unless the epoch changed. An epoch change resets the comparison, because a reloaded hull starts its cursor over. If the epoch and the cursor are unchanged, do not reconcile. An idle poll must not wipe a local gauge drag.

The form is data. Post `card.body.pipe` and the field `name`s on that card. Do not hardcode `ingress.trace` or `title`/`detail` on the live path. The fixture’s form uses those names. The hull’s `card.plate` uses `ingress.pass`, `dish`, and `note`. The offline path still files onto `card.trace`, because the browser does not run the pipe runner. Say that in the docs when you touch it. `nudgeLine` targets `card.tracked`. The hull sample deck has no such card. On a live deck the drill is a no-op. Do not retarget it to “the first list” to make the button look busy.

`startSync` runs from `main.tsx` only when Vite’s mode is not `"test"`. The surface test imports that module. A poll timer in the suite will fail fetches and dirty the singleton log.

`vite build` does not proxy. A static host that serves the shorthand and does not serve `/api` keeps the fixture. That is the current published-page shape. Do not pretend the static build calls the hull.

## Bind, scheme, and ports

Loopback is `http://127.0.0.1`. It is a secure context. Bytes do not leave the machine. Do not add a TLS crate. Do not ship a certificate for someone to click through. Do not rewrite the metadata probe or the plain-HTTP probe onto `https://`. Those two URLs are the lesson the airlock teaches.

Anything that names a host other than loopback is `https://`, aside from those two fixtures. Smoke uses `https://hull.local`. Dispatch is path-only. The published host terminates TLS.

`HOST` defaults to `127.0.0.1`. `0.0.0.0` is an opt-in with no login. Print `http://127.0.0.1:{port}` even then, and warn on stderr. “The hull opens no outbound socket” and “the process listens on every interface” are different sentences. Keep both accurate.

Preferred ports are `4471` and `4483`. A taken preferred port asks the OS, or walks forward, and the process prints the URL. Do not set `strictPort` on the shorthand. Do not document `3000`, `5173`, or `8080` as the default.

## How to take an outside patch

Check the patch against the tests before applying it. In this session a proposed store replacement would have:

- pointed `nudgeLine` at the first list instead of `card.tracked`
- dropped `dynamic()` for Switch and Match
- added a `.gitignore` line that was already present

The useful parts of that same note were the proxy, the poll cadence, the pipe id taken from the form card, the list-cap check outside the setter, and the shorthand CSS in the night-canvas test. Take those. Leave the rest.

`createProjection` needed a doc check, not a citation shrug. The Astro “latest” adapter needed `npm view`, not the word latest. Pins rot. When `@astrojs/solid-js@8` is what the resolver installs, move the prompt, the handbook, and the test in one pass.

## What stays out of the tree

Do not commit a chat transcript, a system prompt, or a tool trace. This file and the decision log are the session record.

Do not republish `https://rust-core-app-test-solid2.apps.grok.bot` as a side effect of a hull edit. That page is a third tree. Issue [#9](https://github.com/k-dot-greyz/rust-app-core/issues/9).

Playwright stays out. The two-island pass runs in happy-dom. A browser-binary runner would dominate install size for assertions the DOM test already makes.
