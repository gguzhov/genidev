import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("replaces the continuous hero WebGL with the bounded work sequence", async () => {
  const app = await readFile("src/App.jsx", "utf8");

  assert.match(app, /<WorkSequence items=\{hero\.sequence\} reducedMotion=\{reducedMotion\}/);
  assert.doesNotMatch(app, /LiquidEther/);
  assert.doesNotMatch(app, /shouldRenderHeroEther/);
});

test("animates the sequence once and renders it statically for reduced motion", async () => {
  const [component, styles] = await Promise.all([
    readFile("src/components/WorkSequence/WorkSequence.jsx", "utf8"),
    readFile("src/components/WorkSequence/WorkSequence.css", "utf8"),
  ]);

  assert.match(component, /"--sequence-index": index/);
  assert.match(component, /work-sequence--static/);
  assert.match(styles, /var\(--sequence-index\)/);
  assert.match(styles, /@keyframes work-sequence-reveal/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.work-sequence--static/);
  assert.doesNotMatch(styles, /animation-iteration-count:\s*infinite/);
});
