import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

const [tokens, globalStyles, sections, marketplace, problems, marketplaceSource] =
  await Promise.all([
    readFile("src/styles/tokens.css", "utf8"),
    readFile("src/styles/global.css", "utf8"),
    readFile("src/styles/sections.css", "utf8"),
    readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8"),
    readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
    readFile("src/components/ProjectMarketplace/ProjectMarketplace.jsx", "utf8"),
  ]);

test("uses the single JetBrains Mono token without a stale Inter declaration", () => {
  assert.match(tokens, /--font-primary:\s*"JetBrains Mono Variable"/);
  assert.doesNotMatch(tokens, /font-family:\s*Inter\b/i);
});

test("does not use a global 0.01ms reduced-motion kill switch", () => {
  assert.doesNotMatch(globalStyles, /0\.01ms/);
  assert.doesNotMatch(
    globalStyles,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\*\s*,[\s\S]*?animation-duration\s*:/,
  );
});

test("keeps all shared motion bounded and token-driven", () => {
  const changedMotionSurfaces = [globalStyles, sections, marketplace, problems].join("\n");
  assert.doesNotMatch(changedMotionSurfaces, /animation-iteration-count\s*:\s*infinite|\binfinite\b/i);
  assert.match(marketplace, /var\(--motion-reveal\)\s+var\(--motion-ease\)/);
  assert.match(problems, /problem-passport-scan\s+var\(--motion-state\)\s+var\(--motion-ease\)/);
});

test("progressively enhances project reveals and always settles reduced motion", async () => {
  await access("src/components/ProjectMarketplace/marketplaceRevealLifecycle.js");
  assert.match(marketplaceSource, /createMarketplaceRevealLifecycle/);
  assert.match(marketplaceSource, /ref=\{gridRef\}/);
  assert.match(
    marketplace,
    /\.marketplace__grid\.is-reveal-ready:not\(\.is-revealed\)\s+\.project-card/,
  );
  assert.match(
    marketplace,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.marketplace__grid\.is-reveal-ready\s+\.project-card\s*\{[^}]*opacity:\s*1[^}]*transform:\s*none/s,
  );

  const { createMarketplaceRevealLifecycle } = await import(
    "../src/components/ProjectMarketplace/marketplaceRevealLifecycle.js"
  );
  const root = createClassedElement();
  const items = [createStyledElement(), createStyledElement(), createStyledElement()];
  let observerCallback;
  let disconnectCount = 0;
  class Observer {
    constructor(callback) {
      observerCallback = callback;
    }
    observe(element) {
      assert.equal(element, root);
    }
    disconnect() {
      disconnectCount += 1;
    }
  }

  const cleanup = createMarketplaceRevealLifecycle({ root, items, Observer });
  assert.equal(root.classList.has("is-reveal-ready"), true);
  assert.equal(root.classList.has("is-revealed"), false);
  assert.deepEqual(items.map((item) => item.style.values.get("--reveal-index")), ["0", "1", "2"]);

  observerCallback([{ isIntersecting: true }]);
  assert.equal(root.classList.has("is-revealed"), true);
  assert.equal(disconnectCount, 1);

  cleanup();
  observerCallback([{ isIntersecting: true }]);
  assert.equal(disconnectCount, 1);
});

test("leaves project content visible when reveal enhancement is unavailable", async () => {
  const { createMarketplaceRevealLifecycle } = await import(
    "../src/components/ProjectMarketplace/marketplaceRevealLifecycle.js"
  );
  const root = createClassedElement();
  const cleanup = createMarketplaceRevealLifecycle({
    root,
    items: [createStyledElement()],
    Observer: undefined,
  });

  assert.equal(root.classList.has("is-reveal-ready"), false);
  assert.equal(root.classList.has("is-revealed"), true);
  cleanup();
});

test("settles a pending reveal permanently when reduced motion turns on", async () => {
  const { createMarketplaceRevealLifecycle } = await import(
    "../src/components/ProjectMarketplace/marketplaceRevealLifecycle.js"
  );
  const root = createClassedElement();
  const media = createMedia(false);
  let disconnectCount = 0;
  class Observer {
    observe() {}
    disconnect() {
      disconnectCount += 1;
    }
  }

  const cleanup = createMarketplaceRevealLifecycle({
    root,
    items: [createStyledElement()],
    Observer,
    matchMedia: () => media,
  });
  assert.equal(root.classList.has("is-revealed"), false);

  media.setMatches(true);
  assert.equal(root.classList.has("is-revealed"), true);
  assert.equal(disconnectCount, 1);

  media.setMatches(false);
  assert.equal(root.classList.has("is-revealed"), true);
  cleanup();
  assert.equal(media.listenerCount(), 0);
});

test("removes obsolete section copy from source surfaces", async () => {
  const files = await collectTextFiles("src");
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(
    source,
    /Реализованные проекты|С чем я могу помочь|Есть задача, которую пора превратить в систему\?|Разделы/,
  );
});

test("keeps the published DATONIKS deck and built assets free of personal data", async () => {
  const pdfPath = "public/documents/datoniks-pitch-deck-public.pdf";
  await access(pdfPath);
  const pageCount = spawnSync(
    "python3",
    [
      "-c",
      "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))",
      pdfPath,
    ],
    { encoding: "utf8" },
  );
  assert.equal(pageCount.status, 0, pageCount.stderr);
  assert.equal(pageCount.stdout.trim(), "17");

  const files = await collectTextFiles("dist/client", [".html", ".js", ".css", ".json"]);
  const builtSource = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(builtSource, /(?:gguzhov|gennady[._-]?guzhov|datoniks)[\w.+-]*@[\w.-]+/i);
  assert.doesNotMatch(builtSource, /(?:\+7|8)[\s()\-]*\d{3}[\s()\-]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/);
  assert.doesNotMatch(builtSource, /юридическ(?:ий|ого) адрес|cap\s*table/i);
});

function createClassedElement() {
  const classes = new Set();
  return {
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      has: (name) => classes.has(name),
    },
  };
}

function createStyledElement() {
  const values = new Map();
  return {
    style: {
      values,
      setProperty: (property, value) => values.set(property, value),
      removeProperty: (property) => values.delete(property),
    },
  };
}

function createMedia(initialMatches) {
  let matches = initialMatches;
  const listeners = new Set();
  return {
    get matches() {
      return matches;
    },
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
    setMatches(nextMatches) {
      matches = nextMatches;
      for (const listener of listeners) listener({ matches });
    },
    listenerCount: () => listeners.size,
  };
}

async function collectTextFiles(root, extensions) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = `${root}/${entry.name}`;
      if (entry.isDirectory()) return collectTextFiles(path, extensions);
      if (!extensions || extensions.some((extension) => entry.name.endsWith(extension))) return [path];
      return [];
    }),
  );
  return nested.flat();
}
