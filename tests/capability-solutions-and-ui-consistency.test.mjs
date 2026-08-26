import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { problems } from "../src/content/siteContent.js";

const read = (path) => readFile(path, "utf8");

test("capabilities are concrete business projects with a project and measurable effect", () => {
  assert.deepEqual(problems.map(({ id }) => id), [
    "marketing",
    "sales",
    "management",
    "operations",
    "ai-infrastructure",
    "enablement",
  ]);
  for (const capability of problems) {
    assert.equal(capability.solutions.length, 4, `${capability.id}: four project ideas`);
    assert.equal("situation" in capability, false);
    assert.equal("actions" in capability, false);
    assert.equal("outcomes" in capability, false);

    for (const solution of capability.solutions.slice(0, 3)) {
      assert.ok(solution.title.length >= 8);
      assert.match(solution.process, /→/);
      assert.ok(solution.process.length <= 64);
      assert.ok(solution.project.length >= 8 && solution.project.length <= 120);
      assert.ok(solution.effect.length >= 8 && solution.effect.length <= 76);
    }
    assert.equal(capability.solutions.at(-1).title, "И другое цифровое решение");
  }

  assert.deepEqual(
    problems.flatMap(({ solutions }) => solutions.map(({ title }) => title)),
    [
      "Контент-план из запросов клиентов",
      "Ролики из одной съёмки",
      "Реклама до продажи",
      "И другое цифровое решение",
      "CRM, которая ведёт сделку",
      "AI проверяет все разговоры",
      "База знаний для продаж",
      "И другое цифровое решение",
      "Цифровой двойник бизнеса",
      "CRM и ERP для вашей отрасли",
      "Панель руководителя",
      "И другое цифровое решение",
      "Закупки под контролем",
      "Документы без ручного ввода",
      "Заявки не теряются",
      "И другое цифровое решение",
      "Локальный AI внутри компании",
      "AI-поиск по документам",
      "AI-агенты для рутинных задач",
      "И другое цифровое решение",
      "Найти задачи для AI",
      "Проверить AI на реальной задаче",
      "Обучить сотрудников работе с AI",
      "И другое цифровое решение",
    ],
  );

  const copy = JSON.stringify(problems);
  for (const phrase of [
    "Цифровой двойник",
    "реклам",
    "звонки и чаты",
    "согласование",
    "закупк",
    "реальной задаче",
    "Локальный AI внутри компании",
  ]) {
    assert.match(copy, new RegExp(phrase, "i"));
  }
});

test("capability panel renders one concise project list without duplicated action/result blocks", async () => {
  const component = await read("src/components/ProblemSelector/ProblemSelector.jsx");
  const styles = await read("src/components/ProblemSelector/ProblemSelector.css");

  assert.match(component, /featuredSolutions\.map/);
  assert.match(component, /problem-selector__open-solution/);
  assert.doesNotMatch(component, /selected\.solutions\.map/);
  assert.match(component, /problem-selector__solutions/);
  assert.doesNotMatch(component, /Что можно автоматизировать|Что изменится в работе/);
  assert.doesNotMatch(component, /selected\.actions|selected\.outcomes|selected\.situation/);
  assert.match(styles, /\.problem-selector__solution/);
});

test("marketplace cards combine evidence covers with exact logo plates", async () => {
  const visual = await read("src/components/ProjectMarketplace/ProjectVisual.jsx");
  const styles = await read("src/components/ProjectMarketplace/ProjectMarketplace.css");

  assert.doesNotMatch(visual, /project\.visual\.background|generated-cover|project-visual__background/);
  assert.doesNotMatch(visual, /project-visual__orbit/);
  assert.match(visual, /project\.visual\.logo/);
  assert.match(visual, /src=\{project\.cardCover \?\? project\.cover\}/);
  assert.match(visual, /project-visual__logo-plate/);
  assert.match(styles, /\.project-visual__cover/);
});

test("project resource links and mobile Telegram CTA use one consistent control language", async () => {
  const projectCase = await read("src/components/ProjectCase/ProjectCase.jsx");
  const projectCaseStyles = await read("src/components/ProjectCase/ProjectCase.css");
  const nav = await read("src/components/CardNav/CardNav.jsx");
  const navStyles = await read("src/components/CardNav/CardNav.css");

  assert.match(projectCase, /className="button button--primary project-case__external-action"/);
  assert.match(projectCase, /actions\.map\(\(action\)/);
  assert.doesNotMatch(projectCaseStyles, /external-action:not\(\.button--primary\)/);

  assert.match(nav, /card-nav__cta-icon/);
  assert.match(nav, /telegram-mark-white\.svg/);
  assert.match(nav, /card-nav__cta-label/);
  assert.match(navStyles, /@media \(max-width: 559px\)[\s\S]*\.card-nav__cta\s*\{[^}]*width:\s*44px/s);
  assert.match(navStyles, /@media \(max-width: 559px\)[\s\S]*\.card-nav__cta-label\s*\{[^}]*display:\s*none/s);
}
);
