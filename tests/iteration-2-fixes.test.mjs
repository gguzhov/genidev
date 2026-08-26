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

test("orders the mobile hero as name, portrait and role without a duplicate sequence", () => {
  assert.match(
    appSource,
    /<div className="hero__stage">[\s\S]*?hero__name[\s\S]*?hero__portrait[\s\S]*?<ProfileCard[\s\S]*?variant="capsule"/,
  );
  assert.match(appSource, /<p className="hero__role">\{hero\.role\}<\/p>/);
  assert.match(heroCss, /\.hero__inner\s*\{[^}]*grid-template-rows:/s);
});

test("keeps the hero free of the legacy work-sequence component", () => {
  assert.doesNotMatch(appSource, /<WorkSequence/);
  assert.match(heroCss, /@media \(min-width:\s*768px\)/);
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

test("uses concise capability and marketplace copy", () => {
  assert.match(contentSource, /title:\s*"В чем могу быть полезен\?"/);
  assert.match(
    contentSource,
    /Цифровой двойник бизнеса/,
  );
  assert.doesNotMatch(contentSource, /duration:\s*"1 неделя до запуска"/);
  assert.match(
    contentSource,
    /В каждом проекте я прошёл путь от постановки проблемы и анализа бизнес-процессов до разработки и запуска\./,
  );
  assert.match(marketplaceSource, /<p>\{copy\.description\}<\/p>/);
});

test("announces only a concise selected-task status instead of the large panel", () => {
  const panelTag = problemSource.match(/<article[\s\S]*?>/)?.[0] ?? "";

  assert.doesNotMatch(panelTag, /aria-live|aria-atomic/);
  assert.match(problemSource, /className="problem-selector__status"/);
  assert.match(problemSource, /role="status"/);
  assert.match(problemSource, /aria-live="polite"/);
  assert.match(problemSource, /\{selected\.title\}/);
});

test("keeps the capability selector compact and uses a readable project carousel", () => {
  assert.doesNotMatch(
    problemCss,
    /\.problem-selector__panel\s*\{[^}]*box-shadow/s,
  );
  assert.match(
    problemCss,
    /@media \(min-width:\s*768px\)[\s\S]*\.problem-selector__tab\s*\{[^}]*min-height:\s*58px/s,
  );
  assert.match(problemCss, /\.problem-selector__solutions\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(problemCss, /\.problem-selector__solution\s*\{[^}]*border-radius:\s*var\(--radius-feature\)/s);
  assert.match(problemCss, /scroll-snap-type:\s*x mandatory/);
});

test("keeps career checkpoints contiguous along the shared route progress", async () => {
  const { getReachedCareerIndexesByProgress } = await import(
    "../src/components/CareerTimeline/careerTimelineState.js"
  );

  assert.deepEqual(getReachedCareerIndexesByProgress(0.5, [0, 0.25, 0.5, 0.75, 1]), [0, 1, 2]);
  assert.deepEqual(getReachedCareerIndexesByProgress(0, [0, 0.25]), [0]);
  assert.match(careerSource, /getReachedCareerIndexesByProgress\(progress, checkpointProgresses\)/);
  assert.match(careerSource, /career-route__checkpoint/);
});

test("uses a desktop route with alternating career entries", () => {
  assert.match(
    careerCss,
    /@media \(min-width:\s*768px\)[\s\S]*\.career-route__road\s*\{[^}]*left:\s*50%/s,
  );
  assert.match(
    careerCss,
    /@media \(min-width:\s*768px\)[\s\S]*\.career-timeline__event\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
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
  assert.match(marketplaceCss, /\.project-card__tags li\s*\{[^}]*font-size:\s*0\.72rem/s);
  assert.match(marketplaceCss, /\.project-card__summary\s*\{[^}]*font-size:\s*0\.875rem/s);
  assert.match(marketplaceCss, /\.project-card__media,[\s\S]*aspect-ratio:\s*3\s*\/\s*2/s);
  assert.doesNotMatch(marketplaceCss, /nth-child\(2\).*aspect-ratio/s);
});
