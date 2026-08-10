# Premium Landing Iterations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перестроить личный лендинг так, чтобы посетитель быстро понял широкий комплексный подход Геннадия к бизнес-задачам в цифровом поле, а интерфейс выглядел цельно, премиально и выразительно в движении.

**Architecture:** Существующая React/Vite-архитектура сохраняется. Контент остаётся централизованным в `siteContent.js`; сложные непрерывные эффекты заменяются лёгкими компонентами на CSS и IntersectionObserver, а существующая маршрутизация полноэкранных кейсов не меняется.

**Tech Stack:** React 19, Vite 6, CSS, Node test runner, Hugeicons.

## Global Constraints

- H1: «Геннадий Гужов — разработчик цифровых и AI-продуктов.»
- Смысловая строка: «Превращаю бизнес-задачи в работающие цифровые продукты и автоматизированные процессы.»
- Пояснение: «Комплексно подхожу к задаче: считаю экономику, проектирую пользовательский путь, разрабатываю, запускаю и улучшаю продукт.»
- CTA остаётся «Решить проблему» и ведёт на `https://t.me/gguzhov`.
- Не использовать выдуманные названия методологии и абсолютные обещания.
- Единый контейнер `1280px`; gutters `16/24/32/40px` на mobile/wide mobile/tablet/desktop.
- Motion tokens: `160ms`, `280ms`, `500ms`; easing `cubic-bezier(0.22, 1, 0.36, 1)`.
- Mobile First; проверка `375/430/768/1024/1280/1440px`, touch targets не меньше `44×44px`.
- `prefers-reduced-motion` не запускает WebGL/RAF и не скрывает основной контент.
- Не добавлять зависимости и не изменять пользовательские `.npmrc` и `tmp/`.

---

### Task 9: Новый hero и последовательность комплексного подхода

**Files:**
- Create: `src/components/WorkSequence/WorkSequence.jsx`
- Create: `src/components/WorkSequence/WorkSequence.css`
- Modify: `src/App.jsx`
- Modify: `src/content/siteContent.js`
- Modify: `src/styles/hero.css`
- Modify: `src/styles/tokens.css`
- Modify: `docs/design-system.md`
- Test: `tests/premium-landing-contract.test.mjs`

**Interfaces:**
- Consumes: `hero` and `identity` from `siteContent.js`, `useReducedMotion`.
- Produces: `<WorkSequence items={hero.sequence} reducedMotion={reducedMotion} />` and shared layout/motion tokens.

- [ ] **Step 1: Write the failing hero contract test**

```js
test("hero presents identity first and explains the complete work sequence", () => {
  assert.match(contentSource, /title:\s*"Геннадий Гужов — разработчик цифровых и AI-продуктов\."/);
  assert.match(contentSource, /Превращаю бизнес-задачи в работающие цифровые продукты и автоматизированные процессы/);
  assert.match(appSource, /<WorkSequence/);
  assert.doesNotMatch(appSource, /<LiquidEther/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/premium-landing-contract.test.mjs`
Expected: FAIL because the content, `WorkSequence`, and no-LiquidEther contract are absent.

- [ ] **Step 3: Implement the hero**

Replace the old identity/title relationship with H1 identity, add `hero.promise`, keep `hero.description`, add `hero.sequence = ["Экономика", "Пользовательский путь", "Разработка", "AI", "Запуск и метрики"]`, render `WorkSequence`, remove `LiquidEther` from `App.jsx`, and align the portrait to the unified container. Animate the sequence once through CSS custom properties; render it fully static for reduced motion.

- [ ] **Step 4: Run GREEN and regression tests**

Run: `node --test tests/premium-landing-contract.test.mjs && npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/WorkSequence src/App.jsx src/content/siteContent.js src/styles/hero.css src/styles/tokens.css docs/design-system.md tests/premium-landing-contract.test.mjs
git commit -m "ui: сократить первый экран и показать подход"
```

### Task 10: Понятный выбор бизнес-задачи

**Files:**
- Modify: `src/components/ProblemSelector/ProblemSelector.jsx`
- Modify: `src/components/ProblemSelector/ProblemSelector.css`
- Modify: `src/content/siteContent.js`
- Test: `tests/premium-landing-contract.test.mjs`
- Test: `tests/problem-selector-state.test.mjs`

**Interfaces:**
- Consumes: `problems[]`, `transitionSelectedIndex`.
- Produces: semantic tablist/tabpanel layout without `OptionWheel` or wheel interception.

- [ ] **Step 1: Add failing selector contracts**

```js
test("problem selector uses a direct task rail and never mounts OptionWheel", () => {
  assert.doesNotMatch(problemSelectorSource, /OptionWheel/);
  assert.match(problemSelectorSource, /role="tablist"/);
  assert.match(problemSelectorSource, /role="tabpanel"/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/premium-landing-contract.test.mjs tests/problem-selector-state.test.mjs`
Expected: FAIL because `OptionWheel` is still mounted and tab semantics are absent.

- [ ] **Step 3: Implement the direct selector**

Use four numbered buttons in a vertical desktop rail and horizontal mobile snap rail. Keep every button at least 44px high. Replace the section copy with «От запуска продукта до AI-автоматизации» and «Разбираю задачу, считаю эффект и довожу решение до запуска». Animate only the active indicator and panel opacity/translate; do not intercept wheel events.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/premium-landing-contract.test.mjs tests/problem-selector-state.test.mjs && npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProblemSelector src/content/siteContent.js tests/premium-landing-contract.test.mjs tests/problem-selector-state.test.mjs
git commit -m "ui: упростить выбор бизнес-задачи"
```

### Task 11: Читаемый карьерный путь с доказательствами

**Files:**
- Modify: `src/components/CareerTimeline/CareerTimeline.jsx`
- Modify: `src/components/CareerTimeline/CareerTimeline.css`
- Modify: `src/content/siteContent.js`
- Modify: `src/components/CareerTimeline/careerTimelineState.js`
- Test: `tests/career-timeline-state.test.mjs`
- Test: `tests/premium-landing-contract.test.mjs`

**Interfaces:**
- Consumes: `career[]` with optional `metrics[]`.
- Produces: one-sided readable timeline and progressive decorative line that never controls content visibility.

- [ ] **Step 1: Add failing career contracts**

```js
test("career keeps every event readable and renders separate proof metrics", () => {
  assert.match(careerSource, /metrics:/);
  assert.match(careerComponentSource, /career-timeline__metrics/);
  assert.doesNotMatch(careerCssSource, /career-timeline--revealing[^{]*\{[^}]*opacity:\s*0/s);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/career-timeline-state.test.mjs tests/premium-landing-contract.test.mjs`
Expected: FAIL because metrics are embedded in paragraphs and reveal hides events.

- [ ] **Step 3: Implement the career rail**

Shorten each body to one or two sentences, extract proven numbers to `metrics`, render all events at full contrast in one column, and animate only the progress line plus a subtle year highlight. Replace the heading with «От экономики — к продуктам и AI» and the approved one-sentence explanation.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/career-timeline-state.test.mjs tests/premium-landing-contract.test.mjs && npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CareerTimeline src/content/siteContent.js tests/career-timeline-state.test.mjs tests/premium-landing-contract.test.mjs
git commit -m "ui: усилить карьерный путь метриками"
```

### Task 12: Два сильных проекта вместо декоративной стены

**Files:**
- Modify: `src/components/ProjectMarketplace/ProjectMarketplace.jsx`
- Modify: `src/components/ProjectMarketplace/ProjectMarketplace.css`
- Modify: `src/components/ProjectMarketplace/ProjectCard.jsx`
- Modify: `src/content/siteContent.js`
- Test: `tests/marketplace-state.test.mjs`
- Test: `tests/premium-landing-contract.test.mjs`

**Interfaces:**
- Consumes: existing `projects[]` and `onOpenProject` route callback.
- Produces: two editorial project cards with visible duration, summary and metrics; preserves `ProjectCase` routing.

- [ ] **Step 1: Add failing marketplace contract**

```js
test("marketplace renders real projects directly without DriftWall duplication", () => {
  assert.doesNotMatch(marketplaceSource, /DriftWall/);
  assert.match(marketplaceSource, /projects\.map/);
  assert.match(projectCardSource, /project\.summary/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/marketplace-state.test.mjs tests/premium-landing-contract.test.mjs`
Expected: FAIL because `DriftWall` is still the desktop presentation and summary is absent from cards.

- [ ] **Step 3: Implement the editorial case grid**

Always render the two real projects. Use a large asymmetric desktop grid and one column on mobile. Show category, title, one short summary, launch duration and confirmed metrics. Add subtle media movement on hover/focus only; metrics remain visible on touch and reduced motion.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/marketplace-state.test.mjs tests/premium-landing-contract.test.mjs && npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectMarketplace src/content/siteContent.js tests/marketplace-state.test.mjs tests/premium-landing-contract.test.mjs
git commit -m "ui: сделать проекты главным доказательством"
```

### Task 13: Единая сетка, motion-полировка и финальный CTA

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/styles/sections.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/components/CardNav/CardNav.css`
- Modify: `src/components/ProfileCard/ProfileCard.css`
- Modify: `src/components/ProfileCard/profileCardMotion.js`
- Modify: `src/components/FinalContact/FinalContact.css`
- Modify: `src/content/siteContent.js`
- Modify: `docs/design-system.md`
- Test: `tests/hero-interaction-state.test.mjs`
- Test: `tests/premium-landing-contract.test.mjs`

**Interfaces:**
- Consumes: the preceding hero, selector, timeline and marketplace layouts.
- Produces: shared container/gutter/motion/radius tokens and final responsive composition.

- [ ] **Step 1: Add failing global visual contracts**

```js
test("layout uses one container and one motion scale", () => {
  assert.match(tokensSource, /--layout-max:\s*1280px/);
  assert.match(tokensSource, /--motion-fast:\s*160ms/);
  assert.match(tokensSource, /--motion-state:\s*280ms/);
  assert.match(tokensSource, /--motion-reveal:\s*500ms/);
  assert.match(navCssSource, /var\(--layout-max\)/);
  assert.match(sectionCssSource, /var\(--layout-max\)/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/hero-interaction-state.test.mjs tests/premium-landing-contract.test.mjs`
Expected: FAIL because shared tokens are absent and containers differ.

- [ ] **Step 3: Implement the unified polish**

Move container, gutter, radius and motion values to tokens and apply them to nav, hero, sections and final CTA. Reduce ProfileCard tilt to 1–2 degrees, reduce generic shadows, strengthen muted text contrast, and update the final heading to «Есть задача, которую пора превратить в систему?». Preserve keyboard focus and reduced-motion behavior.

- [ ] **Step 4: Run GREEN and production build**

Run: `node --test tests/hero-interaction-state.test.mjs tests/premium-landing-contract.test.mjs && npm test && npm run build`
Expected: all tests PASS and build completes.

- [ ] **Step 5: Commit**

```bash
git add src/styles src/components/CardNav src/components/ProfileCard src/components/FinalContact src/content/siteContent.js docs/design-system.md tests/hero-interaction-state.test.mjs tests/premium-landing-contract.test.mjs
git commit -m "ui: выровнять сетку и систему анимаций"
```

### Task 14: Три визуальные итерации и финальное одобрение

**Files:**
- Create: `docs/design-evidence/premium-iteration-1/*.png`
- Create: `docs/design-evidence/premium-iteration-2/*.png`
- Create: `docs/design-evidence/premium-iteration-3/*.png`
- Modify: files identified by review findings only
- Modify: `.superpowers/sdd/progress.md`

**Interfaces:**
- Consumes: completed Tasks 9–13.
- Produces: responsive evidence, agent review reports, fixes, and final green build.

- [ ] **Step 1: Capture iteration 1**

Use the in-app Browser at `375/430/768/1024/1280/1440px`; capture hero, tasks, career, projects and contact. Record overflow, element geometry, keyboard focus and reduced-motion checks.

- [ ] **Step 2: Dispatch three independent reviewers**

Assign visual hierarchy/alignment, copy/clarity, and motion/accessibility. Require numbered P0/P1/P2 findings and explicit approval criteria.

- [ ] **Step 3: Fix every P0/P1 through TDD and capture iteration 2**

Add a failing structural/state test for each code-level regression, verify RED, implement the fix, run focused GREEN and repeat screenshots.

- [ ] **Step 4: Re-review and capture iteration 3**

Send iteration 2 screenshots to fresh reviewers. Resolve remaining P0/P1, capture the final six widths, and require three explicit approvals.

- [ ] **Step 5: Final verification and commit**

```bash
npm test
npm run build
git diff --check
git add <only relevant implementation, tests, docs and evidence>
git commit -m "ui: завершить премиальные итерации лендинга"
```

