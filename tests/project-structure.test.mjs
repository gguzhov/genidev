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

  assert.equal(await exists("DESIGN.md"), true);
  assert.equal(await exists("PRODUCT.md"), true);
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
  for (const path of [
    "public/images/gennady-profile.webp",
    "public/images/gennady-logo.webp",
    "public/favicon-32.png",
    "public/favicon-180.png",
  ]) {
    assert.equal(await exists(path), true, `Missing ${path}`);
  }
  assert.equal(await exists("src/components/LiquidEther/LiquidEther.jsx"), true);
  assert.equal(await exists("src/components/LiquidEther/LiquidEther.css"), true);

  const app = await readFile("src/App.jsx", "utf8");
  const content = await readFile("src/content/siteContent.js", "utf8");
  const cardNav = await readFile("src/components/CardNav/CardNav.jsx", "utf8").catch(() => "");
  assert.match(content, /title:\s*"Геннадий Гужов"/);
  assert.match(app, /aria-label=\{hero\.title\}/);
  assert.doesNotMatch(app, /Георгий Гужов/);
  assert.doesNotMatch(cardNav, /gennady-logo\.webp|card-nav__brand/);
  assert.doesNotMatch(app, /components\/WorkSequence\/WorkSequence/);
  assert.doesNotMatch(app, /components\/LiquidEther\/LiquidEther/);

  const html = await readFile("index.html", "utf8");
  assert.match(html, /href="\/favicon-32\.png"/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(html, /разработчик цифровых и AI-продуктов/i);
  assert.match(html, /Геннадий Гужов/);
  assert.doesNotMatch(html, /Георгий Гужов/);
});

test("uses the approved calm motion contract without a hero work sequence", async () => {
  const app = await readFile("src/App.jsx", "utf8");
  assert.doesNotMatch(app, /<WorkSequence/);
  assert.doesNotMatch(app, /<LiquidEther/);

  assert.match(app, /hero__name-line/);
  const heroCss = await readFile("src/styles/hero.css", "utf8");
  const careerCss = await readFile("src/components/CareerTimeline/CareerTimeline.css", "utf8");
  const careerComponent = await readFile("src/components/CareerTimeline/CareerTimeline.jsx", "utf8");
  assert.match(heroCss, /@keyframes hero-letter-in/);
  assert.match(heroCss, /@keyframes hero-portrait-in/);
  assert.match(heroCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(careerComponent, /useMotionValueEvent\s*\(activeProgress/);
  assert.match(careerComponent, /style=\{\{ pathLength: activeProgress \}\}/);
  assert.match(careerCss, /prefers-reduced-motion:\s*reduce/);
});

test("keeps portfolio content and route state in focused modules", async () => {
  for (const path of ["src/content/siteContent.js", "src/lib/projectRouting.js"]) {
    assert.equal(await exists(path), true, `Missing ${path}`);
  }
});

test("composes the approved navigation and portrait hero", async () => {
  for (const path of [
    "src/components/CardNav/CardNav.jsx",
    "src/components/ProfileCard/ProfileCard.jsx",
    "src/hooks/useReducedMotion.js",
  ]) {
    assert.equal(await exists(path), true, `Missing ${path}`);
  }

  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /<CardNav/);
  assert.match(app, /<ProfileCard/);
  assert.match(app, /hero__name-line/);
  assert.match(app, /variant="capsule"/);
});

test("renders the four-problem selector", async () => {
  for (const path of [
    "src/components/OptionWheel/OptionWheel.jsx",
    "src/components/ProblemSelector/ProblemSelector.jsx",
    "src/styles/sections.css",
  ]) {
    assert.equal(await exists(path), true, `Missing ${path}`);
  }

  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /<ProblemSelector/);
});

test("renders the approved career timeline", async () => {
  assert.equal(await exists("src/components/CareerTimeline/CareerTimeline.jsx"), true);
  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /<CareerTimeline/);
});

test("ships the project marketplace and local covers", async () => {
  for (const path of [
    "src/components/DriftWall/DriftWall.jsx",
    "src/components/ProjectMarketplace/ProjectMarketplace.jsx",
    "public/projects/ostrov-cover.webp",
    "public/projects/ilonmask-cover.webp",
  ]) assert.equal(await exists(path), true, `Missing ${path}`);

  assert.match(await readFile("src/App.jsx", "utf8"), /<ProjectMarketplace/);
});

test("implements route-backed project cases", async () => {
  for (const path of [
    "src/hooks/useProjectRoute.js",
    "src/components/ProjectCase/ProjectCase.jsx",
  ]) assert.equal(await exists(path), true, `Missing ${path}`);

  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /useProjectRoute/);
  assert.match(app, /<ProjectCase/);

  const projectCaseCss = await readFile("src/components/ProjectCase/ProjectCase.css", "utf8");
  assert.doesNotMatch(projectCaseCss, /min-height:\s*16rem/);

  const projectCase = await readFile("src/components/ProjectCase/ProjectCase.jsx", "utf8");
  assert.match(projectCase, /useLayoutEffect/);
  assert.match(projectCase, /ref=\{surfaceRef\}/);
  assert.match(projectCase, /shouldResetProjectCaseScroll/);

  const projectRoute = await readFile("src/hooks/useProjectRoute.js", "utf8");
  assert.match(projectRoute, /createProjectRouteController/);
  assert.doesNotMatch(projectRoute, /setTimeout|CLOSE_PENDING_TIMEOUT_MS/);

  const projectRouteController = await readFile(
    "src/lib/projectRouteController.js",
    "utf8",
  );
  assert.match(projectRouteController, /history\.back\(\)/);
  assert.match(projectRouteController, /subscribePopState/);
  assert.doesNotMatch(projectRouteController, /setTimeout/);

  const tokens = await readFile("src/styles/tokens.css", "utf8");
  assert.match(tokens, /--color-border-strong:\s*var\(--blue-7\)/);
});

test("keeps desktop project controls stable while visual tracks remain decorative", async () => {
  const driftWall = await readFile("src/components/DriftWall/DriftWall.jsx", "utf8");
  const driftCss = await readFile("src/components/DriftWall/DriftWall.css", "utf8");

  assert.match(driftWall, /drift-wall__semantic-layer/);
  assert.match(driftWall, /semanticProjects\.map/);
  assert.match(driftWall, /observeViewportVisibility/);
  assert.match(driftWall, /--dw-tile-height/);
  assert.match(driftWall, /--dw-tile-gap/);
  assert.match(driftCss, /var\(--dw-tile-height\)/);
  assert.match(driftCss, /var\(--dw-tile-gap\)/);
});

test("keeps navigation and portrait interactions accessible", async () => {
  const cardNav = await readFile("src/components/CardNav/CardNav.jsx", "utf8");
  assert.match(cardNav, /<button/);
  assert.match(cardNav, /aria-expanded=/);
  assert.match(cardNav, /aria-controls=/);
  assert.match(cardNav, /Escape/);
  assert.match(cardNav, /useReducedMotion/);
  assert.doesNotMatch(cardNav, /react-icons/);

  const profileCard = await readFile("src/components/ProfileCard/ProfileCard.jsx", "utf8");
  assert.match(profileCard, /<img/);
  assert.match(profileCard, /alt=\{name\}/);
  assert.match(profileCard, /Связаться/);
  assert.match(profileCard, /hover: hover/);
  assert.match(profileCard, /pointer: fine/);
  assert.doesNotMatch(profileCard, /DeviceOrientation|DeviceMotion|deviceorientation/);
});

test("renders the final contact from the shared content contract", async () => {
  for (const path of [
    "src/components/FinalContact/FinalContact.jsx",
    "src/components/FinalContact/FinalContact.css",
  ]) {
    assert.equal(await exists(path), true, `Missing ${path}`);
  }

  const app = await readFile("src/App.jsx", "utf8");
  const finalContact = await readFile("src/components/FinalContact/FinalContact.jsx", "utf8");

  assert.match(app, /import FinalContact/);
  assert.match(app, /<FinalContact contact=\{contact\} \/>/);
  assert.match(finalContact, /id="contact"/);
  assert.match(finalContact, /aria-labelledby="contact-title"/);
  assert.match(finalContact, /contact\.title/);
  assert.doesNotMatch(finalContact, /contact\.handle/);
  assert.match(finalContact, /contact\.ctaLabel/);
  assert.match(finalContact, /href=\{contact\.href\}/);
  assert.match(finalContact, /target=\{contact\.target\}/);
  assert.match(finalContact, /rel=\{contact\.rel\}/);
});

test("keeps landing landmarks, section navigation and floating-header offsets coherent", async () => {
  const app = await readFile("src/App.jsx", "utf8");
  const career = await readFile("src/components/CareerTimeline/CareerTimeline.jsx", "utf8");
  const marketplace = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.jsx",
    "utf8",
  );
  const sectionsCss = await readFile("src/styles/sections.css", "utf8");

  assert.equal((app.match(/<main(?:\s|>)/g) ?? []).length, 1);
  assert.equal((app.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  const content = await readFile("src/content/siteContent.js", "utf8");
  for (const href of ["#problems", "#career", "#projects"]) {
    assert.ok(content.includes(`href: "${href}"`), `Missing CardNav link ${href}`);
  }
  assert.match(app, /sectionId="problems"/);
  assert.match(career, /id="career"/);
  assert.match(marketplace, /id="projects"/);
  assert.match(sectionsCss, /scroll-margin-top:\s*\d+px/);
});

test("keeps the landing h1 unique when a project dialog is present", async () => {
  const app = await readFile("src/App.jsx", "utf8");
  const projectCase = await readFile("src/components/ProjectCase/ProjectCase.jsx", "utf8");
  const projectCaseCss = await readFile("src/components/ProjectCase/ProjectCase.css", "utf8");

  assert.equal((app.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  assert.match(app, /<h1 className="hero__name" id="hero-title" aria-label=\{hero\.title\}>/);
  assert.doesNotMatch(projectCase, /<h1(?:\s|>)/);
  assert.match(projectCase, /<h2 className="project-case__title" id="project-title">/);
  assert.match(projectCase, /aria-labelledby="project-title"/);
  assert.match(projectCaseCss, /\.project-case__title\s*\{/);
  assert.doesNotMatch(projectCaseCss, /\.project-case__intro h1\s*\{/);
});

test("keeps the marketplace free from decorative duplicate cards", async () => {
  const marketplace = await readFile("src/components/ProjectMarketplace/ProjectMarketplace.jsx", "utf8");
  const marketplaceCss = await readFile(
    "src/components/ProjectMarketplace/ProjectMarketplace.css",
    "utf8",
  );
  assert.doesNotMatch(marketplace, /DriftWall/);
  assert.match(marketplace, /projects\.map/);
  assert.match(marketplaceCss, /\.project-card:hover/);
  assert.doesNotMatch(marketplaceCss, /\.project-card:hover\s*\{[^}]*transform:/s);
  assert.doesNotMatch(marketplace, /createMarketplaceRevealLifecycle/);
});
