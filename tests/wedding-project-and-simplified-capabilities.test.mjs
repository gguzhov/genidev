import assert from "node:assert/strict";
import test from "node:test";

import { getSiteContent, problems, projects } from "../src/content/siteContent.js";
import { projectPath, projectSlugFromPath } from "../src/lib/projectRouting.js";

test("describes buildable systems in language a business owner can scan", () => {
  assert.deepEqual(
    problems.map(({ solutions }) => solutions.slice(0, 3).map(({ title }) => title)),
    [
      ["Контент-завод", "Аналитика вирусности", "Дизайн постов и каруселей"],
      ["Холодные звонки с помощью AI", "AI-руководитель продаж", "Магазин в Telegram и MAX"],
      ["Цифровой двойник бизнеса", "CRM и ERP для вашей отрасли", "Панель руководителя"],
      ["AI-подбор сотрудников", "Онбординг новых сотрудников", "Закупки и счета без ручной работы"],
      ["Локальный AI-контур", "Агентная разработка с AI", "GPU-инфраструктура под нагрузку"],
      ["Аудит процессов и AI-дорожная карта", "Пилот на реальных данных", "Обучение команды и стандарты"],
    ],
  );

  for (const problem of problems) {
    for (const solution of problem.solutions.slice(0, 3)) {
      assert.equal("process" in solution, false);
      assert.ok(solution.project.length <= 120, `${solution.title}: solution is too long`);
      assert.ok(solution.effect.length <= 90, `${solution.title}: result is too long`);
    }
  }
});

test("publishes Wedding Vote as a complete bilingual route-backed case", () => {
  const project = projects.find(({ slug }) => slug === "wedding-vote");
  assert.ok(project);
  assert.equal(project.title, "Wedding Vote");
  assert.deepEqual(project.tags, ["EventTech", "Web"]);
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
