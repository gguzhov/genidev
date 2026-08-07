import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWallColumns,
  getNextTrackOffset,
  shouldAnimateDriftWall,
} from "../src/components/DriftWall/driftWallState.js";
import { shouldUseStaticMarketplace } from "../src/components/ProjectMarketplace/marketplaceState.js";

const projects = [
  { slug: "ostrov", title: "Остров" },
  { slug: "ilonmask", title: "IlonMask" },
];

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

test("duplicates visual tracks without duplicating accessible projects", () => {
  const columns = buildWallColumns(projects, { columns: 4, copies: 3 });
  const tiles = columns.flatMap((column) => column.tiles);
  const accessible = tiles.filter((tile) => !tile.decorative);

  assert.equal(columns.length, 4);
  assert.ok(tiles.length >= 24);
  assert.deepEqual(
    accessible.map((tile) => tile.project.slug).sort(),
    projects.map((project) => project.slug).sort(),
  );
  assert.ok(tiles.filter((tile) => tile.decorative).every((tile) => tile.tabIndex === -1));
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

test("wraps track offsets in both drift directions", () => {
  assert.equal(getNextTrackOffset(95, 10, 1, 100), 5);
  assert.equal(getNextTrackOffset(5, -10, 1, 100), 95);
});
