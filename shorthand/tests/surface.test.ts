// @vitest-environment happy-dom
import page from "../index.html?raw";
import { expect, it } from "vitest";

it("keeps the skip link aligned with the initial and switched surfaces", async () => {
  const shell = new DOMParser().parseFromString(page.replace(/<head>[\s\S]*?<\/head>/, ""), "text/html");
  document.body.replaceChildren(...shell.body.childNodes);
  history.replaceState(null, "", "?surface=pretext");
  await import("../src/main.tsx");

  const skip = document.querySelector(".skip");
  const toggle = document.querySelector("#surface-toggle");
  if (!(toggle instanceof HTMLButtonElement)) throw new Error("missing surface toggle");

  expect(document.body.dataset.surface).toBe("pretext");
  expect(skip?.getAttribute("href")).toBe("#pretext");
  expect(skip?.textContent).toBe("Skip to Pretext");

  toggle.click();
  expect(document.body.dataset.surface).toBe("deck");
  expect(skip?.getAttribute("href")).toBe("#deck-root");
  expect(skip?.textContent).toBe("Skip to the deck");

  toggle.click();
  expect(document.body.dataset.surface).toBe("pretext");
  expect(skip?.getAttribute("href")).toBe("#pretext");
  expect(skip?.textContent).toBe("Skip to Pretext");
});
