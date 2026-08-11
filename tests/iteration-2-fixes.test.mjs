import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const exists = async (path) => access(path).then(() => true, () => false);

const [
  appSource,
  contentSource,
  heroCss,
  sequenceCss,
  profileSource,
  profileCss,
  problemSource,
  problemCss,
  careerSource,
  careerCss,
  navSource,
  navCss,
  marketplaceSource,
  marketplaceCss,
] = await Promise.all([
  readFile("src/App.jsx", "utf8"),
  readFile("src/content/siteContent.js", "utf8"),
  readFile("src/styles/hero.css", "utf8"),
  readFile("src/components/WorkSequence/WorkSequence.css", "utf8"),
  readFile("src/components/ProfileCard/ProfileCard.jsx", "utf8"),
  readFile("src/components/ProfileCard/ProfileCard.css", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8"),
  readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8"),
  readFile("src/components/CareerTimeline/CareerTimeline.jsx", "utf8"),
  readFile("src/components/CareerTimeline/CareerTimeline.css", "utf8"),
  readFile("src/components/CardNav/CardNav.jsx", "utf8"),
  readFile("src/components/CardNav/CardNav.css", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectMarketplace.jsx", "utf8"),
  readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8"),
]);

test("orders the mobile hero as copy, CTA, portrait, then work sequence", () => {
  assert.match(
    appSource,
    /<div className="hero__copy">[\s\S]*?<a[\s\S]*?className="button button--primary"[\s\S]*?<\/div>\s*<ProfileCard[\s\S]*?<div className="hero__sequence">\s*<WorkSequence/,
  );
  assert.match(
    heroCss,
    /@media \(min-width:\s*768px\)[\s\S]*grid-template-areas:[^;]*"copy profile"[^;]*"sequence profile"/,
  );
});

test("keeps the work sequence vertical until the left hero column can fit six labels", () => {
  assert.doesNotMatch(sequenceCss, /@media \(min-width:\s*768px\)/);
  assert.match(
    sequenceCss,
    /@media \(min-width:\s*1024px\)[\s\S]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/,
  );
});

test("keeps the ProfileCard action in a single unobstructed overlay", () => {
  assert.match(profileCss, /\.profile-card__avatar\s*\{[^}]*grid-area:\s*1\s*\/\s*1/s);
  assert.match(profileCss, /\.profile-card__action-layer\s*\{[^}]*bottom:\s*16px/s);
  assert.match(profileCss, /\.profile-card__contact\s*\{[^}]*min-height:\s*48px/s);
});

test("caches portrait bounds outside pointermove and coalesces updates into one RAF", () => {
  const pointerMoveBody = profileSource.match(
    /const handlePointerMove = useCallback\([\s\S]*?\n  \);/,
  )?.[0] ?? "";

  assert.match(profileSource, /const cacheBounds = useCallback/);
  assert.match(profileSource, /onPointerEnter=\{handlePointerEnter\}/);
  assert.match(profileSource, /window\.addEventListener\("resize", cacheBounds\)/);
  assert.doesNotMatch(pointerMoveBody, /getBoundingClientRect|cancelAnimationFrame/);
  assert.match(pointerMoveBody, /latestPointerRef\.current/);
  assert.match(pointerMoveBody, /animationFrameRef\.current != null\) return/);
});

test("uses the exact approved task and marketplace copy", () => {
  assert.match(
    contentSource,
    /Выбираю операции, где AI даёт практический эффект\./,
  );
  assert.match(
    contentSource,
    /Гипотеза готова к проверке на реальных пользователях\./,
  );
  assert.match(contentSource, /duration:\s*"1 неделя до запуска"/);
  assert.match(
    marketplaceSource,
    /В каждом проекте я прошёл путь от постановки проблемы и анализа бизнес-процессов до разработки и запуска\./,
  );
});

test("announces only a concise selected-task status instead of the large panel", () => {
  const panelTag = problemSource.match(/<article[\s\S]*?>/)?.[0] ?? "";

  assert.doesNotMatch(panelTag, /aria-live|aria-atomic/);
  assert.match(problemSource, /className="problem-selector__status"/);
  assert.match(problemSource, /role="status"/);
  assert.match(problemSource, /aria-live="polite"/);
  assert.match(problemSource, /\{selected\.title\}/);
});

test("keeps the desktop task selector compact and removes card-like action pills", () => {
  assert.doesNotMatch(
    problemCss,
    /\.problem-selector__panel\s*\{[^}]*box-shadow/s,
  );
  assert.match(
    problemCss,
    /@media \(min-width:\s*768px\)[\s\S]*\.problem-selector__tab\s*\{[^}]*min-height:\s*(?:68|69|70|71|72)px/s,
  );
  assert.match(
    problemCss,
    /\.problem-selector__actions-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(problemCss, /\.problem-selector__actions-list li\s*\{[^}]*border-bottom:/s);
  assert.doesNotMatch(
    problemCss,
    /\.problem-selector__actions-list li\s*\{[^}]*border-radius:\s*999px/s,
  );
});

test("keeps career reached markers contiguous through the furthest milestone", async () => {
  const { getContiguousReachedIndexes } = await import(
    "../src/components/CareerTimeline/careerTimelineState.js"
  );

  assert.deepEqual(getContiguousReachedIndexes(3), [0, 1, 2, 3]);
  assert.deepEqual(getContiguousReachedIndexes(-1), []);
  assert.match(careerSource, /getContiguousReachedIndexes\(furthestReached\)/);
});

test("uses the approved compact desktop career geometry", () => {
  assert.match(
    careerCss,
    /@media \(min-width:\s*1024px\)[\s\S]*\.career-timeline\s*\{[^}]*margin-left:\s*(?:[0-4]?\d)px/s,
  );
  assert.match(
    careerCss,
    /@media \(min-width:\s*1024px\)[\s\S]*\.career-timeline__entry\s*\{[^}]*grid-template-columns:\s*1(?:2\d|3\d|40)px/s,
  );
});

test("keeps CardNav closing content visible but immediately noninteractive", async () => {
  const { CARD_NAV_INITIAL_STATE, transitionCardNavState } = await import(
    "../src/components/CardNav/cardNavState.js"
  );
  const opened = transitionCardNavState(CARD_NAV_INITIAL_STATE, "OPEN");
  const closing = transitionCardNavState(opened, "CLOSE");
  const closed = transitionCardNavState(closing, "CLOSE_FINISHED");

  assert.equal(closing.contentVisible, true);
  assert.equal(closing.panelInteractive, false);
  assert.equal(closed.contentVisible, false);
  assert.match(navSource, /card-nav--content-visible/);
  assert.match(navSource, /onReverseComplete/);
  assert.match(navCss, /\.card-nav--content-visible \.card-nav__content/);
});

test("keeps the complete CardNav surface and content collapse within 280ms", () => {
  assert.match(
    navSource,
    /timeline\.to\(\s*cardsRef\.current,\s*\{[^}]*duration:\s*0\.16[^}]*stagger:\s*0\.04[^}]*\},\s*0,?\s*\)/s,
  );
});

test("makes the closed CardNav surface opaque enough to cover scrolled text", () => {
  assert.match(navCss, /\.card-nav\s*\{[^}]*background:\s*var\(--color-surface-raised\)/s);
});

test("uses truthful product-specific covers and readable project labels", async () => {
  assert.match(contentSource, /cover:\s*"\/projects\/ostrov\/ostrov-home-comet\.webp"/);
  assert.match(contentSource, /cover:\s*"\/projects\/ilonmask-product-cover\.png"/);
  assert.equal(await exists("public/projects/ilonmask-product-cover.png"), true);
  assert.match(marketplaceCss, /\.project-card__category\s*\{[^}]*font-size:\s*0\.75rem/s);
  assert.match(marketplaceCss, /\.project-card__metrics > li\s*\{[^}]*font-size:\s*0\.8rem/s);
  assert.match(marketplaceCss, /\.project-card__media,[\s\S]*aspect-ratio:\s*3\s*\/\s*2/s);
  assert.doesNotMatch(marketplaceCss, /nth-child\(2\).*aspect-ratio/s);
});
