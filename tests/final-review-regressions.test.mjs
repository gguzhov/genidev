import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { problems } from "../src/content/siteContent.js";

test("publishes concrete solution projects for every business function", () => {
  assert.deepEqual(problems.map(({ id }) => id), ["marketing", "sales", "management", "operations", "ai-infrastructure", "enablement"]);
  for (const problem of problems) {
    assert.equal(problem.solutions.length, 4);
    assert.ok(problem.solutions.slice(0, 3).every(({ project, effect }) => project.length > 7 && effect.length > 7));
    assert.equal(problem.solutions.at(-1).title, "И другое цифровое решение");
  }
});

test("keeps tablet slider cards readable without aggressive word breaking", async () => {
  const css = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.css",
    "utf8",
  );
  const tablet = css.slice(
    css.indexOf("@media (min-width: 768px)"),
    css.indexOf("@media (min-width: 1024px)"),
  );
  const desktop = css.slice(css.indexOf("@media (min-width: 1024px)"));

  assert.match(tablet, /\.marketplace__track\s*\{[^}]*--marketplace-card-width:\s*min\(54vw,\s*460px\)/s);
  assert.match(desktop, /\.marketplace__track\s*\{[^}]*--marketplace-card-width:\s*min\(39vw,\s*500px\)/s);
  assert.doesNotMatch(css, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(css, /word-break:\s*break-all|overflow-wrap:\s*anywhere/);
});

test("sequences the 500ms signal before nodes with an exact CustomEase", async () => {
  const source = await readFile("src/components/WorkSequence/WorkSequence.jsx", "utf8");
  assert.match(source, /CustomEase\.create\([^,]+,\s*"0\.22,1,0\.36,1"\)/);
  assert.match(source, /timeline\s*\.to\(signal,[\s\S]*duration:\s*0\.5/s);
  assert.match(
    source,
    /timeline\s*\.to\(signal,[\s\S]*?\)\s*\.to\(nodes,[\s\S]*stagger:\s*0\.07[\s\S]*?,\s*0\.5\s*\)/s,
  );
  assert.match(source, /context\.revert\(\)/);
});

test("keeps capability state motion bounded and reduced-motion safe", async () => {
  const css = await readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8");
  assert.match(css, /animation:\s*capability-panel-enter var\(--motion-state\) var\(--motion-ease\) both/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /\binfinite\b/);
});

test("pointer lifecycle attaches only while fine-hover motion is allowed", async () => {
  const { createProjectPointerLifecycle } = await import(
    "../src/components/ProjectMarketplace/projectVisualPointerLifecycle.js"
  );
  const cardListeners = new Map();
  const media = {
    hover: createMedia(false),
    reduced: createMedia(false),
  };
  const resets = [];
  const card = {
    addEventListener(type, handler) {
      cardListeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (cardListeners.get(type) === handler) cardListeners.delete(type);
    },
  };
  const visual = {};
  const cleanup = createProjectPointerLifecycle({
    card,
    visual,
    interactive: true,
    matchMedia: (query) => (query.includes("prefers-reduced") ? media.reduced : media.hover),
    onPointerMove: () => {},
    resetDepth: (element) => resets.push(element),
  });

  assert.equal(cardListeners.size, 0);
  media.hover.setMatches(true);
  assert.deepEqual([...cardListeners.keys()].sort(), ["pointerleave", "pointermove"]);
  media.reduced.setMatches(true);
  assert.equal(cardListeners.size, 0);
  assert.equal(resets.at(-1), visual);
  media.reduced.setMatches(false);
  assert.equal(cardListeners.size, 2);

  cleanup();
  assert.equal(cardListeners.size, 0);
  assert.equal(media.hover.listenerCount(), 0);
  assert.equal(media.reduced.listenerCount(), 0);
  assert.equal(resets.at(-1), visual);
});

test("a sequence revealed under reduced motion never replays when preference changes", async () => {
  const { createWorkSequenceMotionState, transitionWorkSequenceMotionState } =
    await import("../src/components/WorkSequence/workSequenceRevealState.js");
  const initial = createWorkSequenceMotionState(true);
  const fullMotion = transitionWorkSequenceMotionState(initial, "PREFERENCE_FULL");
  const attemptedReveal = transitionWorkSequenceMotionState(fullMotion, "REVEAL");

  assert.deepEqual(initial, { isRevealed: true, hasSettled: true });
  assert.equal(attemptedReveal, fullMotion);
});

function createMedia(initialMatches) {
  let matches = initialMatches;
  const listeners = new Set();
  return {
    get matches() {
      return matches;
    },
    addEventListener(_type, listener) {
      listeners.add(listener);
    },
    removeEventListener(_type, listener) {
      listeners.delete(listener);
    },
    setMatches(nextMatches) {
      matches = nextMatches;
      for (const listener of listeners) listener({ matches });
    },
    listenerCount: () => listeners.size,
  };
}
