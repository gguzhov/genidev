import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { career, hero, problems, projects } from "../src/content/siteContent.js";
import { getSiteContent } from "../src/content/siteContent.js";

const problemById = Object.fromEntries(problems.map((problem) => [problem.id, problem]));

test("hero positions Gennady as a full-stack digital and AI product developer", () => {
  assert.equal(hero.role, "Fullstack-разработчик цифровых и AI-продуктов");
  assert.equal(
    getSiteContent("en").hero.role,
    "Full-stack digital and AI product developer",
  );
});

test("capability cards contain concrete solutions without a duplicated process layer", () => {
  assert.deepEqual(
    problemById.marketing.solutions.slice(0, 3).map(({ title }) => title),
    ["Контент-завод", "Аналитика вирусности", "Дизайн постов и каруселей"],
  );
  assert.deepEqual(
    problemById.sales.solutions.slice(0, 3).map(({ title }) => title),
    ["Холодные звонки с помощью AI", "AI-руководитель продаж", "Магазин в Telegram и MAX"],
  );
  assert.deepEqual(
    problemById.operations.solutions.slice(0, 3).map(({ title }) => title),
    ["AI-подбор сотрудников", "Онбординг новых сотрудников", "Закупки и счета без ручной работы"],
  );
  assert.equal(problemById.enablement.title, "Технический консалтинг и обучение");

  for (const problem of problems) {
    for (const solution of problem.solutions) {
      assert.equal("process" in solution, false, `${problem.id}/${solution.title}`);
      assert.ok(solution.project.length > 30, `${solution.title}: solution is concrete`);
      assert.ok(solution.effect.length > 20, `${solution.title}: outcome is clear`);
    }
  }

  const selector = readFileSync(
    new URL("../src/components/ProblemSelector/ProblemSelector.jsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(selector, /solution\.process|businessProcess/);
});

test("AI infrastructure covers private models, agentic development and hardware", () => {
  const titles = problemById["ai-infrastructure"].solutions
    .slice(0, 3)
    .map(({ title }) => title);
  assert.deepEqual(titles, [
    "Локальный AI-контур",
    "Агентная разработка с AI",
    "GPU-инфраструктура под нагрузку",
  ]);
  const text = problemById["ai-infrastructure"].solutions
    .slice(0, 3)
    .map(({ project, effect }) => `${project} ${effect}`)
    .join(" ");
  assert.match(text, /Hugging Face/);
  assert.match(text, /Docker/);
  assert.match(text, /Git/);
  assert.match(text, /видеокарт|GPU/);
});

test("career reflects current verified experience and optional outcomes", () => {
  assert.deepEqual(career.map(({ year }) => year), [
    "2021–2024",
    "2024",
    "2021–2025",
    "2025–наст. время",
    "Постоянно",
  ]);
  assert.match(career[0].body, /Wildberries/);
  assert.match(career[0].body, /Avito/);
  assert.equal(career[0].result, "Могу помочь с логистикой из Европы и Китая");
  assert.equal(career[1].result, "Ищу инвестиции");
  assert.equal(career[1].highlightResult, true);
  assert.equal("result" in career[2], false);
  assert.equal(
    career[2].body,
    "Закончил англоязычную программу двух дипломов «Управление инновациями на предприятии».",
  );
  assert.match(career[3].body, /ОМС/);
  assert.match(career[3].body, /BI/);
  assert.doesNotMatch(career[3].body, /Подсвечиваю|сокращаю|разрабатываю|ищу/);
  assert.match(career[4].body, /любой отрасли/);
  assert.equal(
    career[4].result,
    "Постоянно ищу точки роста и оптимизирую процессы с помощью AI",
  );
  assert.doesNotMatch(career[4].result, /Четыре запущенных продукта/);
});

test("each marketplace card uses a dedicated generated 3:2 technology background", () => {
  const expectedCovers = [
    "/projects/covers/ostrov-xray-dna-v4.webp",
    "/projects/covers/ilonmask-xray-orbit-v4.webp",
    "/projects/covers/datoniks-xray-compute-v4.webp",
    "/projects/covers/wedding-xray-flora-v4.webp",
  ];
  assert.deepEqual(projects.map(({ cardCover }) => cardCover), expectedCovers);
  for (const project of projects) {
    assert.equal(project.cardCoverWidth, 1536);
    assert.equal(project.cardCoverHeight, 1024);
    assert.ok(
      existsSync(new URL(`../public${project.cardCover}`, import.meta.url)),
      `${project.cardCover} exists`,
    );
  }
});
