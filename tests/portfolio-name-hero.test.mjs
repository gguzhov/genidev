import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getSiteContent } from "../src/content/siteContent.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("hero presents the localized name as a two-line personal wordmark", async () => {
  const ru = getSiteContent("ru").hero;
  const en = getSiteContent("en").hero;

  assert.equal(ru.title, "Геннадий Гужов");
  assert.deepEqual(ru.nameLines, ["Геннадий", "Гужов"]);
  assert.equal(ru.role, "Fullstack-разработчик цифровых и AI-продуктов");

  assert.equal(en.title, "Gennady Guzhov");
  assert.deepEqual(en.nameLines, ["Gennady", "Guzhov"]);
  assert.equal(en.role, "Full-stack digital and AI product developer");
});

test("hero centers the portrait capsule over the name and keeps one visible role", async () => {
  const app = await read("src/App.jsx");
  const css = await read("src/styles/hero.css");

  assert.match(app, /hero\.nameLines\.map/);
  assert.match(app, /className="hero__name-line"/);
  assert.match(app, /className="hero__portrait"/);
  assert.match(app, /variant="capsule"/);
  assert.match(app, /className="hero__role"/);
  assert.match(app, /href="#problems"/);
  assert.doesNotMatch(app, /className="hero__copy"/);
  assert.doesNotMatch(app, /<PointerHighlight>/);

  assert.match(css, /\.hero\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(css, /\.hero__name\s*\{[^}]*text-transform:\s*uppercase/s);
  assert.match(css, /\.hero__name-line\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /\.hero__portrait\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /\.hero__role\s*\{[^}]*text-align:\s*center/s);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
});

test("capsule portrait remains a bounded accessible image instead of a full card", async () => {
  const profile = await read("src/components/ProfileCard/ProfileCard.jsx");
  const css = await read("src/components/ProfileCard/ProfileCard.css");

  assert.match(profile, /variant = "card"/);
  assert.match(profile, /profile-card-wrapper--\$\{variant\}/);
  assert.match(css, /\.profile-card-wrapper--capsule\s*\{/);
  assert.match(css, /\.profile-card-wrapper--capsule \.profile-card\s*\{[^}]*border-radius:\s*999px/s);
  assert.match(css, /\.profile-card-wrapper--capsule \.profile-card__markers\s*\{[^}]*display:\s*none/s);
});

test("marketplace cards use dedicated gradient artwork with the official logo above it", async () => {
  const projects = getSiteContent("ru").projects;
  const visual = await read("src/components/ProjectMarketplace/ProjectVisual.jsx");
  const css = await read("src/components/ProjectMarketplace/ProjectMarketplace.css");

  assert.deepEqual(
    projects.map((project) => project.cardCover),
    [
      "/projects/covers/ostrov-xray-dna-v4.webp",
      "/projects/covers/ilonmask-xray-orbit-v4.webp",
      "/projects/covers/datoniks-xray-compute-v4.webp",
      "/projects/covers/wedding-xray-flora-v4.webp",
    ],
  );
  assert.ok(projects.every((project) => project.cardCoverWidth > 0));
  assert.ok(projects.every((project) => project.cardCoverHeight > 0));
  assert.match(visual, /src=\{project\.cardCover \?\? project\.cover\}/);
  assert.match(visual, /src=\{project\.visual\.logo\}/);
  assert.match(css, /\.project-visual__cover\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.project-visual__logo-plate\s*\{[^}]*z-index:\s*3/s);
});

test("capability ideas read as concrete buildable products and mobile navigation is text-first", async () => {
  const ru = getSiteContent("ru");
  const component = await read("src/components/ProblemSelector/ProblemSelector.jsx");
  const css = await read("src/components/ProblemSelector/ProblemSelector.css");

  assert.deepEqual(
    ru.problems.map((problem) => problem.solutions[0].title),
    [
      "Контент-завод",
      "Холодные звонки с помощью AI",
      "Цифровой двойник бизнеса",
      "AI-подбор сотрудников",
      "Локальный AI-контур",
      "Аудит процессов и AI-дорожная карта",
    ],
  );
  assert.ok(ru.problems.every((problem) => problem.solutions.length === 4));
  assert.match(css, /\.problem-selector__rail\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media \(min-width:\s*768px\)[\s\S]*\.problem-selector__rail\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media \(min-width:\s*1024px\)[\s\S]*\.problem-selector__rail\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/s);
  assert.doesNotMatch(component, /problem-selector__tab-icon/);
  assert.match(component, /className="problem-selector__carousel"/);
  assert.match(component, /className="problem-selector__slider-controls"/);
  assert.match(component, /String\(index \+ 1\)\.padStart\(2, "0"\)/);
  assert.match(css, /\.problem-selector__solutions\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /\.problem-selector__solution\s*\{[^}]*background:/s);
});

test("the surname and portrait carry more visual weight at every breakpoint", async () => {
  const heroCss = await read("src/styles/hero.css");
  const profileCss = await read("src/components/ProfileCard/ProfileCard.css");

  assert.match(heroCss, /\.hero__name-line:last-child\s*\{[^}]*font-size:\s*1\.12em/s);
  assert.match(profileCss, /\.profile-card-wrapper--capsule\s*\{[^}]*width:\s*clamp\(104px,\s*29vw,\s*156px\)/s);
  assert.match(profileCss, /@media \(min-width:\s*1024px\)[\s\S]*\.profile-card-wrapper--capsule\s*\{[^}]*width:\s*156px/s);
});

test("navigation keeps controls but removes the personal photo logo", async () => {
  const nav = await read("src/components/CardNav/CardNav.jsx");

  assert.doesNotMatch(nav, /gennady-logo\.webp/);
  assert.doesNotMatch(nav, /className="card-nav__brand"/);
  assert.match(nav, /card-nav__menu-button/);
  assert.match(nav, /className="card-nav__cta"/);
  assert.match(nav, /className="card-nav__language"/);
});
