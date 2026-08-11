import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { projects } from "../src/content/siteContent.js";

const expectedMetrics = {
  "ostrov-zdoroviya": [
    "+72% к посещаемости за месяц",
    "4 целевые записи",
    "CMS для самостоятельного обновления",
    "AI-ассистент и единая воронка",
  ],
  "ilonmask-vpn": [
    "300+ регистраций в месяц",
    "100+ активных платящих клиентов",
    "Оплата и подключение без администратора",
    "Автосинхронизация оплаты и VPN-доступа",
  ],
  datoniks: [
    "Прототип реализован в Иркутске",
    "Патент на систему охлаждения",
    "Бизнес-план и финансовая модель",
    "87 млн ₽ — инвестиционный запрос",
  ],
};

test("publishes four strongest outcomes and hybrid visual assets", async () => {
  for (const project of projects) {
    assert.deepEqual(project.metrics, expectedMetrics[project.slug]);
    if (project.slug === "datoniks") {
      assert.equal(project.visual.background, "/projects/ice/datoniks-ice-v1.webp");
      assert.equal(project.cover, "/projects/datoniks/datoniks-slide-03.webp");
      assert.equal(project.visual.logo, "/projects/datoniks/datoniks-logo.webp");
    } else {
      assert.match(project.visual.background, /^\/projects\/ice\/.+\.webp$/);
      assert.match(project.visual.logo, /^\/projects\/brands\//);
    }
    await access(`public${project.visual.background}`);
    await access(`public${project.visual.logo}`);
  }
});

test("uses one media ratio and keeps real interface evidence", async () => {
  const card = await readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8");
  const css = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.css",
    "utf8",
  );
  assert.match(card, /ProjectVisual/);
  assert.match(card, /<article/);
  assert.match(card, /Открыть кейс:/);
  assert.doesNotMatch(css, /nth-child\(2\).*aspect-ratio/s);
  assert.match(css, /aspect-ratio:\s*3\s*\/\s*2/);
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
