import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [
  appSource,
  contentSource,
  problemSelectorSource,
  careerComponentSource,
  careerCssSource,
  tokensSource,
  globalCssSource,
  sectionCssSource,
  navCssSource,
  navComponentSource,
  heroCssSource,
  profileCssSource,
  finalContactCssSource,
  problemSelectorCssSource,
  marketplaceCssSource,
] = await Promise.all([
  readFile("src/App.jsx", "utf8"),
  readFile("src/content/siteContent.js", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/CareerTimeline/CareerTimeline.jsx", "utf8"),
  readFile("src/components/CareerTimeline/CareerTimeline.css", "utf8"),
  readFile("src/styles/tokens.css", "utf8"),
  readFile("src/styles/global.css", "utf8"),
  readFile("src/styles/sections.css", "utf8"),
  readFile("src/components/CardNav/CardNav.css", "utf8"),
  readFile("src/components/CardNav/CardNav.jsx", "utf8"),
  readFile("src/styles/hero.css", "utf8"),
  readFile("src/components/ProfileCard/ProfileCard.css", "utf8"),
  readFile("src/components/FinalContact/FinalContact.css", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8"),
]);

test("hero presents the approved product title and complete work sequence", () => {
  assert.match(contentSource, /title:\s*"Разрабатываю цифровые и AI-продукты\."/);
  assert.match(
    contentSource,
    /Превращаю бизнес-задачи в работающие цифровые продукты и автоматизированные процессы/,
  );
  assert.match(appSource, /<WorkSequence/);
  assert.match(appSource, /hero__title-line">\{hero\.title\}/);
  assert.doesNotMatch(appSource, /hero\.description|\{identity\}/);
  assert.doesNotMatch(appSource, /<LiquidEther/);
});

test("problem selector uses a direct task rail and never mounts OptionWheel", () => {
  assert.doesNotMatch(problemSelectorSource, /OptionWheel/);
  assert.doesNotMatch(problemSelectorSource, /onWheel|addEventListener\(["']wheel/);
  assert.match(problemSelectorSource, /role="group"/);
  assert.match(problemSelectorSource, /aria-pressed=\{selectedIndex === index\}/);
  assert.match(problemSelectorSource, /role="region"/);
  assert.doesNotMatch(problemSelectorSource, /role="tab(?:list|panel)?"/);
});

test("career keeps every event readable and renders separate proof metrics", () => {
  assert.match(contentSource, /metrics:/);
  assert.match(careerComponentSource, /career-timeline__metrics/);
  assert.doesNotMatch(
    careerCssSource,
    /career-timeline--revealing[^{]*\{[^}]*opacity:\s*0/s,
  );
});

test("layout uses one responsive container and one motion scale", () => {
  assert.match(tokensSource, /--layout-max:\s*1280px/);
  assert.match(tokensSource, /--layout-gutter:\s*16px/);
  assert.match(tokensSource, /--motion-fast:\s*160ms/);
  assert.match(tokensSource, /--motion-state:\s*280ms/);
  assert.match(tokensSource, /--motion-reveal:\s*500ms/);
  assert.match(tokensSource, /--motion-ease:\s*cubic-bezier\(0\.22, 1, 0\.36, 1\)/);

  for (const source of [navCssSource, sectionCssSource, finalContactCssSource]) {
    assert.match(source, /var\(--layout-max\)/);
    assert.match(source, /var\(--layout-gutter\)/);
  }
});

test("shared radii shape navigation, profile and final CTA surfaces", () => {
  assert.match(tokensSource, /--radius-control:\s*12px/);
  assert.match(tokensSource, /--radius-surface:\s*18px/);
  assert.match(tokensSource, /--radius-feature:\s*24px/);
  assert.match(navCssSource, /border-radius:\s*var\(--radius-surface\)/);
  assert.match(heroCssSource, /border-radius:\s*var\(--radius-control\)/);
  assert.match(profileCssSource, /border-radius:\s*var\(--radius-feature\)/);
  assert.match(finalContactCssSource, /border-radius:\s*var\(--radius-feature\)/);
  assert.match(problemSelectorCssSource, /border-radius:\s*var\(--radius-surface\)/);
  assert.match(marketplaceCssSource, /border-radius:\s*var\(--radius-feature\)/);
});

test("every CardNav link uses the shared control radius", () => {
  assert.match(
    navCssSource,
    /\.card-nav__link\s*\{[^}]*border-radius:\s*var\(--radius-control\)/s,
  );
});

test("both CardNav GSAP animations receive the exact shared easing", () => {
  assert.match(navComponentSource, /gsap\.registerPlugin\(CustomEase\)/);
  assert.match(navComponentSource, /CustomEase\.create\([^,]+,\s*CARD_NAV_EASE\.gsap\)/);
  assert.match(navComponentSource, /ease\s*=\s*cardNavEase/);
  assert.match(navComponentSource, /timeline\.to\(nav,\s*\{[^}]*ease\s*\}\)/s);
  assert.match(
    navComponentSource,
    /timeline\.to\(\s*cardsRef\.current,\s*\{[^}]*ease[^}]*\}/s,
  );
});

test("motion-sensitive surfaces use shared durations and retain reduced-motion fallbacks", () => {
  assert.doesNotMatch(navCssSource, /transition:[^;]*\b180ms\b/s);
  assert.doesNotMatch(profileCssSource, /transition:[^;]*\b(?:90|180|240|420)ms\b/s);
  assert.match(navCssSource, /var\(--motion-fast\) var\(--motion-ease\)/);
  assert.match(profileCssSource, /var\(--motion-state\) var\(--motion-ease\)/);
  assert.match(navComponentSource, /duration:\s*0\.28/);
  assert.doesNotMatch(careerCssSource, /transition:\s*transform\s+700ms/);
  assert.match(globalCssSource, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(globalCssSource, /0\.01ms|animation-duration:\s*[^;]+!important/);
  assert.match(profileCssSource, /@media \(prefers-reduced-motion:\s*reduce\), \(hover:\s*none\), \(pointer:\s*coarse\)/);
});

test("muted copy stays readable and the contact invitation is exact", () => {
  assert.match(tokensSource, /--color-text-muted:\s*var\(--blue-11\)/);
  assert.match(contentSource, /title:\s*"Расскажите, что должно измениться\."/);
  assert.match(
    contentSource,
    /Разберу задачу, предложу первый вариант решения и объясню, что потребуется для запуска\./,
  );
});
