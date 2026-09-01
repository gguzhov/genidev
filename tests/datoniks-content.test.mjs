import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { projects } from "../src/content/siteContent.js";
import { renderNoscriptFallback } from "../src/content/renderNoscriptFallback.js";

const EXPECTED_METRICS = [
  "Объект работает в Иркутске",
  "40HC · 10 стоек × 12 кВт",
  "Ввод в эксплуатацию — 1 день",
  "Патент на систему охлаждения",
];

test("publishes DATONIKS as the third investment case with a clear business benefit", () => {
  assert.deepEqual(projects.map(({ slug }) => slug), [
    "ostrov-zdoroviya",
    "ilonmask-vpn",
    "datoniks",
    "wedding-vote",
  ]);

  const datoniks = projects.find(({ slug }) => slug === "datoniks");
  assert.ok(datoniks);
  assert.deepEqual(datoniks.tags, ["Телеком", "Дата-центр"]);
  assert.deepEqual(datoniks.metrics, EXPECTED_METRICS);
  assert.equal(datoniks.metrics.length, 4);
  assert.match(datoniks.summary, /40-футов(?:ом|ого) контейнер/i);
  assert.match(datoniks.summary, /заводск/i);
  assert.match(datoniks.summary, /один день/i);
  assert.doesNotMatch(datoniks.metrics.join(" "), /бизнес-план|питч|финмодел|ищу партн/i);

  const solution = datoniks.solution.map(({ label, text }) => `${label} ${text}`).join(" ");
  assert.match(solution, /исследовал спрос.*prefab-ЦОД/i);
  assert.match(solution, /бизнес-план/i);
  assert.match(solution, /финансовую модель/i);
  assert.match(solution, /инвестиционн(?:ый|ого) питч/i);
  assert.match(datoniks.benefit, /стандартн.*контейнерн.*транспорт/i);
  assert.match(datoniks.benefit, /заводск.*сборк/i);

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
    },
    {
      label: "Бизнес-план",
      href: "/documents/datoniks-business-plan.pdf",
      target: "_blank",
      rel: "noreferrer",
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

test("includes all four projects and DATONIKS actions in the no-JS fallback", () => {
  const html = renderNoscriptFallback();
  assert.equal((html.match(/data-noscript-project/g) ?? []).length, 4);
  assert.match(html, /DATONIKS/);
  assert.match(html, /Ввод в эксплуатацию — 1 день/);
  assert.match(html, /href="\/documents\/datoniks-pitch-deck-public\.pdf"/);
  assert.match(html, />Питч-дек</);
  assert.match(html, />Бизнес-план</);
  assert.match(html, />Финансовая модель</);
});

test("uses one primary control language for every external project material", async () => {
  const css = await readFile("src/components/ProjectCase/ProjectCase.css", "utf8");
  const component = await readFile("src/components/ProjectCase/ProjectCase.jsx", "utf8");
  assert.match(component, /className="button button--primary project-case__external-action"/);
  assert.match(component, /actions\.map\(\(action\)/);
  assert.doesNotMatch(css, /external-action:not\(\.button--primary\)/);
});
