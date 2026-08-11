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

test("reveals actions before four outcome chips", async () => {
  const jsx = await readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8");
  const css = await readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8");
  assert.match(jsx, /--outcome-index/);
  assert.match(css, /problem-outcome-enter/);
  assert.match(css, /var\(--motion-state\)/);
  assert.match(css, /45ms/);
});

test("keeps both project media blocks on the same grid and ratio", async () => {
  const css = await readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8");
  assert.doesNotMatch(css, /margin-top:\s*88px/);
  assert.doesNotMatch(css, /span 7|span 5/);
  assert.match(css, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /translateY\(-2px\)/);
});

test("does not attach project pointer depth to decorative cards", async () => {
  const card = await readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8");
  const visual = await readFile("src/components/ProjectMarketplace/ProjectVisual.jsx", "utf8");
  assert.match(card, /interactive=\{!decorative\}/);
  assert.match(visual, /interactive\s*=\s*true/);
  assert.match(visual, /if \(!interactive\)/);
});

test("styles DriftWall metric list items using the semantic li contract", async () => {
  const css = await readFile("src/components/DriftWall/DriftWall.css", "utf8");
  assert.doesNotMatch(css, /project-card__metrics\s*>\s*span/);
  assert.match(css, /project-card__metrics\s*>\s*li/);
});
