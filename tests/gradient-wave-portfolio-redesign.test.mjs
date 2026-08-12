import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  career,
  contact,
  hero,
  problems,
  projects,
  socialLinks,
} from "../src/content/siteContent.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("hero формулирует услугу и сохраняет шесть этапов полного цикла", () => {
  assert.equal(hero.title, "Разработка цифровых продуктов и AI-автоматизация.");
  assert.match(hero.promise, /ручн.+процесс.+систем/i);
  assert.deepEqual(hero.sequence, [
    "Проблема",
    "Решение",
    "Экономика",
    "Разработка",
    "Запуск",
    "Аналитика",
  ]);
});

test("четыре задачи начинаются с узнаваемой ситуации и содержат 4 действия и 4 результата", () => {
  assert.deepEqual(
    problems.map(({ title }) => title),
    [
      "Нужно запустить новый продукт",
      "Процесс держится на таблицах и чатах",
      "Команда тратит время на повторяющиеся задачи",
      "Продукт работает, но рост остановился",
    ],
  );
  problems.forEach((problem) => {
    assert.equal(problem.actions.length, 4);
    assert.equal(problem.outcomes.length, 4);
  });
});

test("каждый этап карьеры содержит один сильный результат", () => {
  career.forEach((event) => {
    assert.equal(typeof event.result, "string");
    assert.ok(event.result.length > 5);
    assert.equal(event.metrics, undefined);
  });
  assert.match(career[0].result, /3 млн ₽/);
});

test("каждый проект содержит ровно четыре результата и человеческий набор навыков", () => {
  assert.equal(projects.length, 3);
  projects.forEach((project) => {
    assert.equal(project.metrics.length, 4);
    assert.ok(project.skills?.length >= 4);
    assert.equal(project.technical, undefined);
    assert.doesNotMatch(project.category, /SaaS|Payments|Prefab|MedTech|Web/i);
  });
});

test("DATONIKS содержит видео, слайдер и три материала без расчётного блока", () => {
  const project = projects.find(({ slug }) => slug === "datoniks");
  assert.match(project.videoEmbed, /drive\.google\.com\/file\/d\/[^/]+\/preview/);
  assert.equal(project.gallery.length >= 2, true);
  assert.match(project.gallery[0].caption, /Иркутск/);
  assert.equal(project.externalActions.length, 3);
  assert.ok(project.externalActions.some(({ label }) => label === "Финансовая модель"));
  assert.equal(project.modelMetrics, undefined);
});

test("контакт и социальные ссылки не дублируют nickname под CTA", () => {
  assert.equal(contact.handle, undefined);
  assert.match(contact.title, /застрял|изменить|запустить/i);
  assert.deepEqual(socialLinks.map(({ id }) => id), ["github", "telegram", "habr"]);
  const habr = socialLinks.find(({ id }) => id === "habr");
  assert.equal(habr.meta, "9 статей · 300 тыс.+ просмотров");
  assert.equal(habr.source, "https://habr.com/ru/users/gguzhov/articles/");
});

test("официальная монохромная иконка GitHub остаётся читаемой в тёмном подвале", () => {
  const footer = read("../src/components/SiteFooter/SiteFooter.jsx");
  const footerCss = read("../src/components/SiteFooter/SiteFooter.css");
  assert.match(footer, /site-footer__social-icon--\$\{link\.id\}/);
  assert.match(
    footerCss,
    /\.site-footer__social-icon--github\s*\{[^}]*filter:\s*brightness\(0\) invert\(1\)/s,
  );
});

test("компоненты содержат GradientWave, дугу, слайдер и подвал", () => {
  const app = read("../src/App.jsx");
  const sequence = read("../src/components/WorkSequence/WorkSequence.jsx");
  const projectCase = read("../src/components/ProjectCase/ProjectCase.jsx");
  assert.match(app, /<GradientWave/);
  assert.match(app, /<SiteFooter/);
  assert.match(sequence, /C 20 12 80 12 94 88/);
  assert.doesNotMatch(projectCase, /Расчётные показатели|Техническая реализация/);
  const projectCaseCss = read("../src/components/ProjectCase/ProjectCase.css");
  assert.doesNotMatch(projectCaseCss, /project-case__model-metrics|project-case__technical/);
  assert.match(projectCase, /ProjectGallery/);
  assert.match(projectCase, /OtherProjects/);
});

test("галерея безопасно сбрасывается и ограничивает индекс при смене проекта", () => {
  const projectCase = read("../src/components/ProjectCase/ProjectCase.jsx");
  const gallery = read("../src/components/ProjectCase/ProjectGallery.jsx");
  assert.match(projectCase, /<ProjectGallery\s+key=\{project\.slug\}/);
  assert.match(gallery, /Math\.min\(activeIndex,\s*images\.length\s*-\s*1\)/);
});

test("финальное и reduced-motion состояние сохраняет центрирование узлов desktop-дуги", () => {
  const sequenceCss = read("../src/components/WorkSequence/WorkSequence.css");
  assert.match(
    sequenceCss,
    /@media \(min-width:\s*1024px\)[\s\S]*\.work-sequence--static \.work-sequence__item\s*\{[^}]*transform:\s*translate\(-50%,\s*-50%\)/s,
  );
  assert.match(
    sequenceCss,
    /@media \(min-width:\s*1024px\) and \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.work-sequence__item\s*\{[^}]*translate\(-50%,\s*-50%\)/s,
  );
});

test("CTA появляется в viewport, поддерживает focus и сохраняет спокойный tracking", () => {
  const contact = read("../src/components/FinalContact/FinalContact.jsx");
  const contactCss = read("../src/components/FinalContact/FinalContact.css");
  const heroCss = read("../src/styles/hero.css");
  const projectCaseCss = read("../src/components/ProjectCase/ProjectCase.css");
  assert.match(contact, /IntersectionObserver/);
  assert.match(contact, /isSettled/);
  assert.match(contact, /onAnimationEnd/);
  assert.match(contactCss, /\.final-contact__inner\.is-settled:focus-within \.final-contact__orbit/);
  assert.match(contactCss, /\.final-contact__inner\.is-settled \.final-contact__orbit\s*\{[^}]*animation:\s*none/s);
  assert.match(
    contactCss,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.final-contact__inner\.is-settled \.final-contact__orbit\s*\{[^}]*animation:\s*none/s,
  );
  assert.doesNotMatch(`${heroCss}\n${projectCaseCss}`, /letter-spacing:\s*-0\.0(?:5|6|7|8|9)em/);
});

test("прямой project-route возвращает фокус к первой карточке", () => {
  const routeHook = read("../src/hooks/useProjectRoute.js");
  assert.match(routeHook, /querySelector\("\.project-card__open"\)/);
  assert.match(routeHook, /returnFocusRef\.current\?\.isConnected[\s\S]*focus\(\{ preventScroll: true \}\)[\s\S]*fallbackTarget\.scrollIntoView\(\{ block: "center" \}\)[\s\S]*fallbackTarget\.focus\(\{ preventScroll: true \}\)/s);
});

test("ограниченные CSS-анимации дуги и CTA не используют бесконечный цикл", () => {
  const sources = [
    "../src/components/GradientWave/GradientWave.css",
    "../src/components/WorkSequence/WorkSequence.css",
    "../src/components/FinalContact/FinalContact.css",
  ].map(read).join("\n");
  assert.doesNotMatch(sources, /animation[^;]*infinite/i);
});

test("видеофрейм DATONIKS не расширяет мобильный кейс", () => {
  const css = read("../src/components/ProjectCase/ProjectCase.css");
  const baseVideoRule = css.match(/\.project-case__video\s*\{[^}]*\}/s)?.[0] ?? "";
  assert.doesNotMatch(baseVideoRule, /min-height/);
  assert.match(baseVideoRule, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(css, /@media \(min-width:\s*64rem\)[\s\S]*\.project-case__video\s*\{[^}]*min-height:\s*360px/s);
  assert.match(css, /\.project-gallery__frame img\s*\{[^}]*width:\s*100%[^}]*height:\s*auto/s);
});
