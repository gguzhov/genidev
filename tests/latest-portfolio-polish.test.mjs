import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  getReachedCareerIndexesByPositions,
  smoothCareerProgress,
} from "../src/components/CareerTimeline/careerTimelineState.js";
import { problems, projects, sectionCopy, socialLinks } from "../src/content/siteContent.js";

const read = (path) => readFile(path, "utf8");

test("capabilities are three concise products plus an open digital solution", async () => {
  for (const capability of problems) {
    assert.equal(capability.solutions.length, 4);
    assert.equal(capability.solutions.at(-1).title, "И другое цифровое решение");
    for (const solution of capability.solutions.slice(0, 3)) {
      assert.ok(solution.project.length <= 150, `${capability.id}/${solution.title}: concise project`);
      assert.ok(solution.effect.length <= 115, `${capability.id}/${solution.title}: concise effect`);
      assert.equal("process" in solution, false, `${capability.id}/${solution.title}: no duplicate process`);
    }
  }

  const component = await read("src/components/ProblemSelector/ProblemSelector.jsx");
  assert.doesNotMatch(component, /problem-selector__tab-icon/);
  assert.doesNotMatch(component, /problem-selector__solution-top[\s\S]*selected\.icon/);
  assert.doesNotMatch(component, /problem-selector__solution-process/);
  assert.match(component, /problem-selector__solution-system/);
  assert.match(component, /problem-selector__solution-result/);
  assert.doesNotMatch(component, /<strong>\{solution\.effect\}<\/strong>/);
});

test("career uses the thorny-path heading and scroll progress drives milestones smoothly", () => {
  assert.equal(sectionCopy.career.title, "Мой карьерный тернистый путь");
  assert.equal(smoothCareerProgress(0, 1, 0.2), 0.2);
  assert.equal(smoothCareerProgress(0.9996, 1, 0.2), 1);
  assert.deepEqual(
    getReachedCareerIndexesByPositions(360, [80, 220, 420, 640]),
    [0, 1],
  );
});

test("footer publishes the technology channel and uses the supplied brand assets", async () => {
  const telegram = socialLinks.find(({ id }) => id === "telegram");
  assert.equal(telegram.href, "https://t.me/oxotatech");
  assert.equal(telegram.meta, "Мой канал — Охота за технологиями");
  assert.equal(telegram.icon, "/icons/oxotatech.svg");

  const footer = await read("src/components/SiteFooter/SiteFooter.jsx");
  assert.match(footer, /genidev-avatar\.webp/);
  assert.doesNotMatch(footer, /footerPerson/);

  const { ruUi } = await import("../src/content/siteContent.js");
  assert.equal(ruUi.footerIdentity, "Геннадий\nГужов");
});

test("hero scroll affordance is unboxed and marketplace cards no longer move", async () => {
  const hero = await read("src/styles/hero.css");
  const marketplace = await read("src/components/ProjectMarketplace/ProjectMarketplace.css");
  const marketplaceComponent = await read("src/components/ProjectMarketplace/ProjectMarketplace.jsx");

  assert.match(hero, /hero-scroll-float/);
  assert.match(hero, /\.hero__scroll\s*\{[^}]*background:\s*transparent/s);
  assert.doesNotMatch(marketplace, /\.project-card:hover\s*\{[^}]*transform:/s);
  assert.doesNotMatch(marketplaceComponent, /createMarketplaceRevealLifecycle/);
});

test("project cases call the outcome Result and evidence is a full slide track", async () => {
  const ruCase = (await import("../src/content/siteContent.js")).ruUi.case;
  assert.equal(ruCase.benefit, "Результат");
  for (const project of projects) assert.equal(project.metrics.length, 4);

  const gallery = await read("src/components/ProjectCase/ProjectGallery.jsx");
  assert.match(gallery, /project-gallery__track/);
  assert.match(gallery, /images\.map/);
  assert.match(gallery, /project-gallery__slide/);
  assert.doesNotMatch(gallery, /project-gallery__thumbnails/);
  assert.match(gallery, /event\.preventDefault\(\)/);
});

test("shared primary actions have one visible, accessible button style", async () => {
  const globalCss = await read("src/styles/global.css");
  assert.match(globalCss, /\.button\s*\{[^}]*min-height:\s*52px/s);
  assert.match(globalCss, /\.button--primary\s*\{[^}]*background:\s*var\(--color-accent\)/s);
});
