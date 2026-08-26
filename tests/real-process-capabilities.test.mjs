import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { problems, ruUi } from "../src/content/siteContent.js";
import { createEnglishContent, englishUi } from "../src/content/siteLocale.js";
import * as russianContent from "../src/content/siteContent.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("describes every capability through a real process, a digital system and an operational change", () => {
  for (const capability of problems) {
    for (const solution of capability.solutions.slice(0, 3)) {
      assert.match(solution.process, /→/);
      assert.ok(solution.process.split("→").length >= 3, `${solution.title}: process is too abstract`);
      assert.ok(solution.project.length >= 24 && solution.project.length <= 118);
      assert.ok(solution.effect.length >= 18 && solution.effect.length <= 86);
    }
  }

  const processes = problems.flatMap(({ solutions }) =>
    solutions.slice(0, 3).map(({ process }) => process),
  ).join("\n");
  for (const expected of [
    "Реклама → заявка → сделка → оплата",
    "Заявка → звонок → предложение → сделка",
    "Заявка → согласование → заказ → доставка",
    "Документы → поиск → ответ → источник",
  ]) {
    assert.match(processes, new RegExp(expected.replaceAll("→", "→")));
  }
});

test("renders the three capability layers with localized labels", async () => {
  const [component, css] = await Promise.all([
    read("../src/components/ProblemSelector/ProblemSelector.jsx"),
    read("../src/components/ProblemSelector/ProblemSelector.css"),
  ]);
  const english = createEnglishContent(russianContent);

  assert.equal(ruUi.businessProcess, "Процесс");
  assert.equal(ruUi.digitalSolution, "Цифровое решение");
  assert.equal(ruUi.businessResult, "Что изменится");
  assert.equal(englishUi.businessProcess, "Process");
  assert.ok(english.problems.every(({ solutions }) =>
    solutions.slice(0, 3).every(({ process }) => process.includes("→"))));

  assert.match(component, /solution\.process/);
  assert.match(component, /ui\.businessProcess/);
  assert.match(component, /ui\.digitalSolution/);
  assert.match(component, /ui\.businessResult/);
  assert.match(css, /\.problem-selector__solution-process/);
  assert.match(css, /\.problem-selector__solution-result/);
});
