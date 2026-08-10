import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [appSource, contentSource, problemSelectorSource] = await Promise.all([
  readFile("src/App.jsx", "utf8"),
  readFile("src/content/siteContent.js", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
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
  assert.match(problemSelectorSource, /role="tablist"/);
  assert.match(problemSelectorSource, /role="tab"/);
  assert.match(problemSelectorSource, /role="tabpanel"/);
});
