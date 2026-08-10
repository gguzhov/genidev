import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [
  appSource,
  contentSource,
  problemSelectorSource,
  careerComponentSource,
  careerCssSource,
] = await Promise.all([
  readFile("src/App.jsx", "utf8"),
  readFile("src/content/siteContent.js", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/CareerTimeline/CareerTimeline.jsx", "utf8"),
  readFile("src/components/CareerTimeline/CareerTimeline.css", "utf8"),
]);

test("hero presents identity first and explains the complete work sequence", () => {
  assert.match(contentSource, /title:\s*"Геннадий Гужов — разработчик цифровых и AI-продуктов\."/);
  assert.match(
    contentSource,
    /Превращаю бизнес-задачи в работающие цифровые продукты и автоматизированные процессы/,
  );
  assert.match(appSource, /<WorkSequence/);
  assert.match(appSource, /hero__title-line">\{identity\}/);
  assert.doesNotMatch(appSource, /<LiquidEther/);
});

test("problem selector uses a direct task rail and never mounts OptionWheel", () => {
  assert.doesNotMatch(problemSelectorSource, /OptionWheel/);
  assert.doesNotMatch(problemSelectorSource, /onWheel|addEventListener\(["']wheel/);
  assert.match(problemSelectorSource, /role="group"/);
  assert.match(problemSelectorSource, /aria-pressed=\{selectedIndex === index\}/);
  assert.match(problemSelectorSource, /role="region"/);
  assert.doesNotMatch(problemSelectorSource, /role="tab(?:list|panel)?"/);
});

test("career keeps every event readable and renders separate proof metrics", () => {
  assert.match(contentSource, /metrics:/);
  assert.match(careerComponentSource, /career-timeline__metrics/);
  assert.doesNotMatch(
    careerCssSource,
    /career-timeline--revealing[^{]*\{[^}]*opacity:\s*0/s,
  );
});
