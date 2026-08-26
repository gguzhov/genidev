import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hero, identity, problems } from "../src/content/siteContent.js";

test("publishes the product positioning without a redundant hero sequence", () => {
  assert.equal(identity, "Геннадий Гужов");
  assert.equal(hero.title, "Геннадий Гужов");
  assert.equal(hero.role, "Fullstack-разработчик цифровых и AI-продуктов");
  assert.equal("description" in hero, false);
  assert.equal(hero.sequence, undefined);
});

test("uses the product title without a redundant hero paragraph", async () => {
  const [app, fallbackSource] = await Promise.all([
    readFile("src/App.jsx", "utf8"),
    readFile("src/content/renderNoscriptFallback.js", "utf8"),
  ]);

  assert.match(app, /hero__name-line/);
  assert.match(app, /hero__letter/);
  assert.match(app, /variant="capsule"/);
  assert.doesNotMatch(app, /PointerHighlight/);
  assert.doesNotMatch(app, /hero\.description|\{identity\}/);
  assert.match(fallbackSource, /<h1>\$\{escapeHtml\(hero\.title\)\}<\/h1>/);
  assert.match(fallbackSource, /hero\.description \?/);
});

test("publishes four concrete solution ideas for each business direction", () => {
  assert.equal(problems.length, 6);
  for (const problem of problems) {
    assert.equal(problem.solutions.length, 4);
    assert.equal(problem.actions, undefined);
    assert.equal(problem.outcomes, undefined);
    assert.equal(problem.situation, undefined);
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
  assert.match(source, /featuredSolutions\.map/);
  assert.match(source, /problem-selector__open-solution/);
  assert.match(source, /problem-selector__solutions/);
  assert.doesNotMatch(source, /Что можно автоматизировать|Что изменится в работе/);
});
