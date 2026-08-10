import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hero, identity, problems } from "../src/content/siteContent.js";

test("publishes the six-stage business path", () => {
  assert.equal(identity, "Геннадий Гужов");
  assert.equal(hero.title, "Разрабатываю цифровые и AI-продукты.");
  assert.equal("description" in hero, false);
  assert.deepEqual(hero.sequence, [
    "Проблема",
    "Решение",
    "Экономика",
    "Разработка",
    "Запуск",
    "Аналитика",
  ]);
});

test("uses the product title without a redundant hero paragraph", async () => {
  const [app, fallbackSource] = await Promise.all([
    readFile("src/App.jsx", "utf8"),
    readFile("src/content/renderNoscriptFallback.js", "utf8"),
  ]);

  assert.match(app, /hero__title-line">\{hero\.title\}/);
  assert.doesNotMatch(app, /hero\.description|\{identity\}/);
  assert.match(fallbackSource, /<h1>\$\{escapeHtml\(hero\.title\)\}<\/h1>/);
  assert.match(fallbackSource, /hero\.description \?/);
});

test("connects four professional actions to four outcomes", () => {
  assert.equal(problems.length, 4);
  for (const problem of problems) {
    assert.equal(problem.actions.length, 4);
    assert.equal(problem.outcomes.length, 4);
    assert.equal("description" in problem, false);
    assert.equal("result" in problem, false);
  }
});

test("keeps only one visible contact action on the portrait", async () => {
  const source = await readFile("src/components/ProfileCard/ProfileCard.jsx", "utf8");
  assert.doesNotMatch(source, /profile-card__behind/);
  assert.doesNotMatch(source, /profile-card__identity/);
  assert.match(source, />\s*Связаться\s*/);
});

test("removes the redundant problem section lead", async () => {
  const source = await readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8");
  assert.doesNotMatch(source, /Разбираю задачу, считаю эффект/);
  assert.match(source, /Действия/);
  assert.match(source, /К чему приводит/);
});
