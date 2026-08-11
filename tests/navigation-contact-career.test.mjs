import { access, readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

import { career, contact, sectionCopy } from "../src/content/siteContent.js";

const read = (path) => readFile(path, "utf8");

test("keeps the header navigation flat, personal and focused on contact", async () => {
  const [app, nav] = await Promise.all([
    read("src/App.jsx"),
    read("src/components/CardNav/CardNav.jsx"),
  ]);

  for (const label of ["Задачи", "Опыт", "Проекты", "Связаться"]) {
    assert.match(app, new RegExp(`label: "${label}"`));
  }
  assert.doesNotMatch(app, /label: "Разделы"/);
  assert.doesNotMatch(nav, /card-nav__label|<span>Геннадий Гужов<\/span>/);
  assert.match(nav, /normalizeNavigationItems/);
  assert.match(nav, /alt=""/);
  assert.match(app, /navigationCta/);
  assert.match(app, /label: "Связаться"/);
});

test("keeps confirmed career facts with one strongest result", async () => {
  const careerComponent = await read("src/components/CareerTimeline/CareerTimeline.jsx");
  const careerCopy = career.map(({ title, body, result }) =>
    [title, body, result].join(" "),
  ).join(" ");

  assert.match(career[0].body, /трендовых товаров для розничных клиентов/);
  assert.match(career[0].body, /промышленного оборудования/);
  assert.match(career[0].body, /«Солдвиг ПРО»/);
  assert.match(career[0].body, /Проверял спрос и считал экономику поставок/);
  assert.doesNotMatch(careerCopy, /поставщик|тамож/iu);

  assert.match(career[1].body, /Поиск инвестиционного партнёра продолжается/);
  assert.equal(career[0].result, "3 млн ₽ заработано суммарно");
  assert.equal(career[1].result, "Прототип реализован в Иркутске");
  assert.equal(sectionCopy.career.title, "От торговли и экономики — к цифровым продуктам");
  assert.match(careerComponent, /sectionCopy\.career\.title/);
  assert.match(careerComponent, /career-timeline__result/);
  assert.doesNotMatch(careerComponent, /Ответственность|Подтверждено/);
});

test("renders the human contact invitation before the existing portrait", async () => {
  const [contactComponent, contactCss] = await Promise.all([
    read("src/components/FinalContact/FinalContact.jsx"),
    read("src/components/FinalContact/FinalContact.css"),
  ]);

  assert.equal(contact.title, "Есть задача, которая застряла между идеей и запуском?");
  assert.equal(
    contact.body,
    "Покажите, где теряются время, деньги или пользователи. Предложу, как превратить это в продукт, систему или AI-сценарий.",
  );
  assert.equal(contact.ctaLabel, "Разобрать задачу");
  assert.equal(contact.handle, undefined);
  assert.match(contactComponent, /FinalContact\(\{ contact \}\)/);
  assert.doesNotMatch(contactComponent, /cta\.label|cta\?\.label/);
  assert.match(contactComponent, /contact\.body/);
  assert.match(contactComponent, /contact\.ctaLabel/);
  assert.match(contactComponent, /src="\/images\/gennady-profile\.webp"/);
  assert.ok(
    contactComponent.indexOf("final-contact__copy") <
      contactComponent.indexOf("final-contact__portrait"),
    "Contact copy and CTA must precede the portrait in mobile DOM order",
  );
  assert.match(contactCss, /grid-template-columns:\s*minmax\(0, 1fr\)\s+minmax\(\d+px, [^)]+\)/);
});

test("loads the restrained expanded-menu image only from the 1024px desktop breakpoint", async () => {
  await access("public/images/ai-ice-core-v1.webp");
  const [nav, navCss] = await Promise.all([
    read("src/components/CardNav/CardNav.jsx"),
    read("src/components/CardNav/CardNav.css"),
  ]);

  assert.doesNotMatch(nav, /ai-ice-core-v1\.webp|<img[^>]+card-nav__visual/);
  assert.match(nav, /aria-hidden="true"/);
  assert.match(navCss, /card-nav__visual/);
  assert.match(navCss, /@media \(min-width:\s*768px\)/);
  const desktopVisualMediaIndex = navCss.indexOf("@media (min-width: 1024px)");
  assert.notEqual(desktopVisualMediaIndex, -1);
  assert.doesNotMatch(navCss.slice(0, desktopVisualMediaIndex), /ai-ice-core-v1\.webp/);
  assert.match(
    navCss.slice(desktopVisualMediaIndex),
    /grid-template-columns:\s*minmax\(0, 1fr\)\s+226px/,
  );
  assert.match(
    navCss.slice(desktopVisualMediaIndex),
    /card-nav__visual\s*\{[^}]*display:\s*block[^}]*height:\s*226px[^}]*background-image:\s*url\("\/images\/ai-ice-core-v1\.webp"\)/s,
  );
  assert.match(navCss, /prefers-reduced-motion:\s*reduce/);
});
