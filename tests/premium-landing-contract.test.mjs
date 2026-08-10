import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [appSource, contentSource] = await Promise.all([
  readFile("src/App.jsx", "utf8"),
  readFile("src/content/siteContent.js", "utf8"),
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
