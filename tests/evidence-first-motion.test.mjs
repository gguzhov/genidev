import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("draws one normalized signal path and has a static reduced-motion state", async () => {
  const jsx = await readFile("src/components/WorkSequence/WorkSequence.jsx", "utf8");
  const css = await readFile("src/components/WorkSequence/WorkSequence.css", "utf8");
  assert.match(jsx, /pathLength="1"/);
  assert.match(css, /stroke-dasharray:\s*1/);
  assert.match(css, /stroke-dashoffset:\s*1/);
  assert.match(css, /prefers-reduced-motion/);
});

test("reveals the work sequence once and disposes its observer", async () => {
  const { createWorkSequenceObserver } = await import(
    "../src/components/WorkSequence/workSequenceRevealState.js"
  );
  const calls = [];
  let callback;
  const fakeObserver = {
    observe: (root) => calls.push(["observe", root]),
    disconnect: () => calls.push(["disconnect"]),
  };
  class IntersectionObserverClass {
    constructor(nextCallback, options) {
      callback = nextCallback;
      calls.push(["construct", options]);
      return fakeObserver;
    }
  }
  let revealCount = 0;
  const root = {};
  const cleanup = createWorkSequenceObserver({
    root,
    reducedMotion: false,
    onReveal: () => {
      revealCount += 1;
    },
    IntersectionObserverClass,
  });

  callback([{ isIntersecting: false }]);
  callback([{ isIntersecting: true }]);
  callback([{ isIntersecting: true }]);
  assert.equal(revealCount, 1);
  assert.deepEqual(calls[0], [
    "construct",
    { root: null, rootMargin: "0px", threshold: 0.35 },
  ]);
  assert.deepEqual(calls[1], ["observe", root]);
  assert.deepEqual(calls.at(-1), ["disconnect"]);

  cleanup();
  callback([{ isIntersecting: true }]);
  assert.equal(revealCount, 1);
});

test("reveals immediately without motion or observer support", async () => {
  const { createWorkSequenceObserver } = await import(
    "../src/components/WorkSequence/workSequenceRevealState.js"
  );
  for (const options of [
    { root: {}, reducedMotion: true, IntersectionObserverClass: class {} },
    { root: {}, reducedMotion: false, IntersectionObserverClass: undefined },
    { root: null, reducedMotion: false, IntersectionObserverClass: class {} },
  ]) {
    let revealCount = 0;
    const cleanup = createWorkSequenceObserver({
      ...options,
      onReveal: () => {
        revealCount += 1;
      },
    });
    assert.equal(revealCount, 1);
    cleanup();
  }
});

test("uses a bounded enter transition for the capability panel", async () => {
  const jsx = await readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8");
  const css = await readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8");
  assert.match(jsx, /featuredSolutions\.map/);
  assert.match(css, /capability-panel-enter/);
  assert.match(css, /var\(--motion-state\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("keeps project media in a horizontally scrollable slider with one ratio", async () => {
  const css = await readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8");
  assert.doesNotMatch(css, /margin-top:\s*88px/);
  assert.doesNotMatch(css, /span 7|span 5/);
  assert.match(css, /\.marketplace__viewport\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /\.marketplace__track\s*\{[^}]*display:\s*flex/s);
  assert.doesNotMatch(css, /\.project-card:hover\s*\{[^}]*transform:/s);
});

test("does not attach project pointer depth to decorative cards", async () => {
  const card = await readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8");
  const visual = await readFile("src/components/ProjectMarketplace/ProjectVisual.jsx", "utf8");
  const lifecycle = await readFile(
    "src/components/ProjectMarketplace/projectVisualPointerLifecycle.js",
    "utf8",
  );
  assert.match(card, /interactive=\{false\}/);
  assert.match(visual, /interactive\s*=\s*true/);
  assert.match(lifecycle, /if \(!interactive/);
});

test("styles DriftWall metric list items using the semantic li contract", async () => {
  const css = await readFile("src/components/DriftWall/DriftWall.css", "utf8");
  assert.doesNotMatch(css, /project-card__metrics\s*>\s*span/);
  assert.match(css, /project-card__metrics\s*>\s*li/);
});
