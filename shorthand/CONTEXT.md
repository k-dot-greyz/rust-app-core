Stack and architecture constraints. Paste this into the system prompt or the repo CONTEXT file when generating a hull-style deck.

Framework. solid-js@2.0.3 and @solidjs/web@2.0.3, compiled with @solidjs/vite-plugin@3. Strict TypeScript, no `any`. Astro only through @astrojs/solid-js@8, which is the Solid 2 adapter. As of 21 Nov 2026 that major was not on npm: `npm view @astrojs/solid-js version` returned 7.1.6 and that release peers solid-js ^1.9. Leave `astro add solid` alone until the resolver actually installs @8. Until then, mount each island with its own `render()` from @solidjs/web. jsxImportSource is `@solidjs/web`.

Imports. createStore, reconcile, createProjection, createMemo, createSignal, createEffect, and flush come from "solid-js". render and dynamic( come from "@solidjs/web". solid-js/store and solid-js/web are gone. The <Dynamic> component is deprecated.

Banned Solid 1 calls. Leave these out: createResource, produce, batch, startTransition, on, onMount, createComputed, createMutable, Suspense, ErrorBoundary, splitProps, mergeProps, and unwrap. A derivation may return a Promise. Put the first unresolved read under Loading. After that, updates are held. Read isPending for the held state. createEffect takes a compute function and an effect function. Writes stage until the next microtask or flush(). A component body is not a place to write a signal.

Props. Never destructure props. Read props.field inside JSX or a computation. Destructuring copies the first value and the binding goes quiet.

Data. Components are shells. Thresholds, copy, and variants live in serializable JSON cards with a stable id. On this hull the discriminant is `kind`: hero, stat, list, form, note, gauge, media. Unknown fields and unknown kinds are refused before they touch the store. Resolve inheritance into plain objects first. Hydrate with:

setState((draft) => {
  reconcile(next, "id")(draft.cards);
});

or return the array from createProjection(fn, [], { key: "id" }). Key default is "id". A returned object from a setter is a shallow diff, so use reconcile when row identity has to survive.

Modularity. Factory functions and createX primitives. Class instances stay out of store state. The component function already runs once, and that is the setup. Prototype methods are invisible to the proxy and they do not survive JSON.

Boundaries. Separate render() roots, and Astro islands, do not share an owner. Put the store in a module both islands import. Resolve the cards on the server (Astro frontmatter, or the Rust hull) and pass plain JSON in. A context provider in the document does not reach a sibling island.
