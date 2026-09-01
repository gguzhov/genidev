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
    "Ввод в эксплуатацию — 1 день",
    "Патент на систему охлаждения",
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

test("uses clean large Ostrov screens and the supplied IlonMask product evidence", async () => {
  const ostrov = projects.find((project) => project.slug === "ostrov-zdoroviya");
  const ilonmask = projects.find((project) => project.slug === "ilonmask-vpn");

  assert.deepEqual(
    ostrov.gallery.map((image) => image.src),
    [
      "/projects/ostrov/ostrov-home-clean.webp",
      "/projects/ostrov/ostrov-doctors-clean.webp",
      "/projects/ostrov/ostrov-services-clean.webp",
      "/projects/ostrov/ostrov-checkups-clean.webp",
      "/projects/ostrov/ostrov-light-life-clean.webp",
      "/projects/ostrov/ostrov-infusions-clean.webp",
    ],
  );
  assert.ok(ostrov.gallery.every((image) => image.width === 1920 && image.height === 1080));

  assert.deepEqual(
    ilonmask.gallery.map((image) => image.src),
    [
      "/projects/ilonmask/ilonmask-landing-2026.webp",
      "/projects/ilonmask/ilonmask-dashboard-2026.webp",
      "/projects/ilonmask/ilonmask-tariffs-2026.webp",
      "/projects/ilonmask/ilonmask-telegram-bot-2026.webp",
    ],
  );
  assert.equal(ilonmask.gallery[3].orientation, "portrait");

  for (const image of [...ostrov.gallery, ...ilonmask.gallery]) {
    await access(`public${image.src}`);
  }
});

test("keeps wide evidence large and gives portrait product screens their own layout", async () => {
  const gallery = await readFile("src/components/ProjectCase/ProjectGallery.jsx", "utf8");
  const css = await readFile("src/components/ProjectCase/ProjectCase.css", "utf8");

  assert.match(gallery, /project-gallery__slide--\$\{image\.orientation\}/);
  assert.match(css, /project-case__gallery-section[^}]*96rem/s);
  assert.match(css, /project-gallery__slide--portrait img[^}]*aspect-ratio:\s*auto/s);
  assert.match(css, /project-gallery__track\s*\{[^}]*align-items:\s*flex-start/s);
  assert.match(
    css,
    /@media \(min-width:\s*64rem\)[\s\S]*\.project-gallery__slide img\s*\{[^}]*height:\s*min\(68dvh,\s*45rem\)[^}]*object-fit:\s*contain/s,
  );
});

test("uses a restrained veil over the new intrinsically bright covers", async () => {
  const css = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.css",
    "utf8",
  );

  assert.match(css, /project-visual__cover\s*\{[^}]*brightness\(1\.04\)/s);
  assert.match(css, /project-visual__gradient\s*\{[^}]*opacity:\s*0\.24/s);
});
