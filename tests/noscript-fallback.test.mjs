import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { career, hero, identity, problems, projects } from "../src/content/siteContent.js";

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

  assert.match(html, new RegExp(identity));
  assert.match(html, new RegExp(hero.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal((html.match(/data-noscript-problem/g) ?? []).length, problems.length);
  assert.equal((html.match(/data-noscript-career/g) ?? []).length, career.length);
  assert.equal((html.match(/data-noscript-project/g) ?? []).length, projects.length);

  for (const problem of problems) {
    assert.ok(html.includes(problem.title));
    assert.ok(html.includes(problem.description));
  }
  for (const event of career) {
    assert.ok(html.includes(event.year));
    assert.ok(html.includes(event.title));
  }
  for (const project of projects) {
    assert.ok(html.includes(project.title));
    assert.ok(html.includes(project.duration));
    for (const metric of project.metrics) assert.ok(html.includes(metric));
  }

  assert.match(html, /href="https:\/\/t\.me\/gguzhov"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noreferrer"/);
});

test("escapes no-JS text and external-link attributes", async () => {
  const { renderNoscriptFallback } = await import(`../${RENDERER_PATH}`);
  const html = renderNoscriptFallback({
    identity: "Identity <script>&",
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
  assert.match(html, /Identity &lt;script&gt;&amp;/);
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
