import { render } from "@solidjs/web";
import { chrome } from "./cards/chrome.ts";
import { DeckIsland } from "./islands/DeckIsland.tsx";
import { InspectorIsland } from "./islands/InspectorIsland.tsx";
import { watchPretext } from "./surface.ts";

const surface = new URLSearchParams(location.search).get("surface") === "pretext" ? "pretext" : "deck";
document.body.dataset.surface = surface;

const toggle = document.querySelector("#surface-toggle");
if (toggle instanceof HTMLButtonElement) {
  const paintToggle = () => {
    const pretext = document.body.dataset.surface === "pretext";
    toggle.textContent = pretext ? chrome.surfaceToDeck : chrome.surfaceToPretext;
  };
  paintToggle();
  toggle.addEventListener("click", () => {
    document.body.dataset.surface = document.body.dataset.surface === "pretext" ? "deck" : "pretext";
    paintToggle();
  });
}

const deckRoot = document.querySelector("#deck-root");
const inspectorRoot = document.querySelector("#inspector-root");
if (deckRoot instanceof HTMLElement) render(() => <DeckIsland />, deckRoot);
if (inspectorRoot instanceof HTMLElement) render(() => <InspectorIsland />, inspectorRoot);

const pretext = document.querySelector("#pretext pre");
if (pretext instanceof HTMLElement) watchPretext(pretext);
