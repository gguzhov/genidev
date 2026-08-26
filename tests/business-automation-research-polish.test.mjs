import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { contact, problems, projects } from "../src/content/siteContent.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("publishes six research-backed business automation directions", () => {
  assert.deepEqual(
    problems.map(({ id }) => id),
    ["marketing", "sales", "management", "operations", "ai-infrastructure", "enablement"],
  );
  assert.ok(problems.every(({ solutions }) => solutions.length === 4));

  const titles = problems.flatMap(({ solutions }) => solutions.map(({ title }) => title));
  for (const required of [
    "Контент-план из запросов клиентов",
    "Цифровой двойник бизнеса",
    "Закупки под контролем",
    "AI-агенты для рутинных задач",
    "Локальный AI внутри компании",
    "AI проверяет все разговоры",
  ]) {
    assert.ok(titles.includes(required), `Missing capability project: ${required}`);
  }
});

test("keeps capability cards concise and outcome-led", () => {
  for (const problem of problems) {
    for (const solution of problem.solutions.slice(0, 3)) {
      assert.match(solution.process, /→/, `${solution.title} names a real process`);
      assert.ok(solution.process.length <= 64, `${solution.title} process copy is too long`);
      assert.ok(solution.project.length <= 120, `${solution.title} project copy is too long`);
      assert.ok(solution.effect.length <= 76, `${solution.title} effect copy is too long`);
    }
    assert.equal(problem.solutions.at(-1).title, "И другое цифровое решение");
  }
});

test("keeps all six capability filters readable across tablet and desktop", async () => {
  const css = await read("../src/components/ProblemSelector/ProblemSelector.css");
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*?problem-selector__rail\s*\{[^}]*repeat\(3,/);
  assert.match(css, /@media \(min-width: 1024px\)[\s\S]*?problem-selector__rail\s*\{[^}]*repeat\(6,/);
});

test("structures every delivered solution into professional workstreams", () => {
  for (const project of projects) {
    assert.equal(project.solution.length, 4);
    assert.ok(project.solution.every((item) => item.label && item.text));
  }

  const ostrov = projects.find(({ slug }) => slug === "ostrov-zdoroviya");
  assert.ok(ostrov.solution.some(({ label, text }) =>
    label === "AI и контент" && /изображен/i.test(text)));
});

test("uses one compact result-card system and a direct human-to-AI CTA", async () => {
  const [caseComponent, caseCss, contactComponent] = await Promise.all([
    read("../src/components/ProjectCase/ProjectCase.jsx"),
    read("../src/components/ProjectCase/ProjectCase.css"),
    read("../src/components/FinalContact/FinalContact.jsx"),
  ]);

  assert.equal(contact.title, "Заменим человека на AI?");
  assert.doesNotMatch(contactComponent, /final-contact__signal/);
  assert.doesNotMatch(caseComponent, /project-case__metric--lead/);
  assert.doesNotMatch(caseCss, /\.project-case__metrics li:nth-child/);
  assert.match(caseCss, /\.project-case__metrics strong\s*\{[^}]*1\.35rem/s);
  assert.ok(projects.every(({ metrics }) => metrics.length === 4));
  assert.ok(projects.flatMap(({ metrics }) => metrics).every((metric) => metric.length <= 42));
});

test("makes the iridescent background visibly animated without extra layers", async () => {
  const [wave, css] = await Promise.all([
    read("../src/components/GradientWave/GradientWave.jsx"),
    read("../src/components/GradientWave/GradientWave.css"),
  ]);

  assert.match(wave, /speed:\s*11/);
  assert.match(wave, /amplitude=\{0\.08\}/);
  assert.match(css, /\.gradient-wave__shader\s*\{[^}]*opacity:\s*0\.86/s);
  assert.doesNotMatch(wave, /gradient-wave__(?:signal|network|orbit)/);
});
