import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import { projects, sectionCopy } from "../src/content/siteContent.js";

const [marketplaceSource, cardSource, visualSource, marketplaceCss] = await Promise.all([
  readFile("src/components/ProjectMarketplace/ProjectMarketplace.jsx", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectVisual.jsx", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8"),
]);

test("publishes the approved marketplace heading without the obsolete eyebrow", () => {
  assert.equal(sectionCopy.marketplace.title, "Маркетплейс моих разработок");
  assert.equal(
    sectionCopy.marketplace.description,
    "В каждом проекте я прошёл путь от постановки проблемы и анализа бизнес-процессов до разработки и запуска.",
  );
  assert.match(marketplaceSource, /sectionCopy\.marketplace\.title/);
  assert.match(marketplaceSource, /sectionCopy\.marketplace\.description/);
  assert.doesNotMatch(marketplaceSource, /Реализованные проекты/);
});

test("uses one, two and three equal columns at the approved breakpoints", () => {
  const tablet = marketplaceCss.slice(
    marketplaceCss.indexOf("@media (min-width: 768px)"),
    marketplaceCss.indexOf("@media (min-width: 1024px)"),
  );
  const desktop = marketplaceCss.slice(
    marketplaceCss.indexOf("@media (min-width: 1024px)"),
    marketplaceCss.indexOf("@media (hover: hover)"),
  );

  assert.match(marketplaceCss, /\.marketplace__grid\s*\{[^}]*display:\s*grid/s);
  assert.match(tablet, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(tablet, /nth-child\(3\)|grid-column:\s*span/);
  assert.match(desktop, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(marketplaceCss, /\.project-card__media,[\s\S]*?aspect-ratio:\s*3\s*\/\s*2/);
});

test("equalizes complete tablet cards across both grid rows", () => {
  const tablet = marketplaceCss.slice(
    marketplaceCss.indexOf("@media (min-width: 768px)"),
    marketplaceCss.indexOf("@media (min-width: 1024px)"),
  );

  assert.match(
    tablet,
    /\.marketplace__grid\s*\{[^}]*grid-auto-rows:\s*1fr/s,
  );
  assert.match(marketplaceCss, /\.project-card\s*\{[^}]*height:\s*100%/s);
});

test("shows exactly four rectangular evidence results and a truthful status row", () => {
  assert.equal(projects.length, 3);
  for (const project of projects) assert.equal(project.metrics.length, 4);

  assert.match(cardSource, /project-card__meta/);
  assert.match(cardSource, /project\.status\s*\?\?\s*"Реализованный продукт"/);
  assert.match(cardSource, /project\.duration/);
  assert.match(cardSource, /project\.metrics\.map/);
  assert.match(cardSource, /onClick=\{\(\) => onOpenProject\(project\.slug\)\}/);
  assert.equal((cardSource.match(/<button/g) ?? []).length, 1);
  assert.match(
    marketplaceCss,
    /\.project-card__metrics\s*>\s*li\s*\{[^}]*border-radius:\s*var\(--radius-control\)/s,
  );

  const datoniks = projects.find(({ slug }) => slug === "datoniks");
  assert.equal(datoniks?.status, "Инвестиционный проект · ищу партнёра");
});

test("keeps DATONIKS atmosphere, real slide and exact logo as independent layers", async () => {
  const datoniks = projects.find(({ slug }) => slug === "datoniks");
  assert.deepEqual(
    {
      atmosphere: datoniks?.visual.background,
      evidence: datoniks?.cover,
      logo: datoniks?.visual.logo,
    },
    {
      atmosphere: "/projects/ice/datoniks-ice-v1.webp",
      evidence: "/projects/datoniks/datoniks-slide-03.webp",
      logo: "/projects/datoniks/datoniks-logo.webp",
    },
  );
  await Promise.all([
    access("public/projects/ice/datoniks-ice-v1.webp"),
    access("public/projects/datoniks/datoniks-slide-03.webp"),
    access("public/projects/datoniks/datoniks-logo.webp"),
  ]);
  assert.match(visualSource, /project-visual__atmosphere/);
  assert.match(visualSource, /project-visual__product/);
  assert.match(visualSource, /project-visual__logo/);
});

test("gives the exact light DATONIKS logo a project-palette contrast surface", () => {
  assert.match(
    marketplaceCss,
    /\.project-visual--datoniks \.project-visual__logo\s*\{[^}]*background:\s*var\(--color-accent\)/s,
  );
});

test("activates layer compositing only during allowed pointer interaction", async () => {
  const { createProjectPointerLifecycle } = await import(
    "../src/components/ProjectMarketplace/projectVisualPointerLifecycle.js"
  );
  const cardListeners = new Map();
  const classes = new Set();
  const media = {
    fine: createMedia(true),
    reduced: createMedia(false),
  };
  const visual = {
    classList: {
      add: (className) => classes.add(className),
      remove: (className) => classes.delete(className),
    },
  };
  const card = {
    addEventListener: (type, handler) => cardListeners.set(type, handler),
    removeEventListener(type, handler) {
      if (cardListeners.get(type) === handler) cardListeners.delete(type);
    },
  };
  const cleanup = createProjectPointerLifecycle({
    card,
    visual,
    interactive: true,
    matchMedia: (query) => (query.includes("prefers-reduced") ? media.reduced : media.fine),
    onPointerMove: () => {},
    resetDepth: () => {},
  });

  assert.deepEqual([...cardListeners.keys()].sort(), ["pointerleave", "pointermove"]);
  assert.equal(classes.has("project-visual--depth-active"), false);
  cardListeners.get("pointermove")({ clientX: 0, clientY: 0 });
  assert.equal(classes.has("project-visual--depth-active"), true);
  cardListeners.get("pointerleave")();
  assert.equal(classes.has("project-visual--depth-active"), false);

  media.reduced.setMatches(true);
  assert.equal(cardListeners.size, 0);
  assert.equal(classes.has("project-visual--depth-active"), false);
  cleanup();

  assert.match(
    marketplaceCss,
    /\.project-visual--depth-active\s+\.project-visual__(?:atmosphere|product-frame|logo)[\s\S]*will-change:\s*transform/,
  );
  assert.equal((marketplaceCss.match(/will-change:\s*transform/g) ?? []).length, 1);
});

test("starts without pointer listeners or compositing when fine hover is unavailable", async () => {
  const { createProjectPointerLifecycle } = await import(
    "../src/components/ProjectMarketplace/projectVisualPointerLifecycle.js"
  );
  const cardListeners = new Map();
  const classes = new Set();
  const media = {
    fine: createMedia(false),
    reduced: createMedia(false),
  };
  const visual = {
    classList: {
      add: (className) => classes.add(className),
      remove: (className) => classes.delete(className),
    },
  };
  const card = {
    addEventListener: (type, handler) => cardListeners.set(type, handler),
    removeEventListener(type, handler) {
      if (cardListeners.get(type) === handler) cardListeners.delete(type);
    },
  };
  const cleanup = createProjectPointerLifecycle({
    card,
    visual,
    interactive: true,
    matchMedia: (query) => (query.includes("prefers-reduced") ? media.reduced : media.fine),
    onPointerMove: () => {},
    resetDepth: () => {},
  });

  assert.equal(cardListeners.size, 0);
  assert.equal(classes.has("project-visual--depth-active"), false);
  assert.match(
    marketplaceCss,
    /\.project-visual--depth-active\s+\.project-visual__atmosphere,[\s\S]*will-change:\s*transform/,
  );
  assert.equal((marketplaceCss.match(/will-change:\s*transform/g) ?? []).length, 1);

  cleanup();
  assert.equal(cardListeners.size, 0);
  assert.equal(classes.has("project-visual--depth-active"), false);
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
  };
}
