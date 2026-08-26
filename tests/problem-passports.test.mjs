import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { problems } from "../src/content/siteContent.js";

const [componentSource, stylesSource] = await Promise.all([
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
]);
test("publishes six concrete business capabilities with solution projects", () => {
  assert.deepEqual(problems.map(({ id, title }) => ({ id, title })), [
    { id: "marketing", title: "Маркетинг" },
    { id: "sales", title: "Продажи" },
    { id: "management", title: "Управление" },
    { id: "operations", title: "Операционные процессы" },
    { id: "ai-infrastructure", title: "AI-инфраструктура" },
    { id: "enablement", title: "Технический консалтинг и обучение" },
  ]);

  for (const problem of problems) {
    assert.match(problem.icon, /^\/images\/capabilities\/.+\.webp$/);
    assert.equal(problem.solutions.length, 4);
    assert.equal(problem.situation, undefined);
    assert.equal(problem.actions, undefined);
    assert.equal(problem.outcomes, undefined);
    assert.ok(problem.solutions.every(({ project, effect }) => project.length > 7 && effect.length > 7));
  }

  assert.doesNotMatch(
    JSON.stringify(problems),
    /комплексный подход|под ключ|цифровая трансформация|эффективные решения/i,
  );
});

test("renders a text rail and semantic capability labels", () => {
  assert.match(componentSource, /<h2 id=\{headingId\}>\{copy\.title\}<\/h2>/);
  assert.doesNotMatch(componentSource, /Беру ответственность/);
  assert.match(componentSource, /featuredSolutions\.map/);
  assert.match(componentSource, /problem-selector__open-solution/);
  assert.doesNotMatch(componentSource, /problem-selector__tab-icon/);
  assert.match(componentSource, /problem-selector__tab-title/);
  assert.match(componentSource, /problem-selector__solutions/);
  assert.doesNotMatch(componentSource, /Что можно автоматизировать|Что изменится в работе/);
  assert.doesNotMatch(componentSource, /section__eyebrow/);
});

test("keeps capability decoration simple and bounded", () => {
  assert.doesNotMatch(componentSource, /problem-selector__barcode|problem-selector__scan/);
  assert.match(stylesSource, /@keyframes capability-panel-enter/);
  assert.doesNotMatch(stylesSource, /animation-iteration-count|\binfinite\b/);
  assert.doesNotMatch(componentSource, /setInterval|setTimeout/);
  assert.match(componentSource, /requestAnimationFrame/);
  assert.match(
    stylesSource,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.problem-selector__panel-content[\s\S]*animation:\s*none/s,
  );
});

test("keeps essential solution copy at 14px or larger", () => {
  assert.match(stylesSource, /\.problem-selector__tab-title[\s\S]*font-size:\s*0\.(?:76|86)rem/s);
  assert.match(stylesSource, /\.problem-selector__solution h4\s*\{[^}]*font-size:\s*clamp\(1\.12rem/s);
  assert.match(stylesSource, /\.problem-selector__solution-details dd\s*\{[^}]*font-size:\s*0\.875rem/s);
  assert.doesNotMatch(componentSource, /solution\.process|businessProcess/);
});
