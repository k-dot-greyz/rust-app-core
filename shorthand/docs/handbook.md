# Handbook

Companion to `CONTEXT.md`. That file is the short prompt. This one is the reasoning, the pins that age, and the tests worth keeping. Edit this freely. When a pin changes, change the prompt and the test that locks it in the same pass.

Checked 21 Nov 2026 against solid-js 2.0.3, `@solidjs/web` 2.0.3, and `@solidjs/vite-plugin` 3.0.1.

## What the shorthand was reaching for

Three moves, once the buzzwords are gone:

1. Cards are the program. A component is a shell. Copy, thresholds, and variants live in serializable JSON. On this hull the switch is `kind`: `hero`, `stat`, `list`, `form`, `note`, `gauge`, `media`.
2. Setup runs once. After that, a changed field updates the node bound to that field.
3. Solid already is that runtime. The component function is the setup. Signals, memos, and stores are the bindings. There is no virtual DOM to re-render.

That reading is the part worth keeping. `createProjection` is a real Solid 2 primitive. A note that marks it "[Citation needed]" has not opened the docs.

## Where a loose prompt goes wrong

**Factories and plain objects.** The component function already runs once. That is the constructor. Store state wants serializable objects. A class instance hides methods from the proxy, and JSON drops the prototype on the way across an island. The polymorphism lives on `kind`. `dynamic()` plus an exhaustive switch picks the shell, and a new kind fails the build until a shell exists.

**"Astro latest" is not a version.** On 21 Nov 2026, npm's `@astrojs/solid-js` was 7.1.6 and that release peers `solid-js` ^1.9. The Solid 2 adapter is `@astrojs/solid-js@8`, still the open Astro pull request 18783. `astro add solid` on that day installed a Solid 1 peer. This deck is Vite plus two `render()` roots that import one module store. That is the same boundary Astro islands will have when @8 is the version the resolver actually installs. Leave `astro add solid` alone until then.

**Import paths.** `createStore`, `reconcile`, `createProjection`, `createMemo`, `createSignal`, `createEffect`, and `flush` come from `"solid-js"`. `render` and `dynamic()` come from `"@solidjs/web"`. `solid-js/store` and `solid-js/web` are gone. `<Dynamic>` is deprecated. `jsxImportSource` is `@solidjs/web`. The compiler plugin is `@solidjs/vite-plugin@3`.

Leave these Solid 1 calls out: `createResource`, `produce`, `batch`, `startTransition`, `on`, `onMount`, `createComputed`, `createMutable`, `Suspense`, `ErrorBoundary`, `splitProps`, `mergeProps`, `unwrap`. A derivation may return a Promise. The first unresolved read goes under `Loading`.

**Props.** Read `props.field` inside JSX. Destructuring copies the first value and the binding goes quiet.

**Reconcile.** Apply it to the draft. A fresh array returned from a setter is only a shallow index diff.

```ts
setState((draft) => {
  reconcile(next, "id")(draft.cards);
});
```

A row keeps its proxy only after something in a tracking scope has read it. An untracked first read is a raw object, and the next reconcile replaces it. Writes inside the component body, or inside the function passed to `createRoot`, throw on the client dev build (`REACTIVE_WRITE_IN_OWNED_SCOPE`). Write from the event handler, after setup returns. Writes sit staged until a microtask or `flush()`.

**Node resolves the server build.** `solid-js` and `@solidjs/web` publish a `"node"` export that points at `dist/server.js`. Vitest is Node, so it loads that build unless the test config aliases the exact package names to the client files `dist/solid.js` and `dist/web.js`. The server build warns and does not keep proxy identity the way the browser does. The alias is a test pin. It is not a decision to author JavaScript. Subpath imports (`@solidjs/web/jsx-runtime`) stay on the package exports, which is why the alias is an exact match and not a prefix.

**Vitest and the compiler must agree.** The Vite plugin turns its development runtime on under Vitest. Tests alias the production client, because that is what `vite build` ships. The plugin is set to `dev: false` when Vite's mode is `test`, so the compiler stops injecting the dev refresh runtime next to the production client.

## Supply chain

The caution is the right default for a hull that already treats the network as hostile. The split that matters is runtime versus install.

**Authored source is TypeScript.** `src/` is `.ts` and `.tsx` only, strict, `noEmit`, `verbatimModuleSyntax`. `tsc --noEmit` is the typecheck. Nothing in this repo is hand-written JavaScript.

**The libraries publish compiled JavaScript plus `.d.ts`.** That is their build artifact. solid-js 2.0.0 ("The Long Hold", 17 Nov 2026) is written as TypeScript and shipped as `dist/solid.js` for the browser and `dist/server.js` for Node. We pin both direct runtime packages exact: `solid-js@2.0.3` and `@solidjs/web@2.0.3`.

**Their own dependencies, which we do not choose one by one:**

| Package | Role | In the browser bundle? |
| --- | --- | --- |
| `@solidjs/signals` | The reactive core solid-js sits on | Yes, folded into the client build |
| `seroval`, `seroval-plugins` | Server serialization | No. A built client chunk on 21 Nov 2026 had no `seroval` string |
| `csstype` | CSS types for JSX | No. Types only |

So a sandbox install downloads packages the page never fetches. That is real cost, and it is install cost. The published app is the static Vite build: one HTML file, one CSS file, one JS file, about 103KB before gzip on this pass. Node does not run in the browser.

**The heavy tree is the toolchain.** On this machine `node_modules` is on the order of 100MB and about a hundred packages, dominated by TypeScript and the native bindings (rolldown, esbuild, the Solid compiler, lightningcss). Vite and Vitest are dev dependencies. They run at install, typecheck, test, and build. They are not a second copy of the app. pnpm is the installer because npm 10.9.9's arborist crashed resolving Vitest's peers (`edgesOut`).

**What stays out.** Playwright, Astro, React, and a second component library. A browser-binary test runner would dominate install size for assertions the DOM test already makes. Astro waits on adapter @8. `happy-dom@21.0.4` is the one test DOM, pinned exact, dev only. It brings a short list of its own (including `ws`). That is the accepted extra, because "two islands share a store and one field paints" is a DOM claim. The store tests cannot see it.

**Control we actually have.** Exact versions on the two runtime packages and on happy-dom. A lockfile for the rest. `tests/supply.test.ts` fails if a runtime dependency appears, if Playwright or Astro or React shows up in devDependencies, or if `src/` grows a `.js` file or a Solid 1 import. Review the lockfile diff when the toolchain moves. Do not `pnpm update` on a whim.

**Dev server bind.** `pnpm dev` and `pnpm preview` listen on `127.0.0.1`. `HOST=0.0.0.0` is the opt-in for a sandbox that has to reach the machine. That opt-in has no login. The published site is the static build and does not run Vite.

## Tests worth keeping

Each of these fails when a real assumption breaks.

- Card contract. Unknown fields, unknown kinds, remote media, gauge range, list cap, and a fixture that round-trips with no leaf diff. `tests/validate.test.ts`.
- Store. One gauge write keeps the hero proxy. Reconcile names a single path. A bad kind never replaces the deck. A full `load` drops a filed line and clears the tape. `tests/store.test.ts`.
- Both islands. Dragging Integrity updates the deck and the inspector, the copper counts move, the mount ids stay, the hero paint stays. Reconcile writes one tape path. An unknown kind renders a fault and leaves nine cards. The form appends a trace line and an empty title does not. Pretext follows the store as text. `tests/islands.test.tsx`.
- Prompt and supply. `CONTEXT.md` still names the versions, the adapter gap, and the banned calls. The package allow-list and the client-build alias stay put. `tests/validate.test.ts`, `tests/supply.test.ts`.

Leave these out. They do not protect a behavior:

- Clipboard success. Permissions differ per browser, and the button already has a fallback.
- Paint counts on fields the story does not change.
- Viewport width, favicon, skip-link geometry.
- A snapshot of the whole prompt wording. Pin the phrases a model gets wrong, not the prose around them.

`load` on the bridge is a full payload replace, the shape of a sysex dump. It is not a delta. Deltas stay in the Rust hull.

## When you change the stack

1. Change `CONTEXT.md` if the prompt would now lie.
2. Change this handbook's dated pin.
3. Change the test that would still pass while the lie ships.
4. Run `pnpm test` and `pnpm typecheck`.
