# Marketplace & DATONIKS Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переработать задачи, карьерный путь, маркетплейс, навигацию и контактный блок; добавить честный кейс DATONIKS, публичный питч-дек и общую scan/signal motion-систему.

**Architecture:** Факты остаются в `siteContent.js`, визуальные компоненты получают только необходимую семантическую структуру. DATONIKS использует существующий route-backed `ProjectCase`; дополнительная внешняя ссылка передаётся данными проекта. Motion событийный, one-shot и полностью отключаемый через `prefers-reduced-motion`.

**Tech Stack:** React 19, Vite, CSS, GSAP/CustomEase, Hugeicons, Node test runner, pypdf/Poppler assets pipeline.

## Global Constraints

- Сохранять Evidence-first Ice палитру и только существующие цветовые токены.
- Mobile First; QA на 375, 430, 768, 1024, 1280 и 1440 px.
- Touch targets не меньше 44×44 px; нет горизонтального скролла страницы.
- `prefers-reduced-motion` отключает scan, stagger и pointer depth; контент остаётся видимым.
- Не публиковать бизнес-план, последний слайд питч-дека, личный телефон, старый email, юридический адрес, cap table и подробные инженерные схемы.
- Прогнозную экономику DATONIKS явно маркировать «по финансовой модели»; не писать, что раунд закрыт или серийное производство запущено.
- В карточке каждого проекта ровно четыре сильнейших результата.
- Imagen не генерирует логотипы, лица, интерфейсы, текст или метрики.
- Не добавлять dependencies и не изменять пользовательские untracked `.npmrc`, `tmp/` и старые evidence-папки.

---

### Task 1: Контент, DATONIKS и публичный PDF

**Files:**
- Modify: `src/content/siteContent.js`
- Modify: `src/content/renderNoscriptFallback.js`
- Modify: `src/components/ProjectCase/ProjectCase.jsx`
- Modify: `src/components/ProjectCase/ProjectCase.css`
- Create: `public/documents/datoniks-pitch-deck-public.pdf`
- Create: `public/projects/datoniks/datoniks-slide-03.webp`
- Create: `public/projects/datoniks/datoniks-slide-10.webp`
- Create: `public/projects/datoniks/datoniks-logo.webp`
- Test: `tests/datoniks-content.test.mjs`

**Interfaces:**
- Produces project fields `status`, `metrics`, `modelMetrics`, `externalActions` and a third slug `datoniks`.
- `externalActions` is an array of `{ label, href, target?, rel? }` rendered in the case header/body without changing route history.

- [ ] **Step 1: Write the failing content test**

Assert: 3 projects; DATONIKS has exactly 4 result metrics, `status === "Инвестиционный проект · ищу партнёра"`, the confirmed role/actions, public PDF path, no forbidden contact strings, and no-JS includes 3 projects.

- [ ] **Step 2: Run RED**

Run: `node --test tests/datoniks-content.test.mjs`
Expected: FAIL because `datoniks` and `externalActions` do not exist.

- [ ] **Step 3: Create safe assets**

Use `pypdf.PdfWriter` to copy slides 1–17 of `/Users/gguzhov/Downloads/Питч-дек_DATONIKS.pdf`; omit slide 18. Render/crop slide 3, slide 10 and the exact deck logo, convert to WebP, verify dimensions and inspect visually.

- [ ] **Step 4: Implement content and case actions**

Add the richer logistics/career text and DATONIKS case. Use confirmed results (`Прототип реализован в Иркутске`, `Патент на систему охлаждения`, `Бизнес-план и финансовая модель`, `87 млн ₽ — инвестиционный запрос`). Put model numbers only under `modelMetrics` with a visible qualifier.

- [ ] **Step 5: Run GREEN and related tests**

Run: `node --test tests/datoniks-content.test.mjs tests/content-contract.test.mjs tests/project-case-structure.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

`git commit -m "контент: добавить инвестиционный проект DATONIKS"`

### Task 2: Маркетплейс из трёх равных кейсов

**Files:**
- Modify: `src/components/ProjectMarketplace/ProjectMarketplace.jsx`
- Modify: `src/components/ProjectMarketplace/ProjectCard.jsx`
- Modify: `src/components/ProjectMarketplace/ProjectVisual.jsx`
- Modify: `src/components/ProjectMarketplace/ProjectMarketplace.css`
- Modify: `src/components/ProjectMarketplace/projectVisualPointerLifecycle.js`
- Create: `public/projects/ice/datoniks-ice-v1.webp`
- Test: `tests/marketplace-redesign.test.mjs`

**Interfaces:**
- Consumes third project and DATONIKS real assets from Task 1.
- Preserves `onOpenProject(slug)` as the only card-wide action.

- [ ] **Step 1: Write failing marketplace tests**

Assert exact title/description, no `Реализованные проекты`, 1/2/3-column breakpoints, 3:2 media, four results per card, truthful status row, and pointer listeners only for fine hover/no reduced motion.

- [ ] **Step 2: Run RED**

Run: `node --test tests/marketplace-redesign.test.mjs`
Expected: FAIL on old heading and missing third-column/DATONIKS styling.

- [ ] **Step 3: Generate DATONIKS atmosphere with built-in Imagen**

Generate one 3:2 abstract prefab data-center ice environment without text, logos, UI, people or metrics. Inspect, copy into `public/projects/ice/`, convert to WebP 1536×1024.

- [ ] **Step 4: Implement compact evidence cards**

Use equal cards and media. Add a restrained status/duration row and four rectangular evidence chips. Keep actual slide/interface and exact logo as separate layers. Limit `will-change` to active pointer interaction.

- [ ] **Step 5: Run GREEN**

Run: `node --test tests/marketplace-redesign.test.mjs tests/marketplace-state.test.mjs tests/iteration-2-fixes.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

`git commit -m "ui: расширить маркетплейс до трёх проектов"`

### Task 3: Паспорта бизнес-задач

**Files:**
- Modify: `src/content/siteContent.js`
- Modify: `src/components/ProblemSelector/ProblemSelector.jsx`
- Modify: `src/components/ProblemSelector/ProblemSelector.css`
- Modify: `src/components/ProblemSelector/problemSelectionState.js`
- Test: `tests/problem-passports.test.mjs`

**Interfaces:**
- Each problem adds `code` and `situation`; keeps exactly four `actions` and four `outcomes`.
- Existing Arrow/Home/End selection behavior and concise live status remain unchanged.

- [ ] **Step 1: Write failing problem passport tests**

Assert exact H2 `В чем могу быть полезен?`, four exact codes, each situation begins with `Когда`, four actions/outcomes, visible labels `Что беру на себя` / `На выходе`, decorative barcode semantics and scan re-keyed on selected id.

- [ ] **Step 2: Run RED**

Run: `node --test tests/problem-passports.test.mjs`
Expected: FAIL because `code`, `situation` and barcode do not exist.

- [ ] **Step 3: Implement semantic passports**

Render code, situation, CSS barcode and four outcomes. Raise essential text to at least 14 px. Trigger one 280 ms scan on selection; no interval or persistent loop.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/problem-passports.test.mjs tests/problem-selector-state.test.mjs tests/evidence-first-motion.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "ui: оформить задачи как цифровые паспорта"`

### Task 4: Карьера, минимальная навигация и личный контакт

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/CardNav/CardNav.jsx`
- Modify: `src/components/CardNav/CardNav.css`
- Modify: `src/components/CareerTimeline/CareerTimeline.jsx`
- Modify: `src/components/CareerTimeline/CareerTimeline.css`
- Modify: `src/components/FinalContact/FinalContact.jsx`
- Modify: `src/components/FinalContact/FinalContact.css`
- Modify: `src/content/siteContent.js`
- Create: `public/images/ai-ice-core-v1.webp`
- Test: `tests/navigation-contact-career.test.mjs`

**Interfaces:**
- `CardNav` consumes a flat link array, while optionally normalizing legacy grouped input for backward safety.
- `FinalContact` consumes `contact.title`, `contact.body`, `contact.handle` and existing profile image.

- [ ] **Step 1: Write failing structure/copy tests**

Assert no nav group labels or visible FIO, CTA `Связаться`, richer career exact facts, DATONIKS current investment status, new contact copy/photo, and mobile text-before-photo order.

- [ ] **Step 2: Run RED**

Run: `node --test tests/navigation-contact-career.test.mjs`
Expected: FAIL on grouped navigation, visible name and old contact.

- [ ] **Step 3: Generate restrained AI core**

Use built-in Imagen for a single small abstract ice sensor/core without text, face, brand or robot cliché. Hide it on mobile; use it only inside expanded nav and keep existing portrait in contact.

- [ ] **Step 4: Implement flat nav, richer journal and split contact**

Keep menu state/focus lifecycle. Make career entries easier to scan with direction + responsibility + proof. Contact text comes before photo on mobile.

- [ ] **Step 5: Run GREEN**

Run: `node --test tests/navigation-contact-career.test.mjs tests/card-nav-contract.test.mjs tests/contact-content.test.mjs tests/career-timeline.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

`git commit -m "ui: упростить навигацию и усилить личный путь"`

### Task 5: Общая motion-система, docs и полный QA

**Files:**
- Modify: `src/styles/sections.css`
- Modify: `src/styles/global.css`
- Modify: `src/styles/tokens.css`
- Modify: `docs/design-system.md`
- Modify: `docs/design-qa.md`
- Create: `tests/marketplace-final-regression.test.mjs`
- Create: `docs/design-evidence/marketplace-datoniks-final/*.png`

**Interfaces:**
- Adds one-shot section/card reveal helper or CSS class without hiding content when observer/JS is absent.
- Does not add a new animation library.

- [ ] **Step 1: Write failing regression tests**

Assert no infinite animation declarations in changed surfaces, reduced-motion final state, no global `0.01ms` kill switch for essential feedback, no stale Inter token, no stale copy, and no forbidden DATONIKS personal data in built assets.

- [ ] **Step 2: Run RED**

Run: `node --test tests/marketplace-final-regression.test.mjs`
Expected: FAIL on stale token/global reduced-motion behavior or missing final contracts.

- [ ] **Step 3: Implement bounded signal/reveal polish**

Unify scan/reveal easing and timing through existing tokens. Keep all content visible by default and move only enhanced browsers. Run Impeccable detector once over changed JSX/CSS.

- [ ] **Step 4: Run automated GREEN**

Run: `npm test && npm run build && git diff --check`
Expected: all tests PASS, production build PASS, diff check empty.

- [ ] **Step 5: Browser QA**

At 375/430/768/1024/1280/1440 verify all five sections, no page overflow, 44 px targets, project 3:2 ratio, 4×3 result chips, menu Escape/focus, problem keyboard navigation, all 3 dialogs, DATONIKS PDF, history/back-forward, console/network, reduced motion.

- [ ] **Step 6: Bounded visual pass**

Capture 30 PNG evidence files. Fix all discovered defects in one batch, confirm affected widths once, then stop polishing.

- [ ] **Step 7: Commit**

`git commit -m "fix: завершить адаптивную полировку портфолио"`
