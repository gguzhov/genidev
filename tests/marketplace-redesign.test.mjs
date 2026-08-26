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
  assert.match(marketplaceSource, /<h2 id="projects-title">\{copy\.title\}<\/h2>/);
  assert.match(marketplaceSource, /<p>\{copy\.description\}<\/p>/);
  assert.doesNotMatch(marketplaceSource, /Реализованные проекты/);
});

test("uses a snap slider whose cards grow deliberately across breakpoints", () => {
  const tablet = marketplaceCss.slice(
    marketplaceCss.indexOf("@media (min-width: 768px)"),
    marketplaceCss.indexOf("@media (min-width: 1024px)"),
  );
  const desktop = marketplaceCss.slice(
    marketplaceCss.indexOf("@media (min-width: 1024px)"),
    marketplaceCss.indexOf("@media (hover: hover)"),
  );

  assert.match(marketplaceCss, /\.marketplace__viewport\s*\{[^}]*scroll-snap-type:\s*x mandatory/s);
  assert.match(marketplaceCss, /\.marketplace__track\s*\{[^}]*display:\s*flex/s);
  assert.match(tablet, /\.marketplace__track\s*\{[^}]*--marketplace-card-width:\s*min\(54vw,\s*460px\)/s);
  assert.match(desktop, /\.marketplace__track\s*\{[^}]*--marketplace-card-width:\s*min\(39vw,\s*500px\)/s);
  assert.match(marketplaceCss, /\.marketplace__track::after\s*\{[^}]*100vw[^}]*--marketplace-card-width/s);
  assert.match(marketplaceCss, /\.project-card__media,[\s\S]*?aspect-ratio:\s*3\s*\/\s*2/);
});

test("keeps slider cards keyboard-operable and uses a stable media ratio", () => {
  assert.match(cardSource, /type="button"/);
  assert.match(cardSource, /aria-label=\{`\$\{ui\?\.case\?\.open/);
  assert.match(marketplaceCss, /aspect-ratio:\s*3\s*\/\s*2/);
});

test("keeps minimal marketplace cards while full cases retain four results", () => {
  assert.equal(projects.length, 4);
  for (const project of projects) assert.equal(project.metrics.length, 4);

  assert.match(cardSource, /project-card__tags/);
  assert.match(cardSource, /project\.summary/);
  assert.doesNotMatch(cardSource, /project\.duration|project\.status|project\.metrics\.map/);
  assert.match(cardSource, /onClick=\{\(\) => onOpenProject\(project\.slug\)\}/);
  assert.equal((cardSource.match(/<button/g) ?? []).length, 1);
  const datoniks = projects.find(({ slug }) => slug === "datoniks");
  assert.deepEqual(datoniks?.tags, ["Телеком", "Дата-центр"]);
});

test("keeps DATONIKS evidence cover with an exact logo plate", async () => {
  const datoniks = projects.find(({ slug }) => slug === "datoniks");
  assert.deepEqual(
    {
      evidence: datoniks?.cover,
      logo: datoniks?.visual.logo,
    },
    {
      evidence: "/projects/datoniks/datoniks-slide-03.webp",
      logo: "/projects/brands/datoniks-logo.png",
    },
  );
  await Promise.all([
    access("public/projects/datoniks/datoniks-slide-03.webp"),
    access("public/projects/brands/datoniks-logo.png"),
  ]);
  assert.match(visualSource, /project-visual__gradient/);
  assert.doesNotMatch(visualSource, /project\.visual\.background|project-visual__background/);
  assert.doesNotMatch(visualSource, /project-visual__product/);
  assert.match(visualSource, /project-visual__logo/);
  assert.match(visualSource, /project-visual__cover/);
  assert.match(visualSource, /project-visual__logo-plate/);
});

test("uses a distinct CSS gradient for the DATONIKS visual surface", () => {
  assert.match(
    marketplaceCss,
    /\.project-visual--datoniks\s*\{[^}]*background:/s,
  );
});

test("keeps marketplace artwork static instead of attaching pointer compositing", () => {
  assert.match(cardSource, /<ProjectVisual project=\{project\} interactive=\{false\}/);
  assert.doesNotMatch(marketplaceCss, /project-visual--depth-active|will-change:\s*transform/);
  assert.doesNotMatch(marketplaceCss, /\.project-card:hover\s*\{[^}]*transform:/s);
  assert.match(marketplaceCss, /\.project-visual__logo-plate\s*\{[^}]*transform:\s*translate\(-50%,\s*-50%\)/s);
});
