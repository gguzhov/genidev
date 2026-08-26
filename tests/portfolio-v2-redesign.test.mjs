import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("capability copy names six concrete business directions", async () => {
  const { problems } = await import("../src/content/siteContent.js");

  assert.deepEqual(
    problems.map(({ id, title }) => [id, title]),
    [
      ["marketing", "Маркетинг"],
      ["sales", "Продажи"],
      ["management", "Управление"],
      ["operations", "Операционные процессы"],
      ["ai-infrastructure", "AI-инфраструктура"],
      ["enablement", "Обучение и сопровождение"],
    ],
  );

  for (const problem of problems) {
    assert.equal(problem.solutions.length, 4, `${problem.id}: four solution ideas`);
    assert.equal(problem.actions, undefined);
    assert.equal(problem.outcomes, undefined);
    assert.match(problem.icon, /^\/images\/capabilities\/[^/]+\.webp$/);
  }

  const allCopy = JSON.stringify(problems);
  for (const phrase of [
    "Контент-план из запросов клиентов",
    "Реклама до продажи",
    "Цифровой двойник бизнеса",
    "CRM",
    "ERP",
    "AI проверяет все разговоры",
    "Закупки под контролем",
    "Локальный AI внутри компании",
    "Найти задачи для AI",
    "И другое цифровое решение",
  ]) {
    assert.match(allCopy, new RegExp(phrase, "i"));
  }
});

test("capability UI uses text-led navigation and the hero uses a personal wordmark", () => {
  const component = read("src/components/ProblemSelector/ProblemSelector.jsx");
  const app = read("src/App.jsx");

  assert.match(component, /selected\.icon/);
  assert.doesNotMatch(component, /problem-selector__tab-icon/);
  assert.doesNotMatch(component, /problem-selector__tab-code/);
  assert.match(app, /hero\.nameLines\.map/);
  assert.match(app, /className="hero__letter"/);
  assert.doesNotMatch(app, /<PointerHighlight>/);
});

test("career is a scroll-driven route with a plane and verified milestones", async () => {
  const { career } = await import("../src/content/siteContent.js");
  const component = read("src/components/CareerTimeline/CareerTimeline.jsx");
  const css = read("src/components/CareerTimeline/CareerTimeline.css");
  const copy = JSON.stringify(career);

  assert.match(copy, /3 млн ₽/);
  assert.match(copy, /Солдвиг ПРО/);
  assert.match(copy, /Лондонск/);
  assert.match(copy, /32 → 80/);
  assert.match(component, /career-route__plane/);
  assert.match(component, /requestAnimationFrame/);
  assert.match(css, /--career-scroll-progress/);
  assert.match(css, /career-route__road/);
});

test("marketplace is a minimal horizontal slider", () => {
  const marketplace = read("src/components/ProjectMarketplace/ProjectMarketplace.jsx");
  const card = read("src/components/ProjectMarketplace/ProjectCard.jsx");
  const css = read("src/components/ProjectMarketplace/ProjectMarketplace.css");

  assert.match(marketplace, /marketplace__viewport/);
  assert.match(marketplace, /marketplace__previous/);
  assert.match(marketplace, /marketplace__next/);
  assert.match(marketplace, /aria-roledescription=\{ui\.carousel\}/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(card, /\{ui\?\.more \?\? "Подробнее"\}/);
  assert.doesNotMatch(card, /project-card__metrics/);
  assert.doesNotMatch(card, /project-card__duration/);
});

test("projects use exact tags, four results and simplified case sections", async () => {
  const { projects } = await import("../src/content/siteContent.js");
  const bySlug = Object.fromEntries(projects.map((project) => [project.slug, project]));
  const projectCase = read("src/components/ProjectCase/ProjectCase.jsx");

  assert.deepEqual(bySlug["ostrov-zdoroviya"].tags, ["Medtech", "Web", "AI"]);
  assert.deepEqual(bySlug["ilonmask-vpn"].tags, ["Сеть", "Web", "Автоматизация"]);
  assert.deepEqual(bySlug.datoniks.tags, ["Телеком", "Дата-центр"]);
  for (const project of projects) assert.equal(project.metrics.length, 4);

  assert.equal(bySlug["ilonmask-vpn"].challengeLabel, "Заказ на разработку");
  assert.doesNotMatch(JSON.stringify(projects), /1 неделя до запуска|1 месяц до запуска|Проект в развитии/);
  assert.doesNotMatch(JSON.stringify(projects), /В итоге заказчик получил не просто лендинг/);
  assert.match(projectCase, /project\.challengeLabel/);
  assert.match(projectCase, /\{ui\.case\.solution\}/);
  assert.match(projectCase, /\{ui\.case\.benefit\}/);
  assert.doesNotMatch(projectCase, /Навыки и инструменты/);
  assert.doesNotMatch(projectCase, /project\.primaryAction/);
});

test("project visuals use exact local brands over evidence covers", async () => {
  const { projects } = await import("../src/content/siteContent.js");

  for (const project of projects) {
    assert.match(project.visual.logo, /^\/projects\/brands\/[^/]+\.(?:png|webp)$/);
    assert.equal(project.visual.background, undefined);
  }

  for (const asset of [
    "public/projects/brands/ilonmask-logo.png",
    "public/projects/brands/datoniks-logo.png",
    "public/projects/brands/ostrov-logo.png",
    "public/projects/brands/wedding-vote-logo.png",
  ]) {
    assert.ok(existsSync(new URL(`../${asset}`, import.meta.url)), asset);
  }
  const visual = read("src/components/ProjectMarketplace/ProjectVisual.jsx");
  assert.match(visual, /src=\{project\.cardCover \?\? project\.cover\}/);
  assert.match(visual, /project-visual__logo-plate/);
});

test("CTA uses a cyborg visual and footer keeps concise verified social copy", async () => {
  const contactComponent = read("src/components/FinalContact/FinalContact.jsx");
  const footer = read("src/components/SiteFooter/SiteFooter.jsx");
  const { socialLinks } = await import("../src/content/siteContent.js");
  const socialCopy = JSON.stringify(socialLinks);

  assert.match(contactComponent, /gennady-cyborg-v2\.webp/);
  assert.doesNotMatch(contactComponent, /final-contact__orbit/);
  assert.doesNotMatch(footer, /<strong>\{link\.label\}<\/strong>/);
  assert.match(socialCopy, /Мой репозиторий проектов/);
  assert.match(socialCopy, /300 тыс\.\+ просмотров/);
  assert.doesNotMatch(socialCopy, /500 тыс/);
});

test("all display headings may use the full content width", () => {
  const sections = read("src/styles/sections.css");
  const hero = read("src/styles/hero.css");
  const contact = read("src/components/FinalContact/FinalContact.css");
  const projectCase = read("src/components/ProjectCase/ProjectCase.css");

  assert.match(sections, /\.section__heading\s*\{[^}]*max-width:\s*none/s);
  assert.match(sections, /\.section__heading h2\s*\{[^}]*max-width:\s*none/s);
  assert.match(hero, /\.hero__name\s*\{[^}]*width:\s*100%/s);
  assert.match(contact, /\.final-contact h2\s*\{[^}]*max-width:\s*none/s);
  assert.match(projectCase, /\.project-case__title\s*\{[^}]*max-width:\s*none/s);
});
