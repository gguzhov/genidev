import { access, readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

import { career, contact, navigation, sectionCopy } from "../src/content/siteContent.js";

const read = (path) => readFile(path, "utf8");

test("keeps four compact navigation links, a separate contact CTA and language control", async () => {
  const [app, nav] = await Promise.all([
    read("src/App.jsx"),
    read("src/components/CardNav/CardNav.jsx"),
  ]);

  assert.deepEqual(navigation.map(({ label }) => label), ["Обо мне", "Возможности", "Проекты", "Статьи"]);
  assert.doesNotMatch(app, /label: "Разделы"/);
  assert.doesNotMatch(nav, /card-nav__label|<span>Геннадий Гужов<\/span>/);
  assert.match(nav, /normalizeNavigationItems/);
  assert.match(nav, /alt=""/);
  assert.match(app, /navigationCta/);
  assert.match(app, /label: locale === "en" \? "Contact" : "Связаться"/);
  assert.match(nav, /<LanguageSwitcher/);
});

test("keeps confirmed career facts with one strongest result", async () => {
  const careerComponent = await read("src/components/CareerTimeline/CareerTimeline.jsx");
  const careerCopy = career.map(({ title, body, result }) =>
    [title, body, result].join(" "),
  ).join(" ");

  assert.match(career[0].body, /Wildberries и Avito/);
  assert.match(career[0].body, /промышленного оборудования/);
  assert.doesNotMatch(careerCopy, /тамож/iu);

  assert.match(career[1].body, /распределённой сети ЦОД/i);
  assert.equal(career[0].result, "Могу помочь с логистикой из Европы и Китая");
  assert.equal(career[1].result, "Ищу инвестиции");
  assert.equal(sectionCopy.career.title, "Мой карьерный тернистый путь");
  assert.match(careerComponent, /\{copy\.title\}/);
  assert.match(careerComponent, /career-timeline__result/);
  assert.doesNotMatch(careerComponent, /Ответственность|Подтверждено/);
});

test("renders the human contact invitation before the existing portrait", async () => {
  const [contactComponent, contactCss] = await Promise.all([
    read("src/components/FinalContact/FinalContact.jsx"),
    read("src/components/FinalContact/FinalContact.css"),
  ]);

  assert.equal(contact.title, "Заменим человека на AI?");
  assert.equal(contact.body, undefined);
  assert.equal(contact.ctaLabel, "Обсудить в Telegram");
  assert.equal(contact.handle, undefined);
  assert.match(contactComponent, /FinalContact\(\{ contact \}\)/);
  assert.doesNotMatch(contactComponent, /cta\.label|cta\?\.label/);
  assert.doesNotMatch(contactComponent, /contact\.body/);
  assert.match(contactComponent, /contact\.ctaLabel/);
  assert.match(contactComponent, /src="\/images\/gennady-cyborg-v2\.webp"/);
  assert.ok(
    contactComponent.indexOf("final-contact__copy") <
      contactComponent.indexOf("final-contact__visual"),
    "Contact copy and CTA must precede the portrait in mobile DOM order",
  );
  assert.match(contactCss, /grid-template-columns:\s*minmax\(0, 1\.18fr\)\s+minmax\(300px, 0\.82fr\)/);
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
