import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const covers = [
  "public/projects/covers/ostrov-ice-dna-v5.webp",
  "public/projects/covers/ilonmask-ice-orbit-v5.webp",
  "public/projects/covers/datoniks-ice-compute-v5.webp",
  "public/projects/covers/wedding-ice-flora-v5.webp",
];

test("defers the project case code until a visitor opens a project", async () => {
  const app = await readFile("src/App.jsx", "utf8");

  assert.match(app, /lazy\(\(\) => import\("\.\/components\/ProjectCase\/ProjectCase"\)\)/);
  assert.match(app, /<Suspense fallback=\{null\}>[\s\S]*<ProjectCase/);
  assert.doesNotMatch(app, /import ProjectCase from/);
});

test("does not request the expanded-menu artwork before the menu opens", async () => {
  const css = await readFile("src/components/CardNav/CardNav.css", "utf8");

  assert.match(
    css,
    /\.card-nav--content-visible \.card-nav__visual\s*\{[^}]*background-image:\s*url\("\/images\/ai-neural-orb-v2\.webp"\)/s,
  );
});

test("loads GSAP only when the visitor expresses intent to open navigation", async () => {
  const nav = await readFile("src/components/CardNav/CardNav.jsx", "utf8");

  assert.doesNotMatch(nav, /import \{ gsap \} from "gsap"|import \{ CustomEase \} from/);
  assert.match(nav, /import\("gsap"\)/);
  assert.match(nav, /import\("gsap\/CustomEase"\)/);
  assert.match(nav, /onPointerEnter=\{prepareAnimationRuntime\}/);
  assert.match(nav, /onFocus=\{prepareAnimationRuntime\}/);
});

test("keeps every generated project cover below 180 KB", async () => {
  for (const cover of covers) {
    const metadata = await stat(cover);
    assert.ok(metadata.size <= 180 * 1024, `${cover} is ${metadata.size} bytes`);
  }
});
