import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [selector, styles, accent, packageSource] = await Promise.all([
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
  readFile("src/components/ProblemSelector/OpenSolutionAccent.jsx", "utf8").catch(() => ""),
  readFile("package.json", "utf8"),
]);

test("renders the open solution as typography rather than a bento card", () => {
  assert.match(selector, /<OpenSolutionAccent\s+label=\{openSolution\.title\}/);
  const rule = styles.match(/\.problem-selector__open-solution\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.ok(rule.length > 0);
  assert.doesNotMatch(rule, /\bborder(?:-radius)?\s*:/);
  assert.doesNotMatch(rule, /\bbackground(?:-image|-color)?\s*:/);
  assert.doesNotMatch(rule, /\bbox-shadow\s*:/);
  assert.match(
    styles,
    /\.problem-selector__open-solution-copy\s*\{[^}]*font-size:\s*clamp\(1rem,\s*1\.8vw,\s*1\.35rem\)/s,
  );
});

test("runs the signal only in view and honors reduced motion", () => {
  assert.match(accent, /IntersectionObserver/);
  assert.match(accent, /rootMargin:\s*"120px"/);
  assert.match(accent, /useReducedMotion/);
  assert.match(accent, /!reducedMotion\s*&&\s*isInView/);
  assert.match(accent, /document\.visibilityState/);
});

test("uses the existing Motion runtime for a visible travelling signal", () => {
  assert.match(accent, /from "motion\/react"/);
  assert.match(accent, /<motion\.g/);
  assert.match(accent, /x:\s*\[0,\s*1128\]/);
  assert.match(accent, /repeat:\s*Infinity/);
  assert.match(accent, /problem-selector__open-solution-node/);
  assert.doesNotMatch(accent, /OpenSolutionMotion|@remotion\/player|from "remotion"/);

  const pkg = JSON.parse(packageSource);
  assert.equal(pkg.dependencies.remotion, undefined);
  assert.equal(pkg.dependencies["@remotion/player"], undefined);
});
