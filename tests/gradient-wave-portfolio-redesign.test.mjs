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

test("hero представляет специалиста и профессию без дублирующего пути работ", () => {
  assert.equal(hero.title, "Геннадий Гужов");
  assert.equal(hero.role, "Разработчик цифровых и AI-продуктов");
  assert.match(hero.promise, /разрозненные процессы в системы/i);
  assert.equal(hero.sequence, undefined);
});

test("шесть направлений содержат 4 конкретных проекта с понятным изменением", () => {
  assert.deepEqual(
    problems.map(({ title }) => title),
    [
      "Маркетинг",
      "Продажи",
      "Управление",
      "Операционные процессы",
      "AI-инфраструктура",
      "Обучение и сопровождение",
    ],
  );
  problems.forEach((problem) => {
    assert.equal(problem.solutions.length, 4);
    assert.ok(problem.solutions.every(({ project, effect }) => project.length > 7 && effect.length > 7));
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

test("каждый проект содержит ровно четыре результата и понятную бизнес-структуру", () => {
  assert.equal(projects.length, 4);
  projects.forEach((project) => {
    assert.equal(project.metrics.length, 4);
    assert.equal(project.solution.length, 4);
    assert.ok(project.benefit.length > 60);
    assert.equal(project.technical, undefined);
    assert.ok(project.tags.length >= 2);
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
  assert.equal(contact.title, "Заменим человека на AI?");
  assert.deepEqual(socialLinks.map(({ id }) => id), ["github", "telegram", "habr"]);
  const habr = socialLinks.find(({ id }) => id === "habr");
  assert.equal(habr.meta, "Статьи про AI и технологии · 300 тыс.+ просмотров");
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

test("компоненты содержат GradientWave, карьерный маршрут, слайдер и подвал", () => {
  const app = read("../src/App.jsx");
  const career = read("../src/components/CareerTimeline/CareerTimeline.jsx");
  const projectCase = read("../src/components/ProjectCase/ProjectCase.jsx");
  assert.match(app, /<GradientWave/);
  assert.match(app, /<SiteFooter/);
  assert.match(career, /career-route__plane/);
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
  assert.match(gallery, /Math\.min\(activeIndex,\s*Math\.max\(0,\s*imageCount\s*-\s*1\)\)/);
  assert.match(gallery, /project-gallery__track/);
});

test("карьерный маршрут сохраняет reduced-motion fallback", () => {
  const sequenceCss = read("../src/components/CareerTimeline/CareerTimeline.css");
  assert.match(
    sequenceCss,
    /@media \(prefers-reduced-motion:\s*reduce\)/,
  );
  assert.match(
    sequenceCss,
    /career-route__road/,
  );
});

test("CTA появляется в viewport, поддерживает focus и сохраняет спокойный tracking", () => {
  const contact = read("../src/components/FinalContact/FinalContact.jsx");
  const contactCss = read("../src/components/FinalContact/FinalContact.css");
  const heroCss = read("../src/styles/hero.css");
  const projectCaseCss = read("../src/components/ProjectCase/ProjectCase.css");
  assert.match(contact, /IntersectionObserver/);
  assert.match(contact, /isRevealed/);
  assert.match(contact, /gennady-cyborg-v2\.webp/);
  assert.match(contactCss, /\.final-contact__cyborg/);
  assert.match(
    contactCss,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.final-contact__cyborg\s*\{[^}]*transition:\s*none/s,
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
    "../src/components/CareerTimeline/CareerTimeline.css",
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
  assert.match(css, /\.project-gallery__slide img\s*\{[^}]*width:\s*100%[^}]*height:\s*auto/s);
});
