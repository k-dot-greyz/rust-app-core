import { render } from "@solidjs/web";
import { chrome } from "./cards/chrome.ts";
import { DeckIsland } from "./islands/DeckIsland.tsx";
import { InspectorIsland } from "./islands/InspectorIsland.tsx";
import { watchPretext } from "./surface.ts";

const toggle = document.querySelector("#surface-toggle");
const skip = document.querySelector(".skip");

function setSurface(surface: "deck" | "pretext") {
  document.body.dataset.surface = surface;
  const pretext = surface === "pretext";
  if (toggle instanceof HTMLButtonElement) {
    toggle.textContent = pretext ? chrome.surfaceToDeck : chrome.surfaceToPretext;
  }
  if (skip instanceof HTMLAnchorElement) {
    skip.href = pretext ? "#pretext" : "#deck-root";
    skip.textContent = pretext ? chrome.skipToPretext : chrome.skipToDeck;
  }
}

setSurface(new URLSearchParams(location.search).get("surface") === "pretext" ? "pretext" : "deck");
if (toggle instanceof HTMLButtonElement) {
  toggle.addEventListener("click", () => {
    setSurface(document.body.dataset.surface === "pretext" ? "deck" : "pretext");
  });
}

const deckRoot = document.querySelector("#deck-root");
const inspectorRoot = document.querySelector("#inspector-root");
if (deckRoot instanceof HTMLElement) render(() => <DeckIsland />, deckRoot);
if (inspectorRoot instanceof HTMLElement) render(() => <InspectorIsland />, inspectorRoot);

const pretext = document.querySelector("#pretext pre");
if (pretext instanceof HTMLElement) watchPretext(pretext);
