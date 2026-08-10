import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const HERO_VISUAL_CONFIG_PATH = "src/content/heroVisualConfig.js";

test("mounts the hero WebGL only while motion is allowed", async () => {
  const app = await readFile("src/App.jsx", "utf8");

  assert.match(app, /shouldRenderHeroEther\(reducedMotion\)/);
  assert.match(app, /\{renderHeroEther\s*&&\s*\(\s*<LiquidEther/);
  assert.doesNotMatch(app, /autoDemo=\{!reducedMotion\}/);
});

test("uses one frozen module-level LiquidEther palette across App rerenders", async () => {
  assert.equal(
    await access(HERO_VISUAL_CONFIG_PATH).then(
      () => true,
      () => false,
    ),
    true,
    `Missing ${HERO_VISUAL_CONFIG_PATH}`,
  );

  const firstImport = await import(`../${HERO_VISUAL_CONFIG_PATH}`);
  const secondImport = await import(`../${HERO_VISUAL_CONFIG_PATH}`);
  const app = await readFile("src/App.jsx", "utf8");

  assert.strictEqual(firstImport.ETHER_COLORS, secondImport.ETHER_COLORS);
  assert.equal(Object.isFrozen(firstImport.ETHER_COLORS), true);
  assert.deepEqual(firstImport.ETHER_COLORS, ["#e7eaf1", "#ccd9f4", "#8fabef"]);
  assert.equal(firstImport.shouldRenderHeroEther(false), true);
  assert.equal(firstImport.shouldRenderHeroEther(true), false);
  assert.match(app, /import \{ ETHER_COLORS, shouldRenderHeroEther \}/);
  assert.match(app, /colors=\{ETHER_COLORS\}/);
  assert.doesNotMatch(app, /colors=\{\[/);
});
