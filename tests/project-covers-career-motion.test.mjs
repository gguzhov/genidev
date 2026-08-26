import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, projectRoot), "utf8");

test("uses one thematic 3:2 cover for every project card", async () => {
  const content = await read("src/content/siteContent.js");
  const covers = [
    "/projects/covers/ostrov-xray-dna-v4.webp",
    "/projects/covers/ilonmask-xray-orbit-v4.webp",
    "/projects/covers/datoniks-xray-compute-v4.webp",
    "/projects/covers/wedding-xray-flora-v4.webp",
  ];

  for (const cover of covers) {
    assert.match(content, new RegExp(cover.replaceAll("/", "\\/")));
    await access(new URL(`public${cover}`, projectRoot));
  }

  assert.equal((content.match(/cardCoverWidth:\s*1536/g) ?? []).length, 4);
  assert.equal((content.match(/cardCoverHeight:\s*1024/g) ?? []).length, 4);
});

test("keeps every project CTA full-width and equal-height", async () => {
  const css = await read("src/components/ProjectMarketplace/ProjectMarketplace.css");
  const bodyRule = css.match(/\.project-card__body\s*\{(?<body>[^}]*)\}/s)?.groups?.body ?? "";
  const buttonRule = css.match(/\.project-card__open\s*\{(?<body>[^}]*)\}/s)?.groups?.body ?? "";

  assert.match(bodyRule, /grid-template-rows:\s*auto\s+auto\s+1fr\s+auto/);
  assert.match(buttonRule, /justify-self:\s*stretch/);
  assert.match(buttonRule, /width:\s*100%/);
  assert.match(buttonRule, /min-height:\s*52px/);
  assert.match(buttonRule, /text-align:\s*center/);
});

test("drives the career route, airplane and checkpoints from one Motion spring", async () => {
  const [component, packageJson] = await Promise.all([
    read("src/components/CareerTimeline/CareerTimeline.jsx"),
    read("package.json"),
  ]);

  assert.match(packageJson, /"motion"\s*:/);
  assert.match(component, /from\s+"motion\/react"/);
  assert.match(component, /useScroll\s*\(/);
  assert.match(component, /useSpring\s*\(/);
  assert.match(component, /useMotionValueEvent\s*\(activeProgress,\s*"change"/);
  assert.match(component, /<motion\.path[\s\S]*style=\{\{\s*pathLength:\s*activeProgress\s*\}\}/);
  assert.match(component, /<motion\.span[\s\S]*style=\{\{\s*x:\s*planeX,\s*y:\s*planeY,\s*rotate:\s*planeAngle\s*\}\}/);
  assert.doesNotMatch(component, /requestAnimationFrame|stroke-dashoffset/);
});

test("shows one reduced-motion-safe page progress line across the header", async () => {
  const [progress, navigation, css] = await Promise.all([
    read("src/components/core/ScrollProgress.jsx"),
    read("src/components/CardNav/CardNav.jsx"),
    read("src/components/CardNav/CardNav.css"),
  ]);

  assert.match(progress, /useScroll\s*\(\)/);
  assert.match(progress, /useSpring\s*\(scrollYProgress/);
  assert.match(progress, /reducedMotion\s*\?\s*scrollYProgress\s*:\s*smoothProgress/);
  assert.match(progress, /style=\{\{ scaleX: activeProgress \}\}/);
  assert.match(navigation, /<ScrollProgress\s+className="card-nav__scroll-progress"\s*\/>/);
  assert.match(css, /\.card-nav__scroll-progress\s*\{[^}]*top:\s*62px[^}]*left:\s*8px[^}]*width:\s*calc\(100% - 16px\)[^}]*height:\s*2px/s);
  assert.match(css, /transform-origin:\s*left center/);
});

test("lets section descriptions use the full content width before wrapping", async () => {
  const css = await read("src/styles/sections.css");
  const descriptionRule = css.match(
    /\.section__heading\s*>\s*p:last-child\s*\{(?<body>[^}]*)\}/s,
  )?.groups?.body ?? "";

  assert.match(descriptionRule, /width:\s*100%/);
  assert.match(descriptionRule, /max-width:\s*none/);
  assert.doesNotMatch(descriptionRule, /max-width:\s*\d+ch/);
});
