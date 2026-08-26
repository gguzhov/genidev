import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("build emits server-visible RU and EN shells without adding an i18n dependency", async () => {
  const [pkg, generator, worker, fallback] = await Promise.all([
    read("../package.json"),
    read("../scripts/generate-localized-pages.mjs"),
    read("../worker/index.js"),
    read("../src/content/renderNoscriptFallback.js"),
  ]);

  assert.match(pkg, /generate-localized-pages\.mjs/);
  assert.match(generator, /englishIndexPath = "en\/index\.html"/);
  assert.match(generator, /englishProjectsPath = "en\/projects"/);
  assert.match(generator, /renderNoscriptFallback/);
  assert.match(worker, /pathname.*index\.html/s);
  assert.match(fallback, /content\.navigation|navigation/);
  assert.match(fallback, /languageSwitch/);
});

test("navigation remains compact and exposes About and Articles in both languages", async () => {
  const { getSiteContent } = await import("../src/content/siteContent.js");
  for (const locale of ["ru", "en"]) {
    const content = getSiteContent(locale);
    assert.equal(content.navigation.length, 4);
    assert.ok(content.navigation.some((item) => item.id === "about"));
    assert.ok(content.navigation.some((item) => item.id === "articles"));
    assert.ok(content.navigation.find((item) => item.id === "articles").href.includes("habr.com"));
  }
});
