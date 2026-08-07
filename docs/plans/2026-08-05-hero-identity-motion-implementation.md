# Hero Identity And Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Подключить JetBrains Mono, добавить логотип и favicon, исправить имя на «Геннадий Гужов», улучшить спокойную анимацию hero и привести структуру проекта и документации к утверждённому виду.

**Architecture:** Документация переезжает в `docs/`, Liquid Ether становится изолированным компонентом, а стили разделяются на токены, глобальные правила и hero. Идентичность и параметры движения остаются декларативными в `App.jsx`; CSS отвечает только за визуальные роли, адаптивность и последовательное вступление.

**Tech Stack:** React 19, Vite 6, Three.js, Hugeicons, JetBrains Mono variable font через `@fontsource-variable/jetbrains-mono`, Node test runner.

## Global Constraints

- Основной и единственный шрифт интерфейса — JetBrains Mono с резервным стеком `ui-monospace, SFMono-Regular, Consolas, monospace`.
- Актуальное имя во всех пользовательских текстах и метаданных — «Геннадий Гужов».
- Единственный источник логотипа и favicon — `public/logo.svg`.
- Liquid Ether использует `autoSpeed={0.24}`, `autoIntensity={0.95}`, `viscous={40}`, `iterationsViscous={36}`, `cursorSize={150}`, `mouseForce={12}`, `takeoverDuration={0.45}`, `autoResumeDelay={3200}`, `autoRampDuration={1.4}`.
- Палитра эффекта остаётся `#e7eaf1`, `#ccd9f4`, `#8fabef` при opacity `0.48`.
- При `prefers-reduced-motion: reduce` автоматическое движение и вступление отключаются.
- Проверяемые ширины: 375, 430, 768, 1024, 1280 и 1440 px.
- `AGENTS.md` и файлы исполнения остаются в корне; документация, планы и QA-материалы хранятся в `docs/`.
- Проект не является Git-репозиторием, поэтому шаги commit намеренно отсутствуют; каждый task заканчивается проверяемым локальным checkpoint.

---

## File Map

**Create**

- `docs/README.md` — индекс документации.
- `src/styles/tokens.css` — палитра, семантические токены и типографический стек.
- `src/styles/global.css` — reset, базовые элементы, focus и reduced-motion defaults.
- `src/styles/hero.css` — hero, навигация, кнопки, responsive и entrance motion.
- `tests/project-structure.test.mjs` — структура, шрифт, идентичность и motion contracts.

**Move**

- `DESIGN.md` → `docs/design-system.md`.
- `design-qa.md` → `docs/design-qa.md`.
- `.design-evidence/` → `docs/design-evidence/`.
- `src/components/LiquidEther.jsx` → `src/components/LiquidEther/LiquidEther.jsx`.
- `src/components/LiquidEther.css` → `src/components/LiquidEther/LiquidEther.css`.

**Modify**

- `AGENTS.md` — актуальные ссылки на дизайн-систему.
- `docs/design-system.md` — правила JetBrains Mono и типографические токены.
- `docs/design-qa.md` — новые пути evidence и итоговая QA-итерация.
- `package.json` и `package-lock.json` — локальный пакет шрифта и общий test script.
- `index.html` — favicon, имя и metadata.
- `src/main.jsx` — импорт variable font и разделённых CSS-файлов.
- `src/App.jsx` — новый путь Liquid Ether, имя, логотип, motion markup и утверждённые параметры.

**Delete after migration**

- `src/styles.css`.
- Пустые каталоги `.design-evidence/` и `src/components/` старой формы.

---

### Task 1: Documentation And Structure Contract

**Files:**

- Create: `tests/project-structure.test.mjs`
- Create: `docs/README.md`
- Move: `DESIGN.md` → `docs/design-system.md`
- Move: `design-qa.md` → `docs/design-qa.md`
- Move: `.design-evidence/` → `docs/design-evidence/`
- Modify: `AGENTS.md`
- Modify: `docs/design-qa.md`

**Interfaces:**

- Consumes: существующие root-документы и QA evidence.
- Produces: стабильные пути `docs/design-system.md`, `docs/design-qa.md`, `docs/design-evidence/` и индекс `docs/README.md`.

- [ ] **Step 1: Write the failing structure test**

Создать `tests/project-structure.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and verify the initial failure**

Run: `node --test tests/project-structure.test.mjs`

Expected: FAIL with `Missing docs/README.md`.

- [ ] **Step 3: Move documentation without deleting evidence**

Run:

```bash
mkdir -p docs
mv DESIGN.md docs/design-system.md
mv design-qa.md docs/design-qa.md
mv .design-evidence docs/design-evidence
```

- [ ] **Step 4: Create the documentation index**

Create `docs/README.md`:

```md
# Документация проекта

- [Дизайн-система](./design-system.md)
- [Design QA](./design-qa.md)
- [Спецификации и планы](./plans/)
- [Визуальные evidence](./design-evidence/)
```

- [ ] **Step 5: Update root rules and QA paths**

В `AGENTS.md` заменить обе ссылки `DESIGN.md` на `docs/design-system.md`.

В `docs/design-qa.md` заменить:

```text
.design-evidence/
```

на:

```text
docs/design-evidence/
```

и заменить упоминание `` `DESIGN.md` `` на `` `docs/design-system.md` ``.

- [ ] **Step 6: Run the structure test**

Run: `node --test tests/project-structure.test.mjs`

Expected: PASS `stores project documentation under docs`.

---

### Task 2: Local JetBrains Mono And CSS Boundaries

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/main.jsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/styles/hero.css`
- Delete: `src/styles.css`
- Modify: `docs/design-system.md`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**

- Consumes: palette and semantic tokens from legacy `src/styles.css`.
- Produces: `--font-primary`, locally loaded JetBrains Mono and three CSS responsibility boundaries.

- [ ] **Step 1: Extend the failing test for font and style structure**

Append to `tests/project-structure.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/project-structure.test.mjs`

Expected: FAIL because `@fontsource-variable/jetbrains-mono` is absent.

- [ ] **Step 3: Install the local variable font**

Run:

```bash
npm install --prefer-offline --no-audit --no-fund @fontsource-variable/jetbrains-mono
```

Expected: dependency is written to `package.json` and `package-lock.json`.

- [ ] **Step 4: Split the CSS by responsibility**

Create `src/styles/tokens.css` with the complete existing palette and P3 block from `src/styles.css`, then add inside the root theme selector:

```css
--font-primary: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, Consolas, monospace;
```

Create `src/styles/global.css` from the existing reset and base element rules. The root typography rule must be:

```css
:root {
  font-family: var(--font-primary);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}
```

Create `src/styles/hero.css` from all selectors beginning with `.hero`, `.site-header`, `.brand`, navigation, button and responsive rules. Preserve every existing breakpoint and the final effect opacity `0.48`.

- [ ] **Step 5: Wire the font and styles in `src/main.jsx`**

Use these imports before rendering:

```js
import "@fontsource-variable/jetbrains-mono";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/hero.css";
```

Remove `import "./styles.css";` and delete `src/styles.css` only after the three replacement files contain all rules.

- [ ] **Step 6: Document typography roles**

Add to `docs/design-system.md`:

```md
## Типографика

Основной и единственный шрифт интерфейса — JetBrains Mono. Он подключается локально через `@fontsource-variable/jetbrains-mono`.

- Display: weight 700, line-height 0.96, отрицательный tracking только для крупного hero.
- Body: weight 400–500, line-height 1.55.
- Navigation and controls: weight 600–700.
- Utility labels: weight 600–700 с умеренным tracking.
- Fallback: `ui-monospace, SFMono-Regular, Consolas, monospace`.

Не подключай JetBrains Mono через CDN или Google Fonts.
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
node --test tests/project-structure.test.mjs
npm run build
```

Expected: tests PASS; Vite build completes and produces `dist/client` and `dist/server/index.js`.

---

### Task 3: Component Structure, Logo, Favicon And Name

**Files:**

- Move: `src/components/LiquidEther.jsx` → `src/components/LiquidEther/LiquidEther.jsx`
- Move: `src/components/LiquidEther.css` → `src/components/LiquidEther/LiquidEther.css`
- Modify: `src/App.jsx`
- Modify: `index.html`
- Modify: `tests/project-structure.test.mjs`
- Modify: `docs/design-qa.md`

**Interfaces:**

- Consumes: `public/logo.svg`, `--font-primary`, `LiquidEther` default export.
- Produces: brand link with logo and correct accessible name; SVG favicon; isolated `LiquidEther/` component path.

- [ ] **Step 1: Extend the failing identity test**

Append to `tests/project-structure.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/project-structure.test.mjs`

Expected: FAIL because the component still uses the old path and name.

- [ ] **Step 3: Move Liquid Ether into its component directory**

Run:

```bash
mkdir -p src/components/LiquidEther
mv src/components/LiquidEther.jsx src/components/LiquidEther/LiquidEther.jsx
mv src/components/LiquidEther.css src/components/LiquidEther/LiquidEther.css
```

Keep the internal CSS import as `./LiquidEther.css`.

- [ ] **Step 4: Update brand markup and component import**

Use in `src/App.jsx`:

```jsx
import LiquidEther from "./components/LiquidEther/LiquidEther";

<a className="brand" href="#work" aria-label="Геннадий Гужов — на главную">
  <img className="brand__logo" src="/logo.svg" alt="" aria-hidden="true" />
  <span>Геннадий Гужов</span>
</a>
```

Add to `src/styles/hero.css`:

```css
.brand {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
}

.brand__logo {
  width: 28px;
  height: 22px;
  object-fit: contain;
}
```

- [ ] **Step 5: Update favicon and metadata**

Inside `index.html` head add:

```html
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

Set:

```html
<meta name="description" content="Личный сайт Геннадия Гужова — дизайн и разработка цифровых продуктов." />
<title>Геннадий Гужов — цифровые продукты</title>
```

- [ ] **Step 6: Update QA copy references**

Replace every user-facing `Георгий Гужов` in `docs/design-qa.md` with `Геннадий Гужов`. Do not rename historical evidence files.

- [ ] **Step 7: Run identity tests and build**

Run:

```bash
node --test tests/project-structure.test.mjs
npm run build
```

Expected: tests PASS; `dist/client/index.html` contains `/logo.svg` and the correct name.

---

### Task 4: Calm Liquid Motion And Orchestrated Entrance

**Files:**

- Modify: `src/App.jsx`
- Modify: `src/styles/hero.css`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**

- Consumes: `LiquidEther` props and existing `useReducedMotion()` boolean.
- Produces: exact calm-motion prop contract and CSS entrance classes disabled under reduced motion.

- [ ] **Step 1: Extend the failing motion contract test**

Append to `tests/project-structure.test.mjs`:

```js
test("uses the approved calm motion contract", async () => {
  const app = await readFile("src/App.jsx", "utf8");
  for (const contract of [
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/project-structure.test.mjs`

Expected: FAIL with the first missing motion contract.

- [ ] **Step 3: Apply the approved Liquid Ether parameters**

Use this prop block in `src/App.jsx`:

```jsx
<LiquidEther
  className="hero__ether"
  colors={["#e7eaf1", "#ccd9f4", "#8fabef"]}
  mouseForce={12}
  cursorSize={150}
  isViscous
  viscous={40}
  iterationsViscous={36}
  iterationsPoisson={28}
  resolution={0.5}
  autoDemo={!reducedMotion}
  autoSpeed={0.24}
  autoIntensity={0.95}
  takeoverDuration={0.45}
  autoResumeDelay={3200}
  autoRampDuration={1.4}
/>
```

- [ ] **Step 4: Make both title lines independently revealable**

Replace the heading contents with:

```jsx
<h1 id="hero-title">
  <span className="hero__title-line">Проектирую и запускаю</span>
  <span className="hero__title-line">цифровые продукты.</span>
</h1>
```

Add `hero-reveal` classes to the header, availability, intro and actions through existing semantic class names; no JavaScript timers are required.

- [ ] **Step 5: Add the single entrance sequence**

Add to `src/styles/hero.css`:

```css
@keyframes hero-reveal {
  from {
    opacity: 0;
    transform: translateY(var(--reveal-offset, 10px));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.site-header,
.availability,
.hero__title-line,
.hero__intro,
.hero__actions {
  animation: hero-reveal var(--reveal-duration, 420ms) cubic-bezier(0.22, 1, 0.36, 1) both;
}

.site-header { --reveal-offset: -8px; --reveal-duration: 420ms; }
.availability { --reveal-offset: 8px; animation-delay: 100ms; }
.hero__title-line { --reveal-offset: 14px; --reveal-duration: 500ms; }
.hero__title-line:nth-child(1) { animation-delay: 180ms; }
.hero__title-line:nth-child(2) { animation-delay: 250ms; }
.hero__intro { animation-delay: 330ms; }
.hero__actions { animation-delay: 400ms; }

@media (prefers-reduced-motion: reduce) {
  .site-header,
  .availability,
  .hero__title-line,
  .hero__intro,
  .hero__actions {
    animation: none;
  }
}
```

- [ ] **Step 6: Run the motion contract test**

Run: `node --test tests/project-structure.test.mjs`

Expected: PASS `uses the approved calm motion contract`.

---

### Task 5: Unified Test Command And Final QA

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `docs/design-qa.md`
- Create: `docs/design-evidence/implementation/hero-identity-motion-desktop-1280x720.png`
- Create: `docs/design-evidence/implementation/hero-identity-motion-mobile-390x844.png`

**Interfaces:**

- Consumes: completed documentation, identity, font and motion tasks.
- Produces: one `npm test` command, current screenshots and a passing QA report.

- [ ] **Step 1: Add the unified test script**

Set these scripts in `package.json`:

```json
{
  "test": "node --test tests/*.test.mjs",
  "test:sites": "node --test tests/sites-worker.test.mjs"
}
```

- [ ] **Step 2: Run all automated checks**

Run:

```bash
npm test
npm run build
npm run test:sites
```

Expected: every Node test passes; Vite build completes; all four Sites tests pass.

- [ ] **Step 3: Verify desktop and mobile in the browser**

At 1280×720 and 390×844:

- move the pointer through the heading region and confirm the light flow remains visible without reducing heading readability;
- confirm JetBrains Mono is the computed font family;
- confirm the logo is visible beside «Геннадий Гужов»;
- confirm `/logo.svg` returns successfully and the browser tab uses it as favicon;
- open and close the mobile menu;
- check browser console for warnings and errors;
- save screenshots to the two paths listed above.

- [ ] **Step 4: Verify every responsive checkpoint**

At 375, 430, 768, 1024, 1280 and 1440 px assert:

```text
document.documentElement.scrollWidth === document.documentElement.clientWidth
heading.left >= 0
heading.right <= window.innerWidth
logo.width > 0
logo.height > 0
```

Expected: all assertions are true.

- [ ] **Step 5: Verify reduced motion**

With `prefers-reduced-motion: reduce` enabled:

- computed `animation-name` for `.hero__title-line` is `none`;
- `LiquidEther` receives `autoDemo={false}` through `useReducedMotion()`;
- all content is visible immediately.

- [ ] **Step 6: Update the QA report**

Append a new comparison pass to `docs/design-qa.md` containing:

```md
### Identity, typography and calm-motion pass

- JetBrains Mono is loaded locally and is the computed font for display, body and controls.
- `public/logo.svg` is visible in the brand link and loads as the SVG favicon.
- All user-facing identity copy uses «Геннадий Гужов».
- Liquid Ether uses the approved calm-motion parameters and remains readable during pointer interaction.
- The 375–1440 px responsive matrix passes without overflow or clipping.
- Reduced motion disables entrance and automatic flow.
- Browser console contains no warnings or errors.
```

Keep the final line exactly:

```text
final result: passed
```

- [ ] **Step 7: Final checkpoint**

Run:

```bash
find docs src public tests -maxdepth 4 -type f | sort
npm test
npm run build
```

Expected: the file tree matches the File Map; tests and build pass; no legacy `DESIGN.md`, `design-qa.md`, `.design-evidence/`, `src/styles.css`, `src/components/LiquidEther.jsx`, or `src/components/LiquidEther.css` remains.
