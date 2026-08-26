import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the hero focused on positioning and independent from the background shader", async () => {
  const app = await readFile("src/App.jsx", "utf8");

  assert.doesNotMatch(app, /<WorkSequence/);
  assert.doesNotMatch(app, /LiquidEther/);
  assert.doesNotMatch(app, /shouldRenderHeroEther/);
});

test("keeps the career route animated once and reduced-motion safe", async () => {
  const [component, styles] = await Promise.all([
    readFile("src/components/CareerTimeline/CareerTimeline.jsx", "utf8"),
    readFile("src/components/CareerTimeline/CareerTimeline.css", "utf8"),
  ]);

  assert.match(component, /career-route__plane/);
  assert.match(component, /requestAnimationFrame/);
  assert.match(styles, /--career-scroll-progress/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(styles, /animation-iteration-count:\s*infinite/);
});

test("uses the approved reveal token for the profile", async () => {
  const styles = await readFile("src/styles/hero.css", "utf8");

  assert.match(styles, /hero-portrait-in\s+var\(--motion-reveal\)/);
  assert.doesNotMatch(
    styles,
    /\.profile-card-wrapper\s*\{[^}]*--reveal-duration:\s*620ms/s,
  );
});
