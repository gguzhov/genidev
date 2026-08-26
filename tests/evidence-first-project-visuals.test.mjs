import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { projects } from "../src/content/siteContent.js";

const expectedMetrics = {
  "ostrov-zdoroviya": [
    "+72% посещаемости за месяц",
    "4 записи с первых рекламных кампаний",
    "Контент обновляется без разработчика",
    "AI отвечает по базе клиники",
  ],
  "ilonmask-vpn": [
    "300+ регистраций в месяц",
    "100+ платящих клиентов",
    "Оплата и доступ без оператора",
    "Кабинет, Telegram и email — единый путь",
  ],
  datoniks: [
    "Объект работает в Иркутске",
    "40HC · 10 стоек × 12 кВт",
    "Бизнес-план, питч и финмодель готовы",
    "Ищу партнёра для запуска серии",
  ],
  "wedding-vote": [
    "3 синхронных интерфейса",
    "2 048 уникальных псевдонимов",
    "Результаты без перезагрузки",
    "Голоса защищены от дублей",
  ],
};

test("publishes four strongest outcomes and exact local brand assets", async () => {
  for (const project of projects) {
    assert.deepEqual(project.metrics, expectedMetrics[project.slug]);
    assert.match(project.visual.logo, /^\/projects\/brands\/.+\.(?:png|webp)$/);
    assert.equal(project.visual.background, undefined);
    await access(`public${project.visual.logo}`);
  }
});

test("uses one media ratio and keeps real interface evidence with a logo plate", async () => {
  const card = await readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8");
  const css = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.css",
    "utf8",
  );
  assert.match(card, /ProjectVisual/);
  assert.match(card, /<article/);
  assert.match(card, /ui\?\.case\?\.open/);
  assert.doesNotMatch(css, /nth-child\(2\).*aspect-ratio/s);
  assert.match(css, /aspect-ratio:\s*3\s*\/\s*2/);
  const visual = await readFile("src/components/ProjectMarketplace/ProjectVisual.jsx", "utf8");
  assert.match(visual, /src=\{project\.cardCover \?\? project\.cover\}/);
  assert.match(visual, /project-visual__logo-plate/);
});

test("limits reactive ice depth to fine hover input and reduced-motion-safe CSS", async () => {
  const visual = await readFile(
    "src/components/ProjectMarketplace/ProjectVisual.jsx",
    "utf8",
  );
  const lifecycle = await readFile(
    "src/components/ProjectMarketplace/projectVisualPointerLifecycle.js",
    "utf8",
  );
  const css = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.css",
    "utf8",
  );

  assert.match(visual, /onPointerMove/);
  assert.match(lifecycle, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(lifecycle, /prefers-reduced-motion: reduce/);
  assert.match(lifecycle, /addEventListener\("change"/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /--project-pointer-x/);
  assert.doesNotMatch(visual, /requestAnimationFrame|setInterval/);
});
