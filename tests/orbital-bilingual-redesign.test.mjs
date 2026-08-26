import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("publishes complete RU and EN content with locale-aware project routes", async () => {
  const { getSiteContent, supportedLocales } = await import("../src/content/siteContent.js");
  const { localizedHomePath, projectPath, projectSlugFromPath, resolveLocale } =
    await import("../src/lib/projectRouting.js");

  assert.deepEqual(supportedLocales, ["ru", "en"]);
  for (const locale of supportedLocales) {
    const content = getSiteContent(locale);
    assert.equal(content.locale, locale);
    assert.equal(content.problems.length, 6);
    assert.equal(content.career.length, 5);
    assert.equal(content.projects.length, 4);
    assert.equal(content.navigation.length, 4);
    assert.ok(content.navigation.some(({ id }) => id === "about"));
    assert.ok(content.navigation.some(({ id, href }) => id === "articles" && href.includes("habr.com")));
    assert.equal(content.ui.languageSwitch.length, 2);
  }

  assert.equal(localizedHomePath("ru"), "/");
  assert.equal(localizedHomePath("en"), "/en");
  assert.equal(projectPath("datoniks", "ru"), "/projects/datoniks");
  assert.equal(projectPath("datoniks", "en"), "/en/projects/datoniks");
  assert.equal(projectSlugFromPath("/en/projects/ilonmask-vpn"), "ilonmask-vpn");
  assert.equal(resolveLocale("/en/projects/datoniks"), "en");
  assert.equal(resolveLocale("/projects/datoniks"), "ru");
});

test("removes the process diagram and marketplace badge while publishing delivery dates", async () => {
  const app = read("src/App.jsx");
  const marketplace = read("src/components/ProjectMarketplace/ProjectMarketplace.jsx");
  const noscript = read("src/content/renderNoscriptFallback.js");
  const { hero, projects, sectionCopy } = await import("../src/content/siteContent.js");

  assert.equal(hero.sequence, undefined);
  assert.doesNotMatch(app, /WorkSequence/);
  assert.doesNotMatch(noscript, /hero\.sequence|noscript-site__sequence/);
  assert.doesNotMatch(marketplace, /marketplace__badge|проекта · от задачи до запуска/);
  assert.equal(sectionCopy.problems.description, undefined);
  assert.deepEqual(
    projects.map(({ slug, deliveredAt }) => [slug, deliveredAt]),
    [
      ["ostrov-zdoroviya", "Июль 2026"],
      ["ilonmask-vpn", "Май 2026"],
      ["datoniks", "Июнь 2025"],
      ["wedding-vote", "Август 2026"],
    ],
  );
});

test("capabilities describe buildable systems and measurable operational changes", async () => {
  const { problems } = await import("../src/content/siteContent.js");

  for (const capability of problems) {
    assert.equal(capability.solutions.length, 4);
    for (const solution of capability.solutions) {
      assert.ok(solution.project.length >= 8, `${capability.id}/${solution.title}: concrete system`);
      assert.ok(solution.effect.length >= 8, `${capability.id}/${solution.title}: measurable effect`);
      assert.doesNotMatch(solution.project + solution.effect, /комплексн|инновацион|эффективн.*решен/i);
    }
  }
});

test("career plane follows the SVG road and career copy sells only confirmed evidence", async () => {
  const component = read("src/components/CareerTimeline/CareerTimeline.jsx");
  const css = read("src/components/CareerTimeline/CareerTimeline.css");
  const { career } = await import("../src/content/siteContent.js");

  assert.match(component, /getPointAtLength/);
  assert.match(component, /getTotalLength/);
  assert.doesNotMatch(component, /Math\.sin\(progress/);
  assert.match(component, /planeAngle\.set\(geometry\.angle\)/);
  assert.match(component, /style=\{\{ x: planeX, y: planeY, rotate: planeAngle \}\}/);
  assert.match(css, /will-change:\s*transform/);
  assert.match(JSON.stringify(career), /Wildberries/);
  assert.match(JSON.stringify(career), /недоплаты ОМС/);
  assert.doesNotMatch(JSON.stringify(career), /ответственно|полностью подтверждено/i);
});

test("project previews use evidence covers, rectangular logos and exactly four bento results", async () => {
  const visual = read("src/components/ProjectMarketplace/ProjectVisual.jsx");
  const marketplaceCss = read("src/components/ProjectMarketplace/ProjectMarketplace.css");
  const caseComponent = read("src/components/ProjectCase/ProjectCase.jsx");
  const caseCss = read("src/components/ProjectCase/ProjectCase.css");
  const gallery = read("src/components/ProjectCase/ProjectGallery.jsx");
  const { projects } = await import("../src/content/siteContent.js");

  assert.match(visual, /project\.cover/);
  assert.match(visual, /project-visual__cover/);
  const ilonRule = marketplaceCss.match(/\.project-visual--ilonmask-vpn \.project-visual__logo\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(ilonRule, /border-radius:\s*50%/);
  assert.match(marketplaceCss, /project-visual__logo-plate/);
  assert.doesNotMatch(caseComponent, /project-case__metric--lead/);
  assert.match(caseCss, /grid-template-columns:\s*repeat\(2/);
  assert.doesNotMatch(caseCss, /project-case__metric--lead|nth-child/);
  assert.doesNotMatch(gallery, /ArrowLeft02Icon|ArrowRight02Icon/);
  assert.match(gallery, /project-gallery__track/);
  assert.match(gallery, /project-gallery__slide/);
  for (const project of projects) assert.equal(project.metrics.length, 4);
});

test("uses one continuous orbital canvas and a blended CTA portrait", () => {
  const sections = read("src/styles/sections.css");
  const contact = read("src/components/FinalContact/FinalContact.jsx");
  const contactCss = read("src/components/FinalContact/FinalContact.css");

  assert.doesNotMatch(sections, /\.problem-section\s*\{[^}]*background:/s);
  assert.match(contact, /gennady-cyborg-v2\.webp/);
  assert.match(contactCss, /mask-image|-webkit-mask-image/);
  assert.ok(existsSync(new URL("../public/images/gennady-cyborg-v2.webp", import.meta.url)));
});
