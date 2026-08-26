import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  clampMarketplaceIndex,
  findClosestMarketplaceIndex,
} from "../src/components/ProjectMarketplace/marketplaceSliderState.js";

test("clamps marketplace navigation to the available project range", () => {
  assert.equal(clampMarketplaceIndex(-2, 3), 0);
  assert.equal(clampMarketplaceIndex(1, 3), 1);
  assert.equal(clampMarketplaceIndex(7, 3), 2);
  assert.equal(clampMarketplaceIndex(1, 0), 0);
});

test("finds the project card closest to the viewport scroll position", () => {
  assert.equal(findClosestMarketplaceIndex(0, [0, 390, 780]), 0);
  assert.equal(findClosestMarketplaceIndex(440, [0, 390, 780]), 1);
  assert.equal(findClosestMarketplaceIndex(720, [0, 390, 780]), 2);
  assert.equal(findClosestMarketplaceIndex(100, []), 0);
});

test("exposes keyboard navigation for the horizontal project rail", async () => {
  const source = await readFile(
    new URL("../src/components/ProjectMarketplace/ProjectMarketplace.jsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /ArrowLeft:[\s\S]*ArrowRight:[\s\S]*Home:[\s\S]*End:/);
  assert.match(source, /onKeyDown=\{handleViewportKeyDown\}/);
});

test("disables scripted smooth scrolling when reduced motion is requested", async () => {
  const source = await readFile(
    new URL("../src/components/ProjectMarketplace/ProjectMarketplace.jsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /useReducedMotion/);
  assert.match(source, /behavior:\s*reducedMotion\s*\?\s*"auto"\s*:\s*"smooth"/);
});
