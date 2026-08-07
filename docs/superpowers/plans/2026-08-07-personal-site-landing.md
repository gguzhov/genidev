# Personal Site Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать адаптивный личный лендинг Геннадия Гужова, который объясняет его специализацию, показывает бизнес-задачи, карьерный путь и два полноценных кейса, а затем ведёт к обращению в Telegram.

**Architecture:** React 19/Vite SPA получает единый слой данных для текста, задач, таймлайна и проектов. Интерактивные React Bits-компоненты адаптируются под существующую дизайн-систему, Hugeicons, reduced motion и mobile fallback; полноэкранные кейсы синхронизируются с `/projects/:slug` через History API без React Router. Реальные скриншоты и оптимизированный портрет хранятся локально, а декоративные обложки проектов генерируются в утверждённом направлении C.

**Tech Stack:** React 19.2, Vite 6.4.2, JavaScript, CSS, JetBrains Mono, Hugeicons, GSAP только для CardNav, Three/LiquidEther, Node test runner.

## Global Constraints

- Источник дизайна: `docs/design-system.md`; использовать только существующие цветовые токены.
- Источник контента: `docs/content/portfolio-content-draft.md` и утверждённая спецификация `docs/superpowers/specs/2026-08-07-personal-site-landing-design.md`.
- Основной CTA: «Решить проблему» → `https://t.me/gguzhov` в новой вкладке с `rel="noreferrer"`.
- Фотографию `/Users/gguzhov/Documents/GG/Ава 2.png` не перерисовывать и не менять черты лица; использовать детерминированный кроп.
- В кейсах не показывать отдельное поле «Роль».
- Mobile First; обязательная проверка на 375, 430, 768, 1024, 1280 и 1440 px.
- Touch targets не меньше 44×44 px; полная клавиатурная доступность и видимый `focus-visible`.
- Уважать `prefers-reduced-motion`; ни один сценарий не должен зависеть от hover, drag или анимации.
- Не добавлять React Router, Tailwind, react-icons или другую UI-библиотеку.
- Репозиторий сейчас не инициализирован как Git; вместо commit-шагов фиксировать завершение задачи успешными тестами и production build. Если Git появится до исполнения, делать отдельный коммит на каждую задачу с русской меткой.

---

## File Map

### Content and state

- `src/content/siteContent.js` — единственный runtime-источник hero, задач, таймлайна, проектов и контакта.
- `src/lib/projectRouting.js` — чистые функции разбора и создания URL проекта.
- `src/hooks/useReducedMotion.js` — общая реактивная настройка reduced motion.
- `src/hooks/useProjectRoute.js` — History API, `popstate`, открытие и закрытие кейса.

### Components

- `src/components/CardNav/CardNav.jsx`, `CardNav.css` — раскрывающаяся навигация.
- `src/components/ProfileCard/ProfileCard.jsx`, `ProfileCard.css` — портретная hero-карточка.
- `src/components/OptionWheel/OptionWheel.jsx`, `OptionWheel.css` — desktop-колесо задач.
- `src/components/ProblemSelector/ProblemSelector.jsx`, `ProblemSelector.css` — общий desktop/mobile интерфейс задач.
- `src/components/CareerTimeline/CareerTimeline.jsx`, `CareerTimeline.css` — карьерная линия.
- `src/components/DriftWall/DriftWall.jsx`, `DriftWall.css` — desktop-маркетплейс.
- `src/components/ProjectMarketplace/ProjectMarketplace.jsx`, `ProjectMarketplace.css` — desktop/mobile оболочка проектов.
- `src/components/ProjectCase/ProjectCase.jsx`, `ProjectCase.css` — route-backed полноэкранный кейс.
- `src/components/FinalContact/FinalContact.jsx`, `FinalContact.css` — финальный CTA.

### App and styles

- `src/App.jsx` — композиция страницы и связь выбранного проекта с модальным кейсом.
- `src/styles/global.css` — общие reset/accessibility/scroll-lock правила.
- `src/styles/hero.css` — новый двухколоночный hero.
- `src/styles/sections.css` — общая геометрия секций и заголовков.
- `src/main.jsx` — подключения новых стилей.
- `src/styles/tokens.css` и `docs/design-system.md` — только при необходимости добавить семантические алиасы, не новые цвета.

### Assets

- `public/images/gennady-profile.webp` — hero/ProfileCard.
- `public/images/gennady-logo.webp` — круглый header crop.
- `public/favicon-32.png`, `public/favicon-180.png` — favicon и touch icon.
- `public/projects/ostrov-cover.webp`, `public/projects/ilonmask-cover.webp` — сгенерированные обложки направления C.
- `public/projects/ostrov/*.webp` — оптимизированные реальные скриншоты клиники.
- `public/projects/ilonmask/*.webp` — реальные скриншоты VPN после доступного локального захвата.

### Tests and documentation

- `tests/content-and-routing.test.mjs` — структура контента и чистые функции URL.
- `tests/project-structure.test.mjs` — наличие компонентов, ассетов, метаданных и обязательных импортов.
- `docs/design-evidence/implementation/landing-*.png` — контрольные снимки шести ширин и открытых кейсов.
- `docs/design-qa.md` — результаты responsive/accessibility проверки.

---

### Task 1: Runtime-контент и URL-контракт проектов

**Files:**
- Create: `src/content/siteContent.js`
- Create: `src/lib/projectRouting.js`
- Create: `tests/content-and-routing.test.mjs`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Produces: `identity`, `hero`, `problems`, `career`, `projects`, `contact` named exports.
- Produces: `projectPath(slug): string` and `projectSlugFromPath(pathname): string | null`.
- Project shape: `{ slug, title, category, summary, duration, metrics, cover, url, problem, actions, result, resultSummary, gallery, technical, stack }`.

- [ ] **Step 1: Write the failing content and routing tests**

Create `tests/content-and-routing.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { career, hero, problems, projects } from "../src/content/siteContent.js";
import { projectPath, projectSlugFromPath } from "../src/lib/projectRouting.js";

test("publishes the approved positioning and four business problems", () => {
  assert.equal(hero.title, "Превращаю сложные бизнес-задачи в эффективные цифровые продукты и заменяю человека на AI.");
  assert.equal(hero.cta.label, "Решить проблему");
  assert.equal(hero.cta.href, "https://t.me/gguzhov");
  assert.deepEqual(problems.map(({ id }) => id), ["launch", "automate", "ai", "growth"]);
});

test("keeps the approved career sequence", () => {
  assert.deepEqual(career.map(({ year }) => year), ["2021–2024", "2024", "2025", "2025", "2026"]);
  assert.match(career[1].title, /модульных дата-центров/i);
  assert.match(career[2].body, /Лондонским университетом/i);
  assert.match(career[3].title, /ГКБ №15/i);
});

test("ships complete project cases without a role field", () => {
  assert.deepEqual(projects.map(({ slug }) => slug), ["ostrov-zdoroviya", "ilonmask-vpn"]);
  for (const project of projects) {
    assert.ok(project.problem.length > 80);
    assert.ok(project.actions.length >= 5);
    assert.ok(project.result.length >= 3);
    assert.ok(project.technical.length >= 3);
    assert.equal("role" in project, false);
  }
});

test("maps project routes in both directions", () => {
  assert.equal(projectPath("ostrov-zdoroviya"), "/projects/ostrov-zdoroviya");
  assert.equal(projectSlugFromPath("/projects/ilonmask-vpn"), "ilonmask-vpn");
  assert.equal(projectSlugFromPath("/projects/unknown/extra"), null);
  assert.equal(projectSlugFromPath("/"), null);
});
```

- [ ] **Step 2: Run the test and verify the missing modules fail**

Run: `npm test`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/content/siteContent.js`.

- [ ] **Step 3: Implement the pure route helpers**

Create `src/lib/projectRouting.js`:

```js
const PROJECT_ROUTE = /^\/projects\/([a-z0-9-]+)\/?$/;

export function projectPath(slug) {
  return `/projects/${slug}`;
}

export function projectSlugFromPath(pathname) {
  return pathname.match(PROJECT_ROUTE)?.[1] ?? null;
}
```

- [ ] **Step 4: Move the approved copy into `siteContent.js`**

Define all named exports listed in Interfaces. Copy project copy verbatim from `docs/content/portfolio-content-draft.md`; use arrays for bullets, `metrics` as short display strings, `gallery` as `{ src, alt, width, height }[]`, and no `role` key. Set the four problem ids exactly to `launch`, `automate`, `ai`, `growth` and the career years exactly as asserted above.

- [ ] **Step 5: Extend the structural test**

Add to `tests/project-structure.test.mjs`:

```js
test("keeps portfolio content and route state in focused modules", async () => {
  for (const path of ["src/content/siteContent.js", "src/lib/projectRouting.js"]) {
    assert.equal(await exists(path), true, `Missing ${path}`);
  }
});
```

- [ ] **Step 6: Verify Task 1**

Run: `npm test`

Expected: all tests PASS.

---

### Task 2: Портретные ассеты, favicon и метаданные

**Files:**
- Create: `public/images/gennady-profile.webp`
- Create: `public/images/gennady-logo.webp`
- Create: `public/favicon-32.png`
- Create: `public/favicon-180.png`
- Modify: `index.html`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Consumes: `/Users/gguzhov/Documents/GG/Ава 2.png` at 928×1152.
- Produces: stable public URLs `/images/gennady-profile.webp`, `/images/gennady-logo.webp`, `/favicon-32.png`, `/favicon-180.png`.

- [ ] **Step 1: Add failing asset and metadata assertions**

Extend the existing identity test:

```js
for (const path of [
  "public/images/gennady-profile.webp",
  "public/images/gennady-logo.webp",
  "public/favicon-32.png",
  "public/favicon-180.png",
]) assert.equal(await exists(path), true, `Missing ${path}`);

const html = await readFile("index.html", "utf8");
assert.match(html, /href="\/favicon-32\.png"/);
assert.match(html, /rel="apple-touch-icon"/);
assert.match(html, /разработчик цифровых и AI-продуктов/i);
```

- [ ] **Step 2: Run the test and verify missing assets fail**

Run: `npm test`

Expected: FAIL with `Missing public/images/gennady-profile.webp`.

- [ ] **Step 3: Produce deterministic portrait crops**

Use ImageMagick when available, otherwise `sips`, to create:

```bash
magick "/Users/gguzhov/Documents/GG/Ава 2.png" -auto-orient -resize "1000x1240>" -quality 84 public/images/gennady-profile.webp
magick "/Users/gguzhov/Documents/GG/Ава 2.png" -auto-orient -gravity center -crop 820x820+0+0 +repage -resize 256x256 -quality 86 public/images/gennady-logo.webp
magick public/images/gennady-logo.webp -resize 32x32 public/favicon-32.png
magick public/images/gennady-logo.webp -resize 180x180 public/favicon-180.png
```

Visually verify that the logo crop contains the face and glasses without cutting the chin or forehead. If ImageMagick is unavailable, use equivalent center-crop commands with `sips` while preserving the same output dimensions.

- [ ] **Step 4: Update document metadata**

In `index.html`, replace the SVG favicon with:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
<meta name="description" content="Геннадий Гужов — разработчик цифровых и AI-продуктов. Запуск продуктов, автоматизация бизнес-процессов и внедрение AI." />
<meta name="theme-color" content="#eeeff1" />
<title>Геннадий Гужов — цифровые и AI-продукты</title>
```

- [ ] **Step 5: Verify Task 2**

Run: `npm test && npm run build`

Expected: tests PASS and Vite build completes without missing assets.

---

### Task 3: CardNav, ProfileCard и новый hero

**Files:**
- Create: `src/hooks/useReducedMotion.js`
- Create: `src/components/CardNav/CardNav.jsx`
- Create: `src/components/CardNav/CardNav.css`
- Create: `src/components/ProfileCard/ProfileCard.jsx`
- Create: `src/components/ProfileCard/ProfileCard.css`
- Modify: `src/App.jsx`
- Modify: `src/styles/hero.css`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Consumes: `identity`, `hero`, `contact` from `siteContent.js`.
- Produces: `<CardNav items cta />` and `<ProfileCard avatarUrl name title handle onContactClick />`.
- Produces: `useReducedMotion(): boolean` shared by all motion components.

- [ ] **Step 1: Add failing component contract checks**

Add to `tests/project-structure.test.mjs`:

```js
test("composes the approved navigation and portrait hero", async () => {
  for (const path of [
    "src/components/CardNav/CardNav.jsx",
    "src/components/ProfileCard/ProfileCard.jsx",
    "src/hooks/useReducedMotion.js",
  ]) assert.equal(await exists(path), true, `Missing ${path}`);

  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /<CardNav/);
  assert.match(app, /<ProfileCard/);
  assert.match(app, /hero\.title/);
});
```

- [ ] **Step 2: Verify the component test fails**

Run: `npm test`

Expected: FAIL with `Missing src/components/CardNav/CardNav.jsx`.

- [ ] **Step 3: Install the one approved navigation dependency**

Run: `npm install gsap@^3.13.0`

Expected: `gsap` appears in dependencies and lockfile updates without peer dependency errors.

- [ ] **Step 4: Extract the shared reduced-motion hook**

Create `src/hooks/useReducedMotion.js` with the current `matchMedia` logic from `App.jsx`, export it as default, and remove the duplicate hook from `App.jsx`.

- [ ] **Step 5: Adapt CardNav from the supplied React Bits source**

Preserve the measured-height GSAP timeline, but:

- render the hamburger as a semantic `<button type="button">`;
- replace `react-icons` with `HugeiconsIcon` and `ArrowUpRight01Icon`;
- accept real `href` values and render anchors;
- use `/images/gennady-logo.webp` and visible text «Геннадий Гужов»;
- close on `Esc`, outside pointer, and navigation;
- set `aria-expanded`, `aria-controls`, accessible labels, and return focus to the trigger;
- bypass the long GSAP sequence when `useReducedMotion()` is true;
- use CSS variables from `tokens.css`, never literal component colors.

- [ ] **Step 6: Adapt ProfileCard from the supplied React Bits source**

Keep pointer-based tilt and behind-glow, but remove device-orientation permission and mobile tilt. Render the photo as a real `<img>` with `alt="Геннадий Гужов"`, show `name`, `title`, `@gguzhov`, and a button «Решить проблему». Set `enableTilt` only when `(hover: hover) and (pointer: fine)` matches and reduced motion is false.

- [ ] **Step 7: Replace the hero composition**

`App.jsx` must render this semantic structure before later sections are added:

```jsx
<>
  <CardNav items={navigation} cta={hero.cta} />
  <main>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__visual" aria-hidden="true">…LiquidEther…</div>
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__identity">{identity}</p>
          <h1 id="hero-title">{hero.title}</h1>
          <p className="hero__intro">{hero.description}</p>
          <a className="button button--primary" href={hero.cta.href} target="_blank" rel="noreferrer">{hero.cta.label}…</a>
        </div>
        <ProfileCard avatarUrl="/images/gennady-profile.webp" name="Геннадий Гужов" title="Разработчик цифровых и AI-продуктов" handle="gguzhov" />
      </div>
    </section>
  </main>
</>
```

- [ ] **Step 8: Implement Mobile First hero styles**

At 375 px use one column, copy first, card second, `min-height` driven by content rather than forced 100vh. At 768 px allow wider navigation. At 1024 px switch `.hero__inner` to `grid-template-columns: minmax(0, 1.15fr) minmax(300px, .85fr)`. Cap content at 1280 px and keep text measure under 19 characters per display line where natural wrapping allows.

- [ ] **Step 9: Verify Task 3**

Run: `npm test && npm run build`

Expected: all tests PASS; build has no `react-icons` import and no accessibility warnings in browser console.

---

### Task 4: Интерактивный выбор бизнес-задачи

**Files:**
- Create: `src/components/OptionWheel/OptionWheel.jsx`
- Create: `src/components/OptionWheel/OptionWheel.css`
- Create: `src/components/ProblemSelector/ProblemSelector.jsx`
- Create: `src/components/ProblemSelector/ProblemSelector.css`
- Modify: `src/App.jsx`
- Modify: `src/styles/sections.css`
- Modify: `src/main.jsx`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Consumes: `problems` array and `useReducedMotion()`.
- Produces: `<ProblemSelector problems />` with a single `selectedIndex` shared by wheel, mobile tabs and description.

- [ ] **Step 1: Add a failing structure check**

```js
test("renders the four-problem selector", async () => {
  for (const path of [
    "src/components/OptionWheel/OptionWheel.jsx",
    "src/components/ProblemSelector/ProblemSelector.jsx",
    "src/styles/sections.css",
  ]) assert.equal(await exists(path), true, `Missing ${path}`);
  assert.match(await readFile("src/App.jsx", "utf8"), /<ProblemSelector/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test`

Expected: FAIL for the missing OptionWheel component.

- [ ] **Step 3: Adapt OptionWheel**

Start from the supplied source, preserve rAF smoothing, click, drag and arrow-key support. Add a boundary rule: call `event.preventDefault()` only when the wheel can move in the requested direction; otherwise let the page scroll. Add `role="listbox"`, `role="option"`, `aria-selected`, and visible focus. Disable audio. Read colors through CSS variables rather than props with hex values.

- [ ] **Step 4: Build the responsive ProblemSelector**

Use one state:

```jsx
const [selectedIndex, setSelectedIndex] = useState(0);
const selected = problems[selectedIndex];
```

Render OptionWheel inside `.problem-selector__desktop` and four semantic buttons inside `.problem-selector__mobile`. Both update `selectedIndex`. The description panel renders `selected.title`, `selected.description`, `selected.outcome`, and `selected.capabilities` with `aria-live="polite"`.

- [ ] **Step 5: Add section and breakpoint styles**

At 375–767 px render horizontal buttons with `overflow-x: auto`, `scroll-snap-type: x mandatory`, no hidden essential content, and 44 px minimum height. At 768–1023 px use a two-column layout with a flatter wheel. At 1024 px enable the full curved wheel. Reduced motion switches transitions to immediate state changes.

- [ ] **Step 6: Verify Task 4**

Run: `npm test && npm run build`

Expected: PASS. Manual keyboard check: Tab reaches every mobile tab; arrow keys operate the desktop wheel without trapping page scroll at boundaries.

---

### Task 5: Анимированная карьерная линия

**Files:**
- Create: `src/components/CareerTimeline/CareerTimeline.jsx`
- Create: `src/components/CareerTimeline/CareerTimeline.css`
- Modify: `src/App.jsx`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Consumes: `career` and `useReducedMotion()`.
- Produces: `<CareerTimeline items={career} />` with semantic ordered list.

- [ ] **Step 1: Add a failing timeline contract**

```js
test("renders the approved career timeline", async () => {
  assert.equal(await exists("src/components/CareerTimeline/CareerTimeline.jsx"), true);
  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /<CareerTimeline/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test`

Expected: FAIL for the missing timeline.

- [ ] **Step 3: Implement the accessible reveal**

Render all items in an `<ol>`. Add `.is-visible` with IntersectionObserver using `threshold: 0.2`; mark all items visible immediately when reduced motion is enabled or IntersectionObserver is unavailable. Never set content to `display: none` or `visibility: hidden` before JavaScript runs; the initial state is readable and enhancement is opt-in after mount.

- [ ] **Step 4: Implement responsive timeline styles**

Mobile: line at 18 px, every event to its right, year above title, body below. At 1024 px: central line and alternating cards using `nth-child`, with year pinned close to the line. At 1440 px cap card width so the center remains visually connected. Animation is opacity plus at most 16 px translate and is removed under reduced motion.

- [ ] **Step 5: Verify Task 5**

Run: `npm test && npm run build`

Expected: PASS; every approved year and metric is present in rendered page text.

---

### Task 6: Обложки и «Маркетплейс моих разработок»

**Files:**
- Create: `public/projects/ostrov-cover.webp`
- Create: `public/projects/ilonmask-cover.webp`
- Create: `public/projects/ostrov/*.webp`
- Create: `src/components/DriftWall/DriftWall.jsx`
- Create: `src/components/DriftWall/DriftWall.css`
- Create: `src/components/ProjectMarketplace/ProjectMarketplace.jsx`
- Create: `src/components/ProjectMarketplace/ProjectMarketplace.css`
- Modify: `src/App.jsx`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Consumes: `projects`, `useReducedMotion()`, `onOpenProject(slug)`.
- Produces: `<ProjectMarketplace projects onOpenProject />` and reusable project-card buttons.

- [ ] **Step 1: Add failing marketplace and asset assertions**

```js
test("ships the project marketplace and local covers", async () => {
  for (const path of [
    "src/components/DriftWall/DriftWall.jsx",
    "src/components/ProjectMarketplace/ProjectMarketplace.jsx",
    "public/projects/ostrov-cover.webp",
    "public/projects/ilonmask-cover.webp",
  ]) assert.equal(await exists(path), true, `Missing ${path}`);
  assert.match(await readFile("src/App.jsx", "utf8"), /<ProjectMarketplace/);
});
```

- [ ] **Step 2: Run and verify missing covers fail**

Run: `npm test`

Expected: FAIL with the first missing cover path.

- [ ] **Step 3: Generate the two approved decorative covers**

Use the `imagegen` skill and direction C. Both outputs must be 3:2, text-free, cold blue/white, premium and minimal:

- Ostrov: abstract clinical interface layers, soft glass cards, precise medical data, calm premium personalization; no red cross, no fake readable text.
- IlonMask: protected data tunnel, subscription/account layers, payment and Telegram-like communication abstractions; no third-party logos, no lock cliché dominating the frame.

Save source PNGs temporarily outside `public`, visually review them, then convert approved files to `public/projects/ostrov-cover.webp` and `public/projects/ilonmask-cover.webp` around 1600×1067, quality 82.

- [ ] **Step 4: Optimize real Ostrov screenshots**

Convert the six `tmp/project-screenshots/ostrov-*-comet.png` files to WebP under `public/projects/ostrov/` with width capped at 1600 px and quality 80. Preserve aspect ratio and record resulting dimensions in `siteContent.js` gallery entries.

- [ ] **Step 5: Adapt DriftWall from the supplied source**

Preserve the column drift and pointer parallax, but render each unique project as a semantic `<button>` duplicated only with `aria-hidden="true"` and `tabIndex={-1}` for seamless visual tracks. Keyboard focus opens the unique accessible card representation. Pause rAF when the section is outside viewport or `document.hidden`; reduced motion renders no animated wall.

- [ ] **Step 6: Build the marketplace fallback**

Use `matchMedia("(hover: none), (pointer: coarse)")`, reduced motion and a conservative viewport check to choose the static grid. Both wall and grid show title, category, duration and metrics. Broken cover images reveal a token-based gradient and visible project title. Button activation calls `onOpenProject(project.slug)`.

- [ ] **Step 7: Verify Task 6**

Run: `npm test && npm run build`

Expected: PASS. Verify all public images are included in `dist/client`, have explicit dimensions and no external image URLs.

---

### Task 7: Route-backed полноэкранные кейсы

**Files:**
- Create: `src/hooks/useProjectRoute.js`
- Create: `src/components/ProjectCase/ProjectCase.jsx`
- Create: `src/components/ProjectCase/ProjectCase.css`
- Modify: `src/App.jsx`
- Modify: `src/styles/global.css`
- Modify: `tests/content-and-routing.test.mjs`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Consumes: `projects`, `projectPath`, `projectSlugFromPath`.
- Produces: `useProjectRoute(projects) -> { activeProject, openProject, closeProject }`.
- Produces: `<ProjectCase project projects onClose onOpenProject />`.

- [ ] **Step 1: Extend pure route tests with normalization**

Add assertions:

```js
assert.equal(projectSlugFromPath("/projects/ostrov-zdoroviya/"), "ostrov-zdoroviya");
assert.equal(projectSlugFromPath("/projects/%20"), null);
assert.equal(projectSlugFromPath("/not-projects/ostrov-zdoroviya"), null);
```

- [ ] **Step 2: Add failing hook/dialog structure checks**

```js
test("implements route-backed project cases", async () => {
  for (const path of [
    "src/hooks/useProjectRoute.js",
    "src/components/ProjectCase/ProjectCase.jsx",
  ]) assert.equal(await exists(path), true, `Missing ${path}`);
  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /useProjectRoute/);
  assert.match(app, /<ProjectCase/);
});
```

- [ ] **Step 3: Run and verify failure**

Run: `npm test`

Expected: FAIL for `src/hooks/useProjectRoute.js`.

- [ ] **Step 4: Implement History API state**

`useProjectRoute` initializes from `window.location.pathname`, listens to `popstate`, and returns only projects present in the data array. `openProject(slug)` stores the currently focused element, calls `history.pushState({ project: slug }, "", projectPath(slug))`, updates state and scroll-locks the body. `closeProject()` calls `history.back()` when current path is a project route; direct-entry cases use `history.replaceState({}, "", "/")`. On close, restore body overflow and focus.

- [ ] **Step 5: Implement accessible ProjectCase**

Render a fixed `<div role="dialog" aria-modal="true" aria-labelledby="project-title">`. Include the exact section order from the spec, `<details>` for technical implementation, lazy gallery images, external product link, and other-project cards. Close on button and `Esc`. Implement a focus trap over anchors, buttons, summary and `[tabindex]:not([tabindex="-1"])`. Ensure backdrop clicks close only when `event.target === event.currentTarget`.

- [ ] **Step 6: Compose routing in App**

Use:

```jsx
const { activeProject, openProject, closeProject } = useProjectRoute(projects);

<ProjectMarketplace projects={projects} onOpenProject={openProject} />
{activeProject && (
  <ProjectCase
    project={activeProject}
    projects={projects}
    onClose={closeProject}
    onOpenProject={openProject}
  />
)}
```

- [ ] **Step 7: Style desktop and mobile case layouts**

At 375/430 px use a single scroll column, `100dvh`, top/bottom safe-area padding and sticky 44×44 close button. At 768 px allow metric cards in two columns. At 1024+ use a wide editorial grid while keeping body text under 76 characters. No content may scroll behind the dialog.

- [ ] **Step 8: Verify Task 7**

Run: `npm test && npm run build`

Expected: PASS. Manual browser sequence: open Ostrov → URL changes → browser Back closes → Forward reopens → Esc closes → direct load `/projects/ilonmask-vpn` renders IlonMask.

---

### Task 8: Финальный CTA, integration polish и полная responsive QA

**Files:**
- Create: `src/components/FinalContact/FinalContact.jsx`
- Create: `src/components/FinalContact/FinalContact.css`
- Modify: `src/App.jsx`
- Modify: `src/styles/global.css`
- Modify: `src/styles/sections.css`
- Modify: `docs/design-qa.md`
- Create: `docs/design-evidence/implementation/landing-375.png`
- Create: `docs/design-evidence/implementation/landing-430.png`
- Create: `docs/design-evidence/implementation/landing-768.png`
- Create: `docs/design-evidence/implementation/landing-1024.png`
- Create: `docs/design-evidence/implementation/landing-1280.png`
- Create: `docs/design-evidence/implementation/landing-1440.png`

**Interfaces:**
- Consumes: `contact` and `hero.cta`.
- Produces: complete landing page and QA evidence.

- [ ] **Step 1: Add the final contact section**

Render:

```jsx
<section className="final-contact" id="contact" aria-labelledby="contact-title">
  <p className="section-kicker">Обсудить задачу</p>
  <h2 id="contact-title">Есть бизнес-задача, которую нужно превратить в работающую систему?</h2>
  <a className="button button--primary" href="https://t.me/gguzhov" target="_blank" rel="noreferrer">Решить проблему</a>
  <p><a href="https://t.me/gguzhov" target="_blank" rel="noreferrer">@gguzhov</a></p>
</section>
```

- [ ] **Step 2: Complete page landmarks and section navigation**

Set ids exactly to `problems`, `career`, `projects`, `contact`; ensure CardNav links match them. Use one `<main>`, one page `<h1>`, and sequential `<h2>` headings. Close the mobile menu before hash navigation and preserve `scroll-margin-top` for the floating header.

- [ ] **Step 3: Run automated verification**

Run: `npm test && npm run build`

Expected: all Node tests PASS; Vite and Sites packaging complete with exit code 0.

- [ ] **Step 4: Launch the production preview**

Run: `npm run preview -- --host 0.0.0.0`

Expected: preview URL loads `/`, both `/projects/...` paths and all local assets without 404 responses.

- [ ] **Step 5: Verify 375 and 430 px**

Check and capture both widths:

- no page-level horizontal scrolling;
- hero copy appears before ProfileCard;
- CTA and menu targets are at least 44×44 px;
- problem tabs scroll locally and do not trap page scroll;
- timeline is one column;
- projects are a static grid;
- project case uses internal scroll, safe-area and reachable close button;
- long Russian headings do not clip.

- [ ] **Step 6: Verify 768 and 1024 px**

Check and capture both widths:

- navigation opens without overlaying unreadable content;
- selector changes descriptions by pointer and keyboard;
- timeline transitions cleanly toward desktop geometry;
- 1024 px shows OptionWheel and compact DriftWall without cropping;
- project dialog gallery and metrics reflow without overflow.

- [ ] **Step 7: Verify 1280 and 1440 px**

Check and capture both widths:

- hero uses balanced copy/card columns;
- line length and max-width remain controlled;
- central timeline aligns with event cards;
- DriftWall has intentional depth without empty accidental edges;
- the final CTA is visible and visually connected to the marketplace.

- [ ] **Step 8: Verify accessibility and motion states**

Keyboard-walk the full page and both cases. Confirm visible focus, logical order, menu/dialog Esc handling, focus return, alt text, no focus on duplicated DriftWall tiles, and no hidden content. Emulate `prefers-reduced-motion: reduce` and confirm LiquidEther autoplay, ProfileCard tilt, timeline reveal and DriftWall motion are disabled while all information remains present.

- [ ] **Step 9: Record QA evidence**

Update `docs/design-qa.md` with date, browser, viewport, pass/fail for each requirement, any fixed regression and the six screenshot paths. Do not mark a width passed without opening the menu, switching a problem, opening a project and following the Telegram CTA up to (but not beyond) external navigation.

- [ ] **Step 10: Final clean verification**

Stop the preview, then run: `npm test && npm run build`

Expected: all tests and production build PASS with no console errors, missing assets or responsive exceptions documented.

---

## Self-Review Results

- Spec coverage: hero, CardNav, ProfileCard, four business problems, timeline, DriftWall marketplace, two route-backed cases, final CTA, accessibility, performance and all six viewport checks each map to an explicit task.
- Placeholder scan: no `TBD`, deferred implementation, unspecified error handling or unnamed tests remain in the plan.
- Type consistency: project slugs, project object fields, `onOpenProject(slug)`, `projectPath`, `projectSlugFromPath` and `useProjectRoute` names are consistent across content, marketplace and dialog tasks.
- Dependency check: only GSAP is added because the supplied CardNav implementation requires it; Hugeicons and Three already exist.
- Risk check: animated components always have static/reduced-motion fallbacks, and direct project URLs are supported by the existing worker SPA fallback.
