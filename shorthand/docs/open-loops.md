# Open loops

Status on 21 Nov 2026, after the review fixes and the orientation pass on this branch. Closed means the item is done here. Open means it is still not this release.

## Closed

- Duplicate card ids are rejected. A missing trace and a full trace return issues, and the form keeps the input.
- A non-finite gauge is ignored. The reconcile drill reads the staged draft, and it refuses a mark that would pass 180 code points.
- Media names `.` and `..` are refused in the TypeScript twin and in `safe_media_src`.
- Title and detail length are counted in Unicode code points.
- The skip link follows the visible surface. The supply test uses `fileURLToPath`.
- Dev and preview listen on `127.0.0.1`. `HOST=0.0.0.0` is the opt-in, and it has no login.
- The prompt no longer asks a later session to invent card inheritance or a `Loading` / `isPending` read. This hull has neither.
- README, SPEC, the shorthand README, and the first screen of each page define the short names and say what to do next.
- The agent note points at GitHub `k-dot-greyz/rust-app-core`. Origin `greyzxcursor/rust-web-scaffold` is the earlier scaffold.

## Still open

The hull does not serve `shorthand/`. `assets/island.js` is still the view the pass loads. `Cargo.toml` stays empty. `tasks.md` keeps the shorthand out of the hull's done-when. Replacing the island is a later release.

`pnpm dev` proxies `/api` to the hull and polls `GET /api/view`. The form posts the pipe and the field names on the form card. When the hull is down, filing a line still appends to the local `card.trace`. `load()` is still a full payload. The page does not speak `sysex-delta/1` itself. The hull does. A static `vite build` has no proxy, so a published shorthand host has to provide `/api` or the page stays on the fixture.

The hull's Next.js port still serves `wasm/hull.wasm`. The shorthand is a separate Vite app. Those two front ends are not one app. The TypeScript twin still checks the sample cards, and it is not yet the wasm checker. The exponent-integer gap below is the remaining schema drift.

`cargo test` does not run `pnpm test`. Nothing in this repo's automation runs the shorthand suite. The night-canvas check now also reads `shorthand/src/shell.css`.

The TypeScript checker sees the number `JSON.parse` already produced. The hull parser refuses exponent forms. An exponent can become an integer before this twin checks it.

The shorthand mounts are empty until the script runs. Pretext is filled by an effect. The `noscript` block says so and points at Hull on port 4471.

The media shell paints the fallback plate and the caption. A non-empty local `src` is allowed by the validator and is not played. The fixture source is empty on purpose. The hull page does play a local `/assets/` file and falls back when that file fails.

Playwright stays out so install does not download a browser. The two-island pass runs in happy-dom. Clipboard success, paint counts on fields the story does not change, viewport width, and favicon are still untested here. The empty-title case can pass because the browser blocks the submit or because the store rejects a blank title. The test does not say which layer ran.

Direct runtime packages are `solid-js@2.0.3` and `@solidjs/web@2.0.3`. The install also fetches `@solidjs/signals`, `seroval`, `seroval-plugins`, and `csstype`. A client chunk from the earlier pass had no `seroval` string. A sandbox install still downloads it. `happy-dom@21.0.4` brings `ws`. `npm install` is not the path. npm 10.9.9's arborist crashed on Vitest's peer set. The repo uses pnpm.

On 21 Nov 2026, npm's `@astrojs/solid-js` was 7.1.6 and peers `solid-js` 1.9. Solid 2 support was Astro pull request 18783, `@astrojs/solid-js@8`. Leave `astro add solid` alone until the resolver installs @8. The pin in `CONTEXT.md` moves together with the handbook and the test.

The published page and the Origin repo `greyzxcursor/rust-core-app-test-solid2` are a third tree. This branch does not update that page. A later edit here does not land there.

Header, skip link, mount labels, and the inspector hints live outside the cards. That frame is the manual. The cards stay the data.
