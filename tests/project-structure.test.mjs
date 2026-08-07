import { access, readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const exists = async (path) => access(path).then(() => true, () => false);

test("stores project documentation under docs", async () => {
  for (const path of [
    "docs/README.md",
    "docs/design-system.md",
    "docs/design-qa.md",
    "docs/design-evidence/source",
    "docs/design-evidence/implementation",
  ]) {
    assert.equal(await exists(path), true, `Missing ${path}`);
  }

  assert.equal(await exists("DESIGN.md"), false);
  assert.equal(await exists("design-qa.md"), false);
  assert.equal(await exists(".design-evidence"), false);

  const agents = await readFile("AGENTS.md", "utf8");
  assert.match(agents, /docs\/design-system\.md/);
});

test("loads JetBrains Mono locally and uses split styles", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.ok(packageJson.dependencies["@fontsource-variable/jetbrains-mono"]);

  const main = await readFile("src/main.jsx", "utf8");
  assert.match(main, /@fontsource-variable\/jetbrains-mono/);
  assert.match(main, /styles\/tokens\.css/);
  assert.match(main, /styles\/global\.css/);
  assert.match(main, /styles\/hero\.css/);

  const tokens = await readFile("src/styles/tokens.css", "utf8");
  assert.match(tokens, /--font-primary:\s*"JetBrains Mono Variable"/);

  const designSystem = await readFile("docs/design-system.md", "utf8");
  assert.match(designSystem, /JetBrains Mono/);
});

test("uses the approved identity and component paths", async () => {
  assert.equal(await exists("public/logo.svg"), true);
  assert.equal(await exists("src/components/LiquidEther/LiquidEther.jsx"), true);
  assert.equal(await exists("src/components/LiquidEther/LiquidEther.css"), true);

  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /Геннадий Гужов/);
  assert.doesNotMatch(app, /Георгий Гужов/);
  assert.match(app, /src="\/logo\.svg"/);
  assert.match(app, /components\/LiquidEther\/LiquidEther/);

  const html = await readFile("index.html", "utf8");
  assert.match(html, /rel="icon"[^>]+href="\/logo\.svg"/);
  assert.match(html, /Геннадий Гужов/);
  assert.doesNotMatch(html, /Георгий Гужов/);
});

test("uses the approved calm motion contract", async () => {
  const app = await readFile("src/App.jsx", "utf8");
  for (const contract of [
    "autoDemo={!reducedMotion}",
    "mouseForce={12}",
    "cursorSize={150}",
    "viscous={40}",
    "iterationsViscous={36}",
    "autoSpeed={0.24}",
    "autoIntensity={0.95}",
    "takeoverDuration={0.45}",
    "autoResumeDelay={3200}",
    "autoRampDuration={1.4}",
  ]) {
    assert.ok(app.includes(contract), `Missing motion contract ${contract}`);
  }

  assert.match(app, /hero__title-line/);
  const heroCss = await readFile("src/styles/hero.css", "utf8");
  assert.match(heroCss, /@keyframes hero-reveal/);
  assert.match(heroCss, /prefers-reduced-motion:\s*reduce/);
});
