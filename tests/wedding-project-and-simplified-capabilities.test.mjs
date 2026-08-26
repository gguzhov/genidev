import assert from "node:assert/strict";
import test from "node:test";

import { getSiteContent, problems, projects } from "../src/content/siteContent.js";
import { projectPath, projectSlugFromPath } from "../src/lib/projectRouting.js";

test("describes buildable systems in language a business owner can scan", () => {
  assert.deepEqual(
    problems.map(({ solutions }) => solutions.slice(0, 3).map(({ title }) => title)),
    [
      ["Контент-план из запросов клиентов", "Ролики из одной съёмки", "Реклама до продажи"],
      ["CRM, которая ведёт сделку", "AI проверяет все разговоры", "База знаний для продаж"],
      ["Цифровой двойник бизнеса", "CRM и ERP для вашей отрасли", "Панель руководителя"],
      ["Закупки под контролем", "Документы без ручного ввода", "Заявки не теряются"],
      ["Локальный AI внутри компании", "AI-поиск по документам", "AI-агенты для рутинных задач"],
      ["Найти задачи для AI", "Проверить AI на реальной задаче", "Обучить сотрудников работе с AI"],
    ],
  );

  for (const problem of problems) {
    for (const solution of problem.solutions.slice(0, 3)) {
      assert.match(solution.process, /→/);
      assert.ok(solution.process.length <= 52, `${solution.title}: process is too long`);
      assert.ok(solution.project.length <= 120, `${solution.title}: solution is too long`);
      assert.ok(solution.effect.length <= 80, `${solution.title}: result is too long`);
    }
  }
});

test("publishes Wedding Vote as a complete bilingual route-backed case", () => {
  const project = projects.find(({ slug }) => slug === "wedding-vote");
  assert.ok(project);
  assert.equal(project.title, "Wedding Vote");
  assert.deepEqual(project.tags, ["EventTech", "Web", "Realtime"]);
  assert.equal(project.metrics.length, 4);
  assert.equal(project.solution.length, 4);
  assert.equal(project.gallery.length, 3);
  assert.equal(project.url, "https://wedding.genidev.ru/");
  assert.match(project.summary, /QR/i);
  assert.match(project.benefit, /реальном времени/i);

  const english = getSiteContent("en").projects.find(({ slug }) => slug === "wedding-vote");
  assert.ok(english);
  assert.equal(english.title, "Wedding Vote");
  assert.equal(english.metrics.length, 4);
  assert.equal(projectPath(project.slug), "/projects/wedding-vote");
  assert.equal(projectSlugFromPath("/en/projects/wedding-vote"), "wedding-vote");
});
