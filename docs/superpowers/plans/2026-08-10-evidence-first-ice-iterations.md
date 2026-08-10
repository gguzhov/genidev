# Evidence-first Ice Iterations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перестроить лендинг вокруг полного цикла «Проблема → Решение → Экономика → Разработка → Запуск → Аналитика», связать действия с четырьмя результатами и оформить реальные проекты в единой evidence-first Ice стилистике.

**Architecture:** `siteContent.js` остаётся единым источником текстов и результатов. `WorkSequence` становится однократно проявляющейся SVG-траекторией, `ProblemSelector` читает одинаковый контракт `actions/outcomes`, а новый `ProjectVisual` соединяет Imagen-фон, точный логотип и реальный интерфейс без подмены доказательств. Каждая из трёх итераций завершает самостоятельный пользовательский слой и проходит отдельный TDD/review gate.

**Tech Stack:** React 19, Vite 6, GSAP 3.13, CSS/SVG, Hugeicons, built-in Imagen, Node test runner.

## Global Constraints

- Основной H1: «Разрабатываю цифровые и AI-продукты.»
- Hero не содержит абзац «Комплексно подхожу к задаче…» и не выводит ФИО.
- Hero-процесс строго: `Проблема`, `Решение`, `Экономика`, `Разработка`, `Запуск`, `Аналитика`.
- На фотографии визуально нет ФИО, handle и профессии; остаётся одна кнопка «Связаться».
- Каждая бизнес-задача содержит ровно четыре действия и ровно четыре правдивых результата.
- Каждый проект содержит ровно четыре сильнейших подтверждённых результата.
- Imagen не генерирует текст и логотипы; точные логотипы и реальные интерфейсы сохраняются отдельными слоями.
- Новые зависимости не добавляются.
- Анимация однократная, без WebGL и бесконечных ambient-циклов; reduced motion показывает финальное состояние сразу.
- Mobile First; QA на `375`, `430`, `768`, `1024`, `1280`, `1440px`; touch targets не меньше `44×44px`.
- Использовать только токены из `docs/design-system.md`; motion `160/280/500ms`, easing `cubic-bezier(0.22, 1, 0.36, 1)`.
- Не изменять пользовательские `.npmrc`, `tmp/` и старые `docs/design-evidence/*iteration0..3/`.

---

### Task 1: Итерация 1 — смысл, hero и профессиональные задачи

**Files:**
- Create: `tests/evidence-first-ice-content.test.mjs`
- Modify: `src/content/siteContent.js`
- Modify: `src/content/renderNoscriptFallback.js`
- Modify: `src/App.jsx`
- Modify: `src/components/ProfileCard/ProfileCard.jsx`
- Modify: `src/components/ProfileCard/ProfileCard.css`
- Modify: `src/components/WorkSequence/WorkSequence.jsx`
- Modify: `src/components/WorkSequence/WorkSequence.css`
- Modify: `src/components/ProblemSelector/ProblemSelector.jsx`
- Modify: `src/components/ProblemSelector/ProblemSelector.css`

**Interfaces:**
- Consumes: существующие `useReducedMotion`, `profileCardMotion`, `transitionSelectedIndex` и layout tokens.
- Produces: `hero.sequence: string[6]`; `problems[]` с `{ id, title, actions: string[4], outcomes: string[4] }`; `WorkSequence({ items, reducedMotion })`; упрощённый `ProfileCard` с одним видимым CTA.

- [ ] **Step 1: Write the failing content and structure contract**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hero, problems } from "../src/content/siteContent.js";

test("publishes the six-stage business path", () => {
  assert.equal(hero.title, "Разрабатываю цифровые и AI-продукты.");
  assert.equal("description" in hero, false);
  assert.deepEqual(hero.sequence, [
    "Проблема",
    "Решение",
    "Экономика",
    "Разработка",
    "Запуск",
    "Аналитика",
  ]);
});

test("connects four professional actions to four outcomes", () => {
  assert.equal(problems.length, 4);
  for (const problem of problems) {
    assert.equal(problem.actions.length, 4);
    assert.equal(problem.outcomes.length, 4);
    assert.equal("description" in problem, false);
    assert.equal("result" in problem, false);
  }
});

test("keeps only one visible contact action on the portrait", async () => {
  const source = await readFile("src/components/ProfileCard/ProfileCard.jsx", "utf8");
  assert.doesNotMatch(source, /profile-card__behind/);
  assert.doesNotMatch(source, /profile-card__identity/);
  assert.match(source, />\s*Связаться\s*/);
});

test("removes the redundant problem section lead", async () => {
  const source = await readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8");
  assert.doesNotMatch(source, /Разбираю задачу, считаю эффект/);
  assert.match(source, /Действия/);
  assert.match(source, /К чему приводит/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/evidence-first-ice-content.test.mjs`  
Expected: FAIL on the old five-stage sequence, old `description/result` contract and portrait identity layers.

- [ ] **Step 3: Replace the content contract with the approved copy**

Set `hero.sequence` verbatim:

```js
sequence: ["Проблема", "Решение", "Экономика", "Разработка", "Запуск", "Аналитика"],
```

Replace the four problems with this exact contract. Do not paraphrase or add metrics:

```js
export const problems = [
  {
    id: "launch",
    title: "Запустить цифровой продукт",
    actions: [
      "Определяю проблему и целевого пользователя.",
      "Проверяю спрос и сценарий использования.",
      "Считаю модель доходов, затрат и ограничений.",
      "Проектирую и запускаю первую рабочую версию.",
    ],
    outcomes: [
      "Проверенная продуктовая гипотеза.",
      "Понятная экономика запуска.",
      "Работающий MVP.",
      "Данные для следующего решения.",
    ],
  },
  {
    id: "automate",
    title: "Автоматизировать бизнес-процесс",
    actions: [
      "Описываю текущий процесс и роли участников.",
      "Нахожу ручные операции, задержки и точки ошибок.",
      "Проектирую данные, статусы и интеграции.",
      "Разрабатываю управляемый цифровой сценарий.",
    ],
    outcomes: [
      "Меньше ручных операций.",
      "Единый статус процесса.",
      "Контроль ошибок и исключений.",
      "Аналитика выполнения.",
    ],
  },
  {
    id: "ai",
    title: "Внедрить AI в рабочий процесс",
    actions: [
      "Выбираю операции, где AI даёт практический эффект.",
      "Готовлю данные, контекст и правила ответа.",
      "Встраиваю модель в существующий процесс.",
      "Настраиваю проверку качества и мониторинг.",
    ],
    outcomes: [
      "AI работает внутри процесса.",
      "Качество можно проверять.",
      "Повторяемые операции выполняются быстрее.",
      "Решения и ошибки остаются под контролем.",
    ],
  },
  {
    id: "growth",
    title: "Улучшить продукт и его метрики",
    actions: [
      "Проверяю аналитику, воронку и пользовательский путь.",
      "Нахожу точки потери пользователей и ценности.",
      "Формирую и приоритизирую продуктовые гипотезы.",
      "Внедряю изменения и измеряю эффект.",
    ],
    outcomes: [
      "Понятная карта точек роста.",
      "Улучшенный пользовательский путь.",
      "Проверенные продуктовые гипотезы.",
      "Решения на основе данных.",
    ],
  },
];
```

- [ ] **Step 4: Simplify ProfileCard without weakening accessibility**

Keep the `name` prop only for `alt` and accessible names. Remove `.profile-card__behind`, `.profile-card__identity`, handle and title markup. Render one overlay action:

```jsx
<div className="profile-card__action-layer">
  <button
    className="profile-card__contact"
    type="button"
    aria-label={`Связаться с ${name}`}
    onClick={onContactClick}
  >
    Связаться
    <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
  </button>
</div>
```

The action layer must not cover the face and must not create internal scroll.

- [ ] **Step 5: Render the six-step semantic path**

Keep the ordered list as the semantic source and add one decorative normalized SVG track:

```jsx
<div className={`work-sequence${reducedMotion ? " work-sequence--static" : ""}`}>
  <svg className="work-sequence__track" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
    <path className="work-sequence__track-base" pathLength="1" d="M2 5 H98" />
    <path className="work-sequence__track-signal" pathLength="1" d="M2 5 H98" />
  </svg>
  <ol aria-label="Этапы комплексной работы">{/* six items */}</ol>
</div>
```

On mobile CSS replaces the horizontal track with a vertical line while the ordered content remains identical. Do not animate in this task beyond the existing bounded reveal; Task 3 owns lifecycle choreography.

- [ ] **Step 6: Replace ProblemSelector duplication with actions and outcomes**

The selected panel must have this information order:

```jsx
<p className="problem-selector__label">Действия</p>
<ul className="problem-selector__actions-list">{/* selected.actions */}</ul>
<p className="problem-selector__label problem-selector__label--outcomes">К чему приводит</p>
<ul className="problem-selector__outcomes" aria-label={`Результаты задачи «${selected.title}»`}>
  {/* exactly four selected.outcomes chips */}
</ul>
```

Delete the section lead and the old `Что делаю`/lead/outcome paragraph. Keep keyboard Home/End/Arrow behavior and the concise live status.

- [ ] **Step 7: Update no-JS fallback to the same contract**

For every problem render separate `Действия` and `К чему приводит` lists from `actions/outcomes`. Also render existing `career.metrics` when present so proof does not disappear without JavaScript.

- [ ] **Step 8: Verify Iteration 1**

Run:

```bash
node --test tests/evidence-first-ice-content.test.mjs tests/content-and-routing.test.mjs tests/noscript-fallback.test.mjs tests/problem-selector-state.test.mjs tests/hero-visual-contract.test.mjs
npm test
npm run build
git diff --check
```

Expected: focused and full suites PASS; build PASS; no diff-check errors.

- [ ] **Step 9: Commit Iteration 1**

```bash
git add tests/evidence-first-ice-content.test.mjs src/content/siteContent.js src/content/renderNoscriptFallback.js src/App.jsx src/components/ProfileCard src/components/WorkSequence src/components/ProblemSelector
git commit -m "ui: перестроить путь от проблемы до результата"
```

---

### Task 2: Итерация 2 — Imagen, логотипы и evidence-first карточки

**Files:**
- Create: `public/projects/brands/ostrov-logo.svg`
- Create: `public/projects/brands/ilonmask-logo.webp`
- Create: `public/projects/ice/ostrov-ice-v1.webp`
- Create: `public/projects/ice/ilonmask-ice-v1.webp`
- Create: `src/components/ProjectMarketplace/ProjectVisual.jsx`
- Create: `tests/evidence-first-project-visuals.test.mjs`
- Modify: `src/content/siteContent.js`
- Modify: `src/components/ProjectMarketplace/ProjectCard.jsx`
- Modify: `src/components/ProjectMarketplace/ProjectMarketplace.css`
- Modify: `src/components/ProjectCase/ProjectCase.jsx`
- Modify: `src/components/ProjectCase/ProjectCase.css`

**Interfaces:**
- Consumes: exact local logos `/Users/gguzhov/Documents/Остров Здоровья/AI/Сайт/public/images/logo-long.svg` and `/Users/gguzhov/Documents/AI/Projects/Ilonmaskvpn/frontend/public/images/logotype.webp`; real covers already declared by `project.cover`.
- Produces: `project.visual = { background, logo }`; `project.metrics: string[4]`; `ProjectVisual({ project })` with generated background, exact logo and real screenshot layers.

- [ ] **Step 1: Write the failing project evidence contract**

```js
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { projects } from "../src/content/siteContent.js";

test("publishes four strongest outcomes and hybrid visual assets", async () => {
  for (const project of projects) {
    assert.equal(project.metrics.length, 4);
    assert.match(project.visual.background, /^\/projects\/ice\/.+\.webp$/);
    assert.match(project.visual.logo, /^\/projects\/brands\//);
    await access(`public${project.visual.background}`);
    await access(`public${project.visual.logo}`);
  }
});

test("uses one media ratio and keeps real interface evidence", async () => {
  const card = await readFile("src/components/ProjectMarketplace/ProjectCard.jsx", "utf8");
  const css = await readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8");
  assert.match(card, /ProjectVisual/);
  assert.doesNotMatch(css, /nth-child\(2\).*aspect-ratio/s);
  assert.match(css, /aspect-ratio:\s*3\s*\/\s*2/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/evidence-first-project-visuals.test.mjs`  
Expected: FAIL because `project.visual`, four-result arrays and generated assets do not exist.

- [ ] **Step 3: Generate the two project-bound images with built-in Imagen**

Generate one distinct asset per prompt. Do not ask Imagen to render logos, text or UI.

Ostrov prompt:

```text
Use case: stylized-concept
Asset type: 3:2 portfolio project card background
Primary request: an original premium icy digital environment representing a system of personalized medicine
Scene/backdrop: translucent architectural glass and ice layers, a restrained pulse line, connected clinical data nodes, spacious composition
Style/medium: high-end 3D editorial technology render, precise and minimal
Lighting/mood: soft cold daylight, controlled silver-blue glow, calm and trustworthy
Color palette: deep navy, silver white, pale glacier blue
Composition/framing: landscape 3:2, central depth with quiet margins for real product layers
Constraints: no text, no letters, no numbers, no logos, no people, no medical crosses, no UI screenshots, no watermark
Avoid: acid neon, cyberpunk clutter, fantasy crystals, random devices
```

IlonMask prompt:

```text
Use case: stylized-concept
Asset type: 3:2 portfolio project card background
Primary request: an original premium icy digital environment representing a protected subscription network
Scene/backdrop: translucent orbital ice structure, controlled connection routes, layered secure network nodes, spacious composition
Style/medium: high-end 3D editorial technology render, precise and minimal
Lighting/mood: deep cold atmosphere, restrained cyan-white signal, confident and fast
Color palette: midnight navy, black-blue, silver white, pale cyan
Composition/framing: landscape 3:2, central network structure with quiet margins for real product layers
Constraints: no text, no letters, no numbers, no logos, no rockets, no people, no UI screenshots, no watermark
Avoid: acid neon, cyberpunk city, glowing padlocks, fantasy crystals, random satellites
```

Inspect both outputs with `view_image`. Copy selected originals into the workspace, then convert to width `1536px` WebP quality `84` without changing aspect ratio. Final files must be `public/projects/ice/ostrov-ice-v1.webp` and `public/projects/ice/ilonmask-ice-v1.webp`.

- [ ] **Step 4: Copy exact logos and validate them**

Copy the local SVG and WebP sources to the declared brand paths. Do not redraw, recolor or send logos through Imagen. Confirm SVG has no external references and raster logo dimensions are non-zero.

- [ ] **Step 5: Publish exactly four truthful results per project**

Use these values verbatim:

```js
// Остров Здоровья
metrics: [
  "+72% к посещаемости за месяц",
  "4 целевые записи",
  "CMS для самостоятельного обновления",
  "AI-ассистент и единая воронка",
]

// IlonMask VPN
metrics: [
  "300+ регистраций в месяц",
  "100+ активных платящих клиентов",
  "Оплата и подключение без администратора",
  "Автосинхронизация оплаты и VPN-доступа",
]
```

Add matching `visual.background` and `visual.logo` fields.

- [ ] **Step 6: Build ProjectVisual and semantic ProjectCard**

`ProjectVisual` renders three separate layers: generated background, real interface screenshot and exact logo. All are decorative inside the card; the project title remains the accessible name source.

```jsx
export default function ProjectVisual({ project }) {
  return (
    <span className="project-visual" aria-hidden="true">
      <img
        className="project-visual__atmosphere"
        src={project.visual.background}
        alt=""
        width="1536"
        height="1024"
        loading="lazy"
        decoding="async"
      />
      <span className="project-visual__product-frame">
        <img
          className="project-visual__product"
          src={project.cover}
          alt=""
          width={project.coverWidth}
          height={project.coverHeight}
          loading="lazy"
          decoding="async"
        />
      </span>
      <img className="project-visual__logo" src={project.visual.logo} alt="" />
    </span>
  );
}
```

Change the root card from one long-name `<button>` to `<article>`. Render an explicit button labeled `Открыть кейс: ${project.title}` and stretch its hit area over the article with a pseudo-element. Keep metrics as a semantic list outside the button's accessible name.

```jsx
<article className="project-card">
  <ProjectVisual project={project} />
  <div className="project-card__body">
    {/* category, title, summary, duration and four-item metric list */}
    <button
      className="project-card__open"
      type="button"
      aria-label={`Открыть кейс: ${project.title}`}
      onClick={() => onOpenProject(project.slug)}
    >
      Открыть кейс
    </button>
  </div>
</article>
```

- [ ] **Step 7: Normalize card geometry and preserve full case evidence**

Both marketplace media blocks use `aspect-ratio: 3 / 2` at every breakpoint. Remove staggered width/vertical-offset treatment that makes one project look secondary. The fullscreen `ProjectCase` continues to use `project.cover`, factual intrinsic dimensions and `object-fit: contain`; it shows all four result chips.

- [ ] **Step 8: Verify Iteration 2**

Run:

```bash
node --test tests/evidence-first-project-visuals.test.mjs tests/iteration-5-cover-dimensions.test.mjs tests/project-structure.test.mjs tests/content-and-routing.test.mjs
npm test
npm run build
git diff --check
```

Visually inspect both generated assets and both hybrid cards before committing.

- [ ] **Step 9: Commit Iteration 2**

```bash
git add public/projects/brands public/projects/ice src/content/siteContent.js src/components/ProjectMarketplace src/components/ProjectCase tests/evidence-first-project-visuals.test.mjs
git commit -m "ui: оформить проекты в evidence-first ice стиле"
```

---

### Task 3: Итерация 3 — code-first motion, адаптив и финальные ревью

**Files:**
- Create: `src/components/WorkSequence/workSequenceRevealState.js`
- Create: `tests/evidence-first-motion.test.mjs`
- Create: `docs/design-evidence/evidence-first-ice-final/*.png`
- Modify: `src/components/WorkSequence/WorkSequence.jsx`
- Modify: `src/components/WorkSequence/WorkSequence.css`
- Modify: `src/components/ProblemSelector/ProblemSelector.jsx`
- Modify: `src/components/ProblemSelector/ProblemSelector.css`
- Modify: `src/components/ProjectMarketplace/ProjectMarketplace.css`
- Modify: `src/styles/hero.css`
- Modify: `docs/design-system.md`

**Interfaces:**
- Consumes: normalized SVG path from Task 1, `actions/outcomes` contract, hybrid visuals from Task 2, existing GSAP dependency and motion tokens.
- Produces: `createWorkSequenceObserver({ root, reducedMotion, onReveal, IntersectionObserverClass }) -> cleanup`; one-shot `.is-revealed` lifecycle; complete 30-frame responsive evidence matrix.

- [ ] **Step 1: Write failing motion and responsive contracts**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("draws one normalized signal path and has a static reduced-motion state", async () => {
  const jsx = await readFile("src/components/WorkSequence/WorkSequence.jsx", "utf8");
  const css = await readFile("src/components/WorkSequence/WorkSequence.css", "utf8");
  assert.match(jsx, /pathLength="1"/);
  assert.match(css, /stroke-dasharray:\s*1/);
  assert.match(css, /stroke-dashoffset:\s*1/);
  assert.match(css, /prefers-reduced-motion/);
});

test("reveals actions before four outcome chips", async () => {
  const jsx = await readFile("src/components/ProblemSelector/ProblemSelector.jsx", "utf8");
  const css = await readFile("src/components/ProblemSelector/ProblemSelector.css", "utf8");
  assert.match(jsx, /--outcome-index/);
  assert.match(css, /problem-outcome-enter/);
  assert.match(css, /var\(--motion-state\)/);
});

test("keeps both project media blocks on the same grid and ratio", async () => {
  const css = await readFile("src/components/ProjectMarketplace/ProjectMarketplace.css", "utf8");
  assert.doesNotMatch(css, /margin-top:\s*88px/);
  assert.doesNotMatch(css, /span 7|span 5/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/evidence-first-motion.test.mjs`  
Expected: FAIL until the new one-shot path, staggered outcomes and equal desktop grid are implemented.

- [ ] **Step 3: Implement the one-shot observer lifecycle**

`createWorkSequenceObserver` must:

1. reveal immediately if reduced motion is active or `IntersectionObserver` is unavailable;
2. otherwise observe with `root: null`, `rootMargin: "0px"`, `threshold: 0.35`;
3. call `onReveal()` once on first intersection;
4. unobserve/disconnect immediately after reveal;
5. ignore queued callbacks after cleanup.

Use this production state boundary:

```js
export function createWorkSequenceObserver({
  root,
  reducedMotion,
  onReveal,
  IntersectionObserverClass = globalThis.IntersectionObserver,
}) {
  let disposed = false;
  if (!root || reducedMotion || !IntersectionObserverClass) {
    onReveal();
    return () => {
      disposed = true;
    };
  }

  const observer = new IntersectionObserverClass(
    (entries) => {
      if (disposed || !entries.some((entry) => entry.isIntersecting)) return;
      onReveal();
      observer.disconnect();
    },
    { root: null, rootMargin: "0px", threshold: 0.35 },
  );
  observer.observe(root);
  return () => {
    disposed = true;
    observer.disconnect();
  };
}
```

The SVG signal uses `pathLength="1"`, `stroke-dasharray: 1`, `stroke-dashoffset: 1 → 0` over `500ms`. Six nodes reveal through one GSAP timeline with `70ms` stagger and `gsap.context(...).revert()` cleanup. No animation loops.

- [ ] **Step 4: Sequence selected task content**

On every selected task change, actions are present first; four outcome chips enter with `--outcome-index: 0..3`, `280ms` duration and `45ms` stagger. The concise `role="status"` announces only the selected task title, not every chip.

- [ ] **Step 5: Finish the equal evidence grid and premium interaction**

At `>=768px`, use two equal columns. Both cards align at the same top edge and share the same media height. Hover/focus may add a restrained cold highlight and `translateY(-2px)` only; do not scale text or shift the screenshot more than `1.015`.

- [ ] **Step 6: Update design-system documentation**

Document the evidence-first Ice signature, generated/background versus evidence layers, the six-stage SVG lifecycle and the rule that results are always four compact chips.

- [ ] **Step 7: Verify interactions and production build**

Run:

```bash
node --test tests/evidence-first-motion.test.mjs tests/hero-interaction-state.test.mjs tests/problem-selector-state.test.mjs tests/project-case-state.test.mjs
npm test
npm run build
git diff --check
```

Manually verify:

- CardNav open/close/Escape and focus return;
- task switch by click, touch-sized controls, Arrow/Home/End;
- both project dialogs, Escape, Back/Forward and full cover visibility;
- reduced motion final states;
- no console errors or failed assets.

- [ ] **Step 8: Capture the final 30-frame matrix**

Capture `hero`, `problems`, `career`, `projects`, `contact` at `375`, `430`, `768`, `1024`, `1280`, `1440px` into `docs/design-evidence/evidence-first-ice-final/`. Before every capture wait for fonts, settled scroll, the fixed navigation's complete paint and at least two repaint opportunities. Verify `scrollWidth === innerWidth` and navigation descendants have non-zero geometry.

- [ ] **Step 9: Run three independent read-only reviews**

Dispatch separate reviewers for:

1. copy/positioning — clear in 3–5 seconds, no invented claims;
2. art direction — coherent premium Ice style, real evidence remains dominant;
3. motion/UX/accessibility — one-shot lifecycle, reduced motion, keyboard and responsive matrix.

Fix every Critical/Important/P1 finding in one bounded wave, then re-run the affected reviewer until explicit `APPROVED`.

- [ ] **Step 10: Commit Iteration 3 and delivery evidence**

```bash
git add src/components/WorkSequence src/components/ProblemSelector src/components/ProjectMarketplace src/styles/hero.css docs/design-system.md tests/evidence-first-motion.test.mjs docs/design-evidence/evidence-first-ice-final
git commit -m "ui: завершить evidence-first ice полировку"
```

- [ ] **Step 11: Final whole-branch verification**

Run:

```bash
npm test
npm run build
git diff --check
git status --short
```

Dispatch one final whole-branch reviewer against the spec and this plan. The branch is ready only with no Critical/Important findings and all three creative reviewers approved.
