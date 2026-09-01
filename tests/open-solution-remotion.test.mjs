import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [selector, styles, accent, motion, packageSource] = await Promise.all([
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
  readFile("src/components/ProblemSelector/OpenSolutionAccent.jsx", "utf8").catch(() => ""),
  readFile("src/components/ProblemSelector/OpenSolutionMotion.jsx", "utf8").catch(() => ""),
  readFile("package.json", "utf8"),
]);

test("renders the open solution as typography rather than a bento card", () => {
  assert.match(selector, /<OpenSolutionAccent\s+label=\{openSolution\.title\}/);
  const rule = styles.match(/\.problem-selector__open-solution\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.ok(rule.length > 0);
  assert.doesNotMatch(rule, /\bborder(?:-radius)?\s*:/);
  assert.doesNotMatch(rule, /\bbackground(?:-image|-color)?\s*:/);
  assert.doesNotMatch(rule, /\bbox-shadow\s*:/);
  assert.match(styles, /\.problem-selector__open-solution-copy\s*\{[^}]*font-size:\s*clamp\(/s);
});

test("loads the Remotion signal only near the viewport and honors reduced motion", () => {
  assert.match(accent, /lazy\(\(\)\s*=>\s*import\("\.\/OpenSolutionMotion"\)\)/);
  assert.match(accent, /IntersectionObserver/);
  assert.match(accent, /rootMargin:\s*"240px"/);
  assert.match(accent, /useReducedMotion/);
  assert.match(accent, /!reducedMotion\s*&&\s*shouldLoad/);
  assert.match(accent, /document\.visibilityState/);
});

test("drives the authored signal from Remotion frames instead of CSS keyframes", () => {
  assert.match(motion, /from "@remotion\/player"/);
  assert.match(motion, /from "remotion"/);
  assert.match(motion, /useCurrentFrame/);
  assert.match(motion, /interpolate\(/);
  assert.match(motion, /autoPlay/);
  assert.match(motion, /loop/);
  assert.match(motion, /acknowledgeRemotionLicense/);
  assert.doesNotMatch(motion, /interpolate\(distance,\s*\[135,\s*0\]/);
  assert.doesNotMatch(styles, /@keyframes open-solution-|animation:\s*open-solution-/);

  const pkg = JSON.parse(packageSource);
  assert.equal(pkg.dependencies.remotion, "4.0.506");
  assert.equal(pkg.dependencies["@remotion/player"], "4.0.506");
});
