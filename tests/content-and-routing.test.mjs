import assert from "node:assert/strict";
import test from "node:test";
import { career, contact, hero, problems, projects } from "../src/content/siteContent.js";
import { projectPath, projectSlugFromPath } from "../src/lib/projectRouting.js";

test("publishes the approved positioning and four business problems", () => {
  assert.equal(
    hero.title,
    "Геннадий Гужов — разработчик цифровых и AI-продуктов.",
  );
  assert.equal(
    hero.promise,
    "Превращаю бизнес-задачи в работающие цифровые продукты и автоматизированные процессы.",
  );
  assert.deepEqual(hero.sequence, [
    "Экономика",
    "Пользовательский путь",
    "Разработка",
    "AI",
    "Запуск и метрики",
  ]);
  assert.equal(hero.cta.label, "Решить проблему");
  assert.equal(hero.cta.href, "https://t.me/gguzhov");
  assert.equal(hero.cta.target, "_blank");
  assert.equal(hero.cta.rel, "noreferrer");
  assert.equal(contact.target, "_blank");
  assert.equal(contact.rel, "noreferrer");
  assert.deepEqual(problems.map(({ id }) => id), ["launch", "automate", "ai", "growth"]);
});

test("keeps the approved career sequence", () => {
  assert.deepEqual(career.map(({ year }) => year), ["2021–2024", "2024", "2025", "2025", "2026"]);
  assert.match(career[1].title, /модульных дата-центров/i);
  assert.match(career[2].body, /Лондонским университетом/i);
  assert.match(career[3].title, /ГКБ №15/i);
});

test("ships complete project cases without a role field", () => {
  assert.deepEqual(projects.map(({ slug }) => slug), ["ostrov-zdoroviya", "ilonmask-vpn"]);
  for (const project of projects) {
    assert.ok(project.problem.length > 80);
    assert.ok(project.actions.length >= 5);
    assert.ok(project.result.length >= 3);
    assert.ok(project.technical.length >= 3);
    assert.equal("role" in project, false);
  }
});

test("maps project routes in both directions", () => {
  assert.equal(projectPath("ostrov-zdoroviya"), "/projects/ostrov-zdoroviya");
  assert.equal(projectSlugFromPath("/projects/ilonmask-vpn"), "ilonmask-vpn");
  assert.equal(projectSlugFromPath("/projects/ostrov-zdoroviya/"), "ostrov-zdoroviya");
  assert.equal(projectSlugFromPath("/projects/%20"), null);
  assert.equal(projectSlugFromPath("/not-projects/ostrov-zdoroviya"), null);
  assert.equal(projectSlugFromPath("/projects/unknown/extra"), null);
  assert.equal(projectSlugFromPath("/"), null);
});
