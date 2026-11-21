import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = fileRoot();

function fileRoot(): string {
  return new URL("..", import.meta.url).pathname;
}

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...walk(path));
    else found.push(path);
  }
  return found;
}

describe("supply and source pins", () => {
  it("keeps the runtime to the two Solid packages, pinned exact", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.dependencies).toEqual({
      "@solidjs/web": "2.0.3",
      "solid-js": "2.0.3",
    });
    expect(Object.keys(pkg.devDependencies).sort()).toEqual([
      "@solidjs/vite-plugin",
      "@types/node",
      "happy-dom",
      "typescript",
      "vite",
      "vitest",
    ]);
    for (const name of ["playwright", "@playwright/test", "astro", "react", "react-dom", "solid-js"]) {
      expect(pkg.devDependencies[name]).toBeUndefined();
    }
  });

  it("authors TypeScript only and leaves Solid 1 imports out of src", () => {
    const source = walk(join(root, "src"));
    expect(source.length).toBeGreaterThan(0);
    const banned = [
      "solid-js/store",
      "solid-js/web",
      "createResource",
      "createMutable",
      "createComputed",
      "startTransition",
      "onMount",
      "splitProps",
      "mergeProps",
    ];
    for (const path of source) {
      expect(path.endsWith(".js") || path.endsWith(".jsx")).toBe(false);
      const text = readFileSync(path, "utf8");
      for (const token of banned) expect(text, path).not.toContain(token);
    }
  });

  it("points Vitest at the client builds", () => {
    const config = readFileSync(join(root, "vite.config.ts"), "utf8");
    expect(config).toContain("solid-js/dist/solid.js");
    expect(config).toContain("@solidjs/web/dist/web.js");
  });
});
