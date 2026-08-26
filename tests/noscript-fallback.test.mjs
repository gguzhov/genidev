import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import * as siteContent from "../src/content/siteContent.js";

const { career, contact, hero, problems, projects } = siteContent;

const RENDERER_PATH = "src/content/renderNoscriptFallback.js";

test("renders all essential landing content from the shared content contract", async () => {
  assert.equal(
    await access(RENDERER_PATH).then(
      () => true,
      () => false,
    ),
    true,
    `Missing ${RENDERER_PATH}`,
  );

  const { renderNoscriptFallback } = await import(`../${RENDERER_PATH}`);
  const html = renderNoscriptFallback();

  assert.match(html, new RegExp(hero.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /Геннадий Гужов/);
  assert.match(html, /Fullstack-разработчик цифровых и AI-продуктов/);
  assert.match(html, new RegExp(hero.promise));
  assert.equal(siteContent.sectionCopy.problems.title, "В чем могу быть полезен?");
  assert.equal(siteContent.sectionCopy.problems.description, undefined);
  assert.equal(siteContent.sectionCopy.career.title, "Мой карьерный тернистый путь");
  assert.equal(siteContent.sectionCopy.marketplace.title, "Маркетплейс моих разработок");
  assert.match(html, /<h2 id="noscript-problems-title">В чем могу быть полезен\?<\/h2>/);
  assert.match(
    html,
    /<h2 id="noscript-career-title">Мой карьерный тернистый путь<\/h2>/,
  );
  assert.match(
    html,
    /<p>В каждом проекте я прошёл путь от постановки проблемы и анализа бизнес-процессов до разработки и запуска\.<\/p>/,
  );
  assert.doesNotMatch(html, />undefined</);
  assert.doesNotMatch(html, /От бизнес-проблемы до измеримого результата/);
  assert.doesNotMatch(html, /<h2 id="noscript-career-title">Карьерный путь<\/h2>/);
  assert.doesNotMatch(
    html,
    /Проекты, которые я самостоятельно прошёл от бизнес-задачи до запуска\./,
  );
  assert.equal((html.match(/data-noscript-problem/g) ?? []).length, problems.length);
  assert.equal((html.match(/data-noscript-career/g) ?? []).length, career.length);
  assert.equal((html.match(/data-noscript-project/g) ?? []).length, projects.length);

  for (const problem of problems) {
    assert.ok(html.includes(problem.title));
    for (const solution of problem.solutions) {
      assert.ok(html.includes(solution.title));
      assert.ok(html.includes(solution.project));
      assert.ok(html.includes(solution.effect));
    }
  }
  for (const event of career) {
    assert.ok(html.includes(event.year));
    assert.ok(html.includes(event.title));
    if (event.result) assert.ok(html.includes(event.result));
  }
  for (const project of projects) {
    assert.ok(html.includes(project.title));
    assert.ok(html.includes(project.tags.join(" · ")));
    assert.match(html, new RegExp(`href="/projects/${project.slug}"`));
    for (const metric of project.metrics) assert.ok(html.includes(metric));
  }

  assert.match(html, /href="https:\/\/t\.me\/gguzhov"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noreferrer"/);
});

test("renders a localized no-JS shell without a legacy hero sequence", async () => {
  const { renderNoscriptFallback } = await import(`../${RENDERER_PATH}`);
  const html = renderNoscriptFallback();
  const english = siteContent.getSiteContent("en");
  const englishHtml = renderNoscriptFallback(english);
  assert.doesNotMatch(html, /noscript-site__sequence/);
  assert.match(html, /hreflang="en" lang="en">EN</);
  assert.match(englishHtml, /hreflang="ru" lang="ru">RU</);
  assert.match(englishHtml, /Product marketplace/);
  for (const project of english.projects) {
    assert.match(englishHtml, new RegExp(`href="/en/projects/${project.slug}"`));
  }
  assert.doesNotMatch(`${html}${englishHtml}`, />undefined</);

  const ruCase = renderNoscriptFallback(siteContent.getSiteContent("ru"), { activeProject: projects[0] });
  const enCase = renderNoscriptFallback(english, { activeProject: english.projects[0] });
  assert.match(ruCase, /href="\/en\/projects\/ostrov-zdoroviya"/);
  assert.match(enCase, /href="\/projects\/ostrov-zdoroviya"/);
});

test("escapes no-JS text and external-link attributes", async () => {
  const { renderNoscriptFallback } = await import(`../${RENDERER_PATH}`);
  const html = renderNoscriptFallback({
    hero: {
      title: "Title <strong>",
      description: "Description & detail",
      cta: {
        label: "Open >",
        href: 'https://example.com/?q="x"&next=<unsafe>',
        target: '"><script>',
        rel: "external&safe",
      },
    },
    problems: [],
    career: [],
    projects: [],
    contact: {
      title: "Contact <now>",
      handle: "@safe&sound",
      href: 'https://example.com/contact?x="1"&y=<2>',
      target: "_blank",
      rel: "noreferrer&noopener",
      ctaLabel: "Contact >",
    },
  });

  assert.doesNotMatch(html, /<script>|<strong>|<unsafe>|<now>/);
  assert.doesNotMatch(html, />undefined</);
  assert.match(html, /Title &lt;strong&gt;/);
  assert.match(html, /Description &amp; detail/);
  assert.match(html, /href="https:\/\/example\.com\/\?q=&quot;x&quot;&amp;next=&lt;unsafe&gt;"/);
  assert.match(html, /target="&quot;&gt;&lt;script&gt;"/);
  assert.match(html, /rel="external&amp;safe"/);
});

test("the Vite HTML transform injects the generated noscript before the React root", async () => {
  const { createNoscriptFallbackPlugin } = await import("../vite.config.mjs");
  const plugin = createNoscriptFallbackPlugin();
  const transformed = plugin.transformIndexHtml(
    '<body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body>',
  );

  assert.equal(plugin.name, "noscript-content-fallback");
  assert.ok(transformed.indexOf("<noscript") < transformed.indexOf('<div id="root">'));
  assert.match(transformed, /data-noscript-project/);

  const config = await readFile("vite.config.mjs", "utf8");
  assert.match(config, /renderNoscriptFallback/);
  assert.match(config, /createNoscriptFallbackPlugin\(\)/);
});
