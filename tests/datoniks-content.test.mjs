import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { projects } from "../src/content/siteContent.js";
import { renderNoscriptFallback } from "../src/content/renderNoscriptFallback.js";

const EXPECTED_METRICS = [
  "Прототип реализован в Иркутске",
  "Патент на систему охлаждения",
  "Бизнес-план и финансовая модель",
  "87 млн ₽ — инвестиционный запрос",
];

test("publishes DATONIKS as the third, explicitly in-development investment project", () => {
  assert.deepEqual(projects.map(({ slug }) => slug), [
    "ostrov-zdoroviya",
    "ilonmask-vpn",
    "datoniks",
  ]);

  const datoniks = projects.find(({ slug }) => slug === "datoniks");
  assert.ok(datoniks);
  assert.equal(datoniks.status, "Инвестиционный проект · ищу партнёра");
  assert.deepEqual(datoniks.metrics, EXPECTED_METRICS);
  assert.equal(datoniks.metrics.length, 4);

  const actions = datoniks.actions.join(" ");
  assert.match(actions, /исследовал рынок prefab-ЦОД/i);
  assert.match(actions, /разработал бизнес-план/i);
  assert.match(actions, /финансовую модель/i);
  assert.match(actions, /инвестиционн(?:ый|ого) питч/i);

  assert.equal(datoniks.modelMetrics, undefined);
  assert.match(datoniks.videoEmbed, /drive\.google\.com.*\/preview/);
});

test("exposes the three requested investor materials", () => {
  const datoniks = projects.find(({ slug }) => slug === "datoniks");
  assert.deepEqual(datoniks.externalActions, [
    {
      label: "Питч-дек",
      href: "/documents/datoniks-pitch-deck-public.pdf",
      target: "_blank",
      rel: "noreferrer",
      download: true,
    },
    {
      label: "Бизнес-план",
      href: "/documents/datoniks-business-plan.pdf",
      target: "_blank",
      rel: "noreferrer",
      download: true,
    },
    {
      label: "Финансовая модель",
      href: "https://docs.google.com/spreadsheets/d/1qMaFBjKzP-phYNemPR8UGTd8q3gQF4a0OACTBIbyXN4/edit?usp=sharing",
      target: "_blank",
      rel: "noreferrer",
    },
  ]);

  const publicData = JSON.stringify(datoniks);
  assert.doesNotMatch(publicData, /(?:\+7|8)[\s()\-]*\d{3}[\s()\-]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/);
  assert.doesNotMatch(publicData, /[\w.+-]+@[\w.-]+\.[A-Za-zА-Яа-я]{2,}/);
  assert.doesNotMatch(publicData, /(?:юридическ(?:ий|ого) адрес|бизнес-план[_\s-]*DATONIKS\.pdf)/i);
});

test("includes all three projects and DATONIKS actions in the no-JS fallback", () => {
  const html = renderNoscriptFallback();
  assert.equal((html.match(/data-noscript-project/g) ?? []).length, 3);
  assert.match(html, /DATONIKS/);
  assert.match(html, /Инвестиционный проект · ищу партнёра/);
  assert.match(html, /href="\/documents\/datoniks-pitch-deck-public\.pdf"/);
  assert.match(html, />Питч-дек</);
  assert.match(html, />Бизнес-план</);
  assert.match(html, />Финансовая модель</);
});

test("keeps the primary presentation action visually distinct from the secondary action", async () => {
  const css = await readFile("src/components/ProjectCase/ProjectCase.css", "utf8");
  assert.match(css, /\.project-case__external-action:not\(\.button--primary\)/);
  assert.doesNotMatch(
    css,
    /\.project-case__external-action\s*\{[^}]*background:\s*var\(--color-surface-raised\)/s,
  );
});
