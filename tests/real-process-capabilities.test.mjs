import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { problems, ruUi } from "../src/content/siteContent.js";
import { createEnglishContent, englishUi } from "../src/content/siteLocale.js";
import * as russianContent from "../src/content/siteContent.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("describes every capability through a digital system and an operational change", () => {
  for (const capability of problems) {
    for (const solution of capability.solutions.slice(0, 3)) {
      assert.equal("process" in solution, false);
      assert.ok(solution.project.length >= 24 && solution.project.length <= 120);
      assert.ok(solution.effect.length >= 18 && solution.effect.length <= 90);
    }
  }

  const solutions = JSON.stringify(problems);
  for (const expected of [
    "Аналитика вирусности",
    "Холодные звонки с помощью AI",
    "Закупки и счета без ручной работы",
    "GPU-инфраструктура под нагрузку",
  ]) {
    assert.match(solutions, new RegExp(expected));
  }
});

test("renders two focused capability layers with localized labels", async () => {
  const [component, css] = await Promise.all([
    read("../src/components/ProblemSelector/ProblemSelector.jsx"),
    read("../src/components/ProblemSelector/ProblemSelector.css"),
  ]);
  const english = createEnglishContent(russianContent);

  assert.equal(ruUi.businessProcess, undefined);
  assert.equal(ruUi.digitalSolution, "Пример цифрового решения");
  assert.equal(ruUi.businessResult, "Что изменится");
  assert.equal(englishUi.businessProcess, undefined);
  assert.ok(english.problems.every(({ solutions }) =>
    solutions.slice(0, 3).every((solution) => !("process" in solution))));

  assert.doesNotMatch(component, /solution\.process/);
  assert.doesNotMatch(component, /ui\.businessProcess/);
  assert.match(component, /ui\.digitalSolution/);
  assert.match(component, /ui\.businessResult/);
  assert.doesNotMatch(css, /\.problem-selector__solution-process/);
  assert.match(css, /\.problem-selector__solution-result/);
});
