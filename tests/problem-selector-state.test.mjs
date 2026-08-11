import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { problems } from "../src/content/siteContent.js";

const [componentSource, stylesSource] = await Promise.all([
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
]);

test("uses one bounded selectedIndex transition for mobile and desktop input", async () => {
  const { transitionSelectedIndex } = await import(
    "../src/components/ProblemSelector/problemSelectionState.js"
  );

  assert.equal(transitionSelectedIndex(0, 2, 4), 2);
  assert.equal(transitionSelectedIndex(2, -1, 4), 0);
  assert.equal(transitionSelectedIndex(2, 9, 4), 3);
  assert.equal(transitionSelectedIndex(2, Number.NaN, 4), 2);
  assert.equal(transitionSelectedIndex(2, 1, 0), 0);
});

test("connects pressed task buttons to one independently labelled result region", () => {
  assert.match(componentSource, /role="group"/);
  assert.match(componentSource, /aria-pressed=\{selectedIndex === index\}/);
  assert.match(componentSource, /aria-controls=\{panelId\}/);
  assert.match(componentSource, /role="region"/);
  assert.match(componentSource, /aria-labelledby=\{panelHeadingId\}/);
  assert.match(componentSource, /<h3 id=\{panelHeadingId\}>/);
  assert.doesNotMatch(componentSource, /role="tab(?:list|panel)?"/);
  assert.doesNotMatch(componentSource, /aria-selected|tabIndex=/);
  assert.match(componentSource, /onKeyDown=/);
  for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]) {
    assert.match(componentSource, new RegExp(key));
  }
});

test("keeps the live region mounted while keyed inner content transitions", () => {
  const regionOpeningTag = componentSource.match(/<article[\s\S]*?>/)?.[0] ?? "";

  assert.match(regionOpeningTag, /role="region"/);
  assert.doesNotMatch(regionOpeningTag, /\bkey=/);
  assert.match(
    componentSource,
    /<div\s+className="problem-selector__panel-content"\s+key=\{selected\.id\}/,
  );
  assert.match(
    stylesSource,
    /\.problem-selector__panel-content\s*\{[^}]*animation:\s*problem-panel-enter/s,
  );
  assert.doesNotMatch(
    stylesSource,
    /\.problem-selector__panel\s*\{[^}]*animation:\s*problem-panel-enter/s,
  );
});

test("explains each task through actions and outcomes without a redundant section lead", () => {
  assert.match(componentSource, /sectionCopy\.problems\.title/);
  assert.doesNotMatch(componentSource, /От запуска продукта до AI-автоматизации/);
  assert.match(componentSource, />Что беру на себя</);
  assert.match(componentSource, /На выходе/);
  assert.doesNotMatch(componentSource, /Разбираю задачу, считаю эффект/);
  for (const problem of problems) {
    assert.equal(problem.actions.length, 4);
    assert.equal(problem.outcomes.length, 4);
  }
});

test("uses a mobile snap rail, a vertical desktop rail and restrained state motion", () => {
  assert.match(stylesSource, /scroll-snap-type:\s*x mandatory/);
  assert.match(stylesSource, /\.problem-selector__tab\s*\{[^}]*min-height:\s*(?:4[4-9]|[5-9]\d)px/s);
  assert.match(
    stylesSource,
    /@media \(min-width:\s*768px\)[\s\S]*\.problem-selector__rail\s*\{[^}]*flex-direction:\s*column/s,
  );
  assert.match(stylesSource, /var\(--motion-state\)/);
  assert.match(stylesSource, /@keyframes problem-panel-enter/);
  assert.match(stylesSource, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(stylesSource, /transition:\s*all/);
});
