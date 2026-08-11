import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { problems } from "../src/content/siteContent.js";

const [componentSource, stylesSource] = await Promise.all([
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
]);
const scanStateModule = await import(
  "../src/components/ProblemSelector/problemPassportScanState.js"
).catch(() => null);

const expectedPassports = [
  {
    id: "launch",
    code: "TASK / 01 · IDEA → PRODUCT",
    title: "Нужно запустить новый продукт",
    situation:
      "Есть идея или бизнес-задача, но непонятно, с какой версии начать, кому она нужна и как проверить спрос без лишних затрат.",
  },
  {
    id: "automate",
    code: "TASK / 02 · MANUAL → SYSTEM",
    title: "Процесс держится на таблицах и чатах",
    situation:
      "Сотрудники переносят данные между файлами и сервисами, напоминают друг другу о задачах, а статус приходится собирать вручную.",
  },
  {
    id: "ai",
    code: "TASK / 03 · ROUTINE → AI FLOW",
    title: "Команда тратит время на повторяющиеся задачи",
    situation:
      "Люди снова и снова ищут информацию, разбирают документы, готовят ответы или классифицируют однотипные обращения.",
  },
  {
    id: "growth",
    code: "TASK / 04 · SIGNAL → GROWTH",
    title: "Продукт работает, но рост остановился",
    situation:
      "Трафик или пользователи уже есть, но непонятно, где они уходят, что мешает целевому действию и какую гипотезу проверять первой.",
  },
];

test("publishes the four approved problem passports without clichés", () => {
  assert.deepEqual(
    problems.map(({ id, code, title, situation }) => ({ id, code, title, situation })),
    expectedPassports,
  );

  for (const problem of problems) {
    assert.match(problem.situation, /^(Есть|Сотрудники|Люди|Трафик)\s/);
    assert.equal(problem.actions.length, 4);
    assert.equal(problem.outcomes.length, 4);
  }

  assert.doesNotMatch(
    JSON.stringify(problems),
    /комплексный подход|под ключ|цифровая трансформация|эффективные решения/i,
  );
});

test("renders the exact section heading and semantic passport labels", () => {
  assert.match(componentSource, /<h2 id=\{headingId\}>\{sectionCopy\.problems\.title\}<\/h2>/);
  assert.doesNotMatch(componentSource, /Беру ответственность/);
  assert.match(componentSource, /\{selected\.situation\}/);
  assert.match(componentSource, />Что сделаю</);
  assert.match(componentSource, />\s*Что получите\s*</);
  assert.doesNotMatch(componentSource, /section__eyebrow/);
});

test("uses a decorative CSS barcode with a visible adjacent code", () => {
  assert.match(componentSource, /className="problem-selector__barcode"/);
  assert.match(componentSource, /className="problem-selector__barcode-bars"/);
  assert.match(componentSource, /aria-hidden="true"/);
  assert.match(componentSource, /\{selected\.code\}/);
  assert.match(stylesSource, /\.problem-selector__barcode-bars\s*\{[^}]*repeating-linear-gradient/s);
});

test("re-keys one bounded scan when the passport changes, gains hover or receives focus", () => {
  assert.match(
    componentSource,
    /className="problem-selector__scan"[\s\S]*?key=\{getProblemScanKey\(selected\.id, scanRevision\)\}[\s\S]*?aria-hidden="true"/,
  );
  assert.match(componentSource, /onPointerEnter=\{retriggerScan\}/);
  assert.match(componentSource, /onFocus=\{retriggerScan\}/);
  assert.match(
    stylesSource,
    /\.problem-selector__scan\s*\{[^}]*animation:\s*problem-passport-scan var\(--motion-state\)[^;}]*;/s,
  );
  assert.match(stylesSource, /@keyframes problem-passport-scan/);
  assert.doesNotMatch(stylesSource, /animation-iteration-count|\binfinite\b/);
  assert.doesNotMatch(componentSource, /setInterval|requestAnimationFrame|setTimeout/);
  assert.match(
    stylesSource,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.problem-selector__scan\s*\{[^}]*animation:\s*none/s,
  );
});

test("advances the scan by exactly one revision per bounded interaction", () => {
  assert.ok(scanStateModule, "Missing bounded problem passport scan state helper");
  assert.equal(scanStateModule.nextProblemScanRevision(0), 1);
  assert.equal(scanStateModule.nextProblemScanRevision(1), 2);
  assert.equal(scanStateModule.getProblemScanKey("launch", 2), "launch:2");
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
