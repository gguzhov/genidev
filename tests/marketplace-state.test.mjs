import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DRIFT_WALL_LAYOUT,
  buildWallPresentation,
  getAnimationFrameAction,
  getNextTrackOffset,
  getTrackSegmentHeight,
  isRectVisibleInViewport,
  observeViewportVisibility,
  shouldAnimateDriftWall,
} from "../src/components/DriftWall/driftWallState.js";
import { shouldUseStaticMarketplace } from "../src/components/ProjectMarketplace/marketplaceState.js";

const [marketplaceSource, projectCardSource, marketplaceCssSource] = await Promise.all([
  readFile("src/components/ProjectMarketplace/ProjectMarketplace.jsx", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8"),
]);

const projects = [
  { slug: "ostrov", title: "Остров" },
  { slug: "ilonmask", title: "IlonMask" },
];

test("marketplace renders real projects directly without DriftWall duplication", () => {
  assert.doesNotMatch(marketplaceSource, /DriftWall/);
  assert.match(marketplaceSource, /projects\.map/);
  assert.match(projectCardSource, /project\.summary/);
});

test("marketplace motion is progressive enhancement for hover and keyboard focus", () => {
  assert.match(marketplaceCssSource, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(
    marketplaceCssSource,
    /\.project-card:focus-visible \.project-card__media img/,
  );
  assert.match(marketplaceCssSource, /@media \(prefers-reduced-motion: reduce\)/);
});

test("uses a static marketplace for constrained presentation modes", () => {
  assert.equal(
    shouldUseStaticMarketplace({ reducedMotion: true, coarsePointer: false, viewportWidth: 1440 }),
    true,
  );
  assert.equal(
    shouldUseStaticMarketplace({ reducedMotion: false, coarsePointer: true, viewportWidth: 1440 }),
    true,
  );
  assert.equal(
    shouldUseStaticMarketplace({ reducedMotion: false, coarsePointer: false, viewportWidth: 900 }),
    true,
  );
  assert.equal(
    shouldUseStaticMarketplace({
      reducedMotion: false,
      coarsePointer: false,
      viewportWidth: 1440,
      deviceMemory: 4,
      hardwareConcurrency: 8,
    }),
    true,
  );
});

test("keeps the animated wall for capable desktop input", () => {
  assert.equal(
    shouldUseStaticMarketplace({
      reducedMotion: false,
      coarsePointer: false,
      viewportWidth: 1280,
      deviceMemory: 8,
      hardwareConcurrency: 8,
    }),
    false,
  );
});

test("separates stable semantic controls from decorative wall tracks", () => {
  const presentation = buildWallPresentation(projects, { columns: 4, copies: 3 });
  const tiles = presentation.columns.flatMap((column) => column.tiles);

  assert.equal(presentation.columns.length, 4);
  assert.ok(tiles.length >= 24);
  assert.deepEqual(
    presentation.semanticProjects.map((project) => project.slug),
    projects.map((project) => project.slug),
  );
  assert.ok(tiles.every((tile) => tile.decorative && tile.tabIndex === -1));
});

test("uses strict real-viewport intersection boundaries", () => {
  const viewport = { viewportWidth: 1280, viewportHeight: 720 };

  assert.equal(
    isRectVisibleInViewport({ top: -20, bottom: 20, left: 10, right: 100 }, viewport),
    true,
  );
  assert.equal(
    isRectVisibleInViewport({ top: 720, bottom: 900, left: 10, right: 100 }, viewport),
    false,
  );
  assert.equal(
    isRectVisibleInViewport({ top: -200, bottom: 0, left: 10, right: 100 }, viewport),
    false,
  );
  assert.equal(
    isRectVisibleInViewport({ top: 10, bottom: 100, left: 1280, right: 1400 }, viewport),
    false,
  );
});

test("observes with zero root margin and cleans up the observer", () => {
  const calls = [];
  class Observer {
    constructor(callback, options) {
      this.callback = callback;
      calls.push(["construct", options]);
    }
    observe(element) {
      calls.push(["observe", element]);
    }
    disconnect() {
      calls.push(["disconnect"]);
    }
  }
  const element = {};
  const cleanup = observeViewportVisibility({ element, onChange() {}, Observer });

  assert.deepEqual(calls[0], ["construct", { rootMargin: "0px", threshold: 0 }]);
  assert.deepEqual(calls[1], ["observe", element]);
  cleanup();
  assert.deepEqual(calls[2], ["disconnect"]);
});

test("falls back to bounded scroll and resize checks with cleanup", () => {
  const listeners = new Map();
  const removed = [];
  const visibility = [];
  const windowTarget = {
    innerWidth: 1280,
    innerHeight: 720,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      removed.push([type, listener]);
    },
  };
  let rect = { top: 800, bottom: 1000, left: 0, right: 400 };
  const element = { getBoundingClientRect: () => rect };
  const cleanup = observeViewportVisibility({
    element,
    onChange: (visible) => visibility.push(visible),
    Observer: undefined,
    windowTarget,
  });

  assert.deepEqual(visibility, [false]);
  rect = { top: 700, bottom: 900, left: 0, right: 400 };
  listeners.get("scroll")();
  assert.deepEqual(visibility, [false, true]);
  cleanup();
  assert.deepEqual(
    removed.map(([type]) => type).sort(),
    ["resize", "scroll"],
  );
});

test("runs drift animation only while its lifecycle is active", () => {
  assert.equal(
    shouldAnimateDriftWall({ isVisible: true, documentHidden: false, reducedMotion: false }),
    true,
  );
  assert.equal(
    shouldAnimateDriftWall({ isVisible: false, documentHidden: false, reducedMotion: false }),
    false,
  );
  assert.equal(
    shouldAnimateDriftWall({ isVisible: true, documentHidden: true, reducedMotion: false }),
    false,
  );
  assert.equal(
    shouldAnimateDriftWall({ isVisible: true, documentHidden: false, reducedMotion: true }),
    false,
  );
});

test("decides when to schedule or cancel an animation frame", () => {
  assert.equal(getAnimationFrameAction({ active: true, frameId: null }), "schedule");
  assert.equal(getAnimationFrameAction({ active: true, frameId: 7 }), "none");
  assert.equal(getAnimationFrameAction({ active: false, frameId: 7 }), "cancel");
  assert.equal(getAnimationFrameAction({ active: false, frameId: null }), "none");
});

test("derives drift wrap height from the shared layout contract", () => {
  assert.deepEqual(DRIFT_WALL_LAYOUT, { tileHeight: 310, tileGap: 20 });
  assert.equal(getTrackSegmentHeight(2, DRIFT_WALL_LAYOUT), 660);
  assert.equal(getTrackSegmentHeight(0, DRIFT_WALL_LAYOUT), 0);
});

test("wraps track offsets in both drift directions", () => {
  assert.equal(getNextTrackOffset(95, 10, 1, 100), 5);
  assert.equal(getNextTrackOffset(5, -10, 1, 100), 95);
});
