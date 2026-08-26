import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("project result cards keep the number clear and anchor copy without empty space", async () => {
  const css = await read("../src/components/ProjectCase/ProjectCase.css");
  const rule = css.match(/\.project-case__metrics li\s*\{(?<body>[^}]*)\}/s)?.groups?.body ?? "";

  assert.match(rule, /align-content:\s*end/);
  assert.match(rule, /padding:\s*3\.25rem\s+1\.25rem\s+1\.25rem/);
  assert.match(rule, /min-height:\s*8\.25rem/);
  assert.doesNotMatch(rule, /space-between/);
});

test("career route fill and airplane use the same normalized progress", async () => {
  const jsx = await read("../src/components/CareerTimeline/CareerTimeline.jsx");
  const css = await read("../src/components/CareerTimeline/CareerTimeline.css");

  assert.match(jsx, /strokeDasharray="1"/);
  assert.match(jsx, /strokeDashoffset="1"/);
  assert.match(jsx, /setAttribute\("stroke-dashoffset",\s*\(1 - progress\)\.toFixed\(4\)\)/);
  assert.match(jsx, /deltaMs,\s*95,/);
  assert.doesNotMatch(css.match(/\.career-route__road-progress\s*\{(?<body>[^}]*)\}/s)?.groups?.body ?? "", /stroke-dashoffset/);
});

test("footer uses the channel name and contains no public-offer disclaimer", async () => {
  const ru = await read("../src/content/siteContent.js");
  const en = await read("../src/content/siteLocale.js");
  const footer = await read("../src/components/SiteFooter/SiteFooter.jsx");
  const noscript = await read("../src/content/renderNoscriptFallback.js");

  assert.match(ru, /Мой канал — Охота за технологиями/);
  assert.match(en, /My channel — Hunting for Technology/);
  assert.doesNotMatch(`${ru}\n${en}\n${footer}\n${noscript}`, /публичной оферт|public offer|ui\.legal/i);
});

test("career copy is concise, concrete and outcome-led in both locales", async () => {
  const ru = await read("../src/content/siteContent.js");
  const en = await read("../src/content/siteLocale.js");

  assert.match(ru, /Продавал товары на Wildberries и Avito/);
  assert.match(ru, /Организовал стартап для серийного производства мобильных дата-центров/);
  assert.match(ru, /Сам веду заказные продукты от бизнес-задачи и экономики до разработки, запуска и аналитики/);
  assert.match(en, /I sold products on Wildberries and Avito/);
  assert.match(en, /I organised a startup for serial mobile data-centre production/);
});

test("background uses one restrained iridescent layer with a static reduced-motion state", async () => {
  const [jsx, css, shader] = await Promise.all([
    read("../src/components/GradientWave/GradientWave.jsx"),
    read("../src/components/GradientWave/GradientWave.css"),
    read("../src/components/ui/animated-gradient.jsx"),
  ]);

  assert.match(jsx, /gradient-wave__shader/);
  assert.match(jsx, /amplitude=\{0\.08\}/);
  assert.doesNotMatch(jsx, /gradient-wave__(?:signal|network|orbit)/);
  assert.match(css, /\.gradient-wave__shader\s*\{[^}]*opacity:\s*0\.86/s);
  assert.match(shader, /for \(float i = 0\.0; i < 8\.0; \+\+i\)/);
  assert.match(shader, /prefers-reduced-motion:\s*reduce/);
});
