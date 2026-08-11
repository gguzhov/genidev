import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { problems } from "../src/content/siteContent.js";

const [componentSource, stylesSource] = await Promise.all([
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
]);

const expectedPassports = [
  {
    id: "launch",
    code: "TASK / 01 · IDEA → PRODUCT",
    title: "Вывести идею в работающий продукт",
    situation:
      "Когда есть идея, но ещё не ясно, кому нужен продукт, за что будут платить и какой первый сценарий запускать.",
  },
  {
    id: "automate",
    code: "TASK / 02 · MANUAL → SYSTEM",
    title: "Убрать ручную работу из процесса",
    situation:
      "Когда процесс держится на таблицах, сообщениях и ручных действиях, а статус и ошибки приходится искать по людям.",
  },
  {
    id: "ai",
    code: "TASK / 03 · ROUTINE → AI FLOW",
    title: "Встроить AI в работу команды",
    situation:
      "Когда команда тратит время на повторяемые задачи и хочет применить AI без потери контроля над качеством и решениями.",
  },
  {
    id: "growth",
    code: "TASK / 04 · SIGNAL → GROWTH",
    title: "Найти и реализовать точку роста",
    situation:
      "Когда продукт уже работает, но аналитика не показывает, где теряются пользователи и какое изменение даст следующий рост.",
  },
];

test("publishes the four approved problem passports without clichés", () => {
  assert.deepEqual(
    problems.map(({ id, code, title, situation }) => ({ id, code, title, situation })),
    expectedPassports,
  );

  for (const problem of problems) {
    assert.match(problem.situation, /^Когда\s/);
    assert.equal(problem.actions.length, 4);
    assert.equal(problem.outcomes.length, 4);
  }

  assert.doesNotMatch(
    JSON.stringify(problems),
    /комплексный подход|под ключ|цифровая трансформация|эффективные решения/i,
  );
});

test("renders the exact section heading and semantic passport labels", () => {
  assert.match(componentSource, /<h2 id=\{headingId\}>В чем могу быть полезен\?<\/h2>/);
  assert.match(componentSource, /Беру ответственность за путь от исходной задачи до работающего решения и данных после запуска\./);
  assert.match(componentSource, /\{selected\.situation\}/);
  assert.match(componentSource, />Что беру на себя</);
  assert.match(componentSource, />\s*На выходе\s*</);
  assert.doesNotMatch(componentSource, /section__eyebrow/);
});

test("uses a decorative CSS barcode with a visible adjacent code", () => {
  assert.match(componentSource, /className="problem-selector__barcode"/);
  assert.match(componentSource, /className="problem-selector__barcode-bars"/);
  assert.match(componentSource, /aria-hidden="true"/);
  assert.match(componentSource, /\{selected\.code\}/);
  assert.match(stylesSource, /\.problem-selector__barcode-bars\s*\{[^}]*repeating-linear-gradient/s);
});

test("re-keys one bounded scan only when the selected passport changes", () => {
  assert.match(
    componentSource,
    /className="problem-selector__scan"[\s\S]*?key=\{selected\.id\}[\s\S]*?aria-hidden="true"/,
  );
  assert.match(
    stylesSource,
    /\.problem-selector__scan\s*\{[^}]*animation:\s*problem-passport-scan var\(--motion-state\)[^;}]*;/s,
  );
  assert.match(stylesSource, /@keyframes problem-passport-scan/);
  assert.doesNotMatch(stylesSource, /animation-iteration-count|\binfinite\b/);
  assert.doesNotMatch(componentSource, /setInterval|requestAnimationFrame|onMouseEnter|onPointerEnter|onFocus=/);
  assert.match(
    stylesSource,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.problem-selector__scan\s*\{[^}]*animation:\s*none/s,
  );
});

test("keeps essential passport copy at 14px or larger", () => {
  for (const selector of [
    "problem-selector__tab",
    "problem-selector__code",
    "problem-selector__situation",
    "problem-selector__actions-list li",
    "problem-selector__outcomes li",
  ]) {
    assert.match(
      stylesSource,
      new RegExp(`\\.${selector.replace(" ", "\\s+")}\\s*\\{[^}]*font-size:\\s*(?:14px|0\\.875rem|[1-9](?:\\.\\d+)?rem)`, "s"),
    );
  }
});
