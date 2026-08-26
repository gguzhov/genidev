# X-ray Project Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Выпустить единую серию тёмно-синих рентгеновских обложек, унифицировать CTA карточек и заменить ручную карьерную анимацию на один Motion progress.

**Architecture:** Контент продолжает хранить versioned URL обложек, а `ProjectVisual` накладывает существующие официальные логотипы поверх изображений. `CareerTimeline` использует `useScroll` + `useSpring`; геометрия SVG-пути переводит progress в координаты и угол самолёта, а `motion.path` отображает заполнение линии.

**Tech Stack:** React 19, Motion React, CSS, Node test runner, Vite, built-in ImageGen, WebP.

## Global Constraints

- Обложки: 1536 × 1024 px, 3:2, WebP, глубокий синий базовый фон.
- Акцентный цвет: не более 5–8% изображения.
- Логотипы остаются отдельными официальными ассетами.
- Mobile First; обязательная проверка 375, 430, 768, 1024, 1280 и 1440 px.
- `prefers-reduced-motion` показывает завершённый маршрут без движения.
- Не публиковать предыдущую светлую v3-серию.

---

### Task 1: Зафиксировать регрессии тестами

**Files:**
- Create: `tests/project-covers-career-motion.test.mjs`
- Modify: `tests/latest-user-fixes.test.mjs`
- Modify: `tests/capability-career-2026-refresh.test.mjs`
- Modify: `tests/portfolio-name-hero.test.mjs`

**Interfaces:**
- Consumes: `projects[].cardCover`, CSS-классы `.project-card__body` и `.project-card__open`.
- Produces: проверяемый контракт v4-обложек и единого Motion progress.

- [ ] **Step 1: Написать тесты новых URL, 3:2-метаданных, CTA и Motion API**
- [ ] **Step 2: Запустить `node --test tests/project-covers-career-motion.test.mjs` и получить ожидаемый FAIL**
- [ ] **Step 3: После реализации обновить устаревшие проверки v2 и ручного RAF**
- [ ] **Step 4: Запустить сфокусированный набор и получить PASS**

### Task 2: Сгенерировать и подключить рентгеновскую серию

**Files:**
- Create: `public/projects/covers/ostrov-xray-dna-v4.webp`
- Create: `public/projects/covers/ilonmask-xray-orbit-v4.webp`
- Create: `public/projects/covers/datoniks-xray-compute-v4.webp`
- Create: `public/projects/covers/wedding-xray-flora-v4.webp`
- Modify: `src/content/siteContent.js`

**Interfaces:**
- Consumes: утверждённый арт-дирекшн и существующие logo paths.
- Produces: четыре оптимизированных 1536 × 1024 WebP URL.

- [ ] **Step 1: Сгенерировать четыре отдельных изображения с общей камерой, материалами и глубоким синим фоном**
- [ ] **Step 2: Визуально проверить отсутствие текста, псевдологотипов и светлого stock-фона**
- [ ] **Step 3: Конвертировать выбранные PNG через `cwebp -q 88` в versioned v4-файлы**
- [ ] **Step 4: Обновить `cardCover` четырёх проектов на v4 URL**

### Task 3: Унифицировать карточки

**Files:**
- Modify: `src/components/ProjectMarketplace/ProjectMarketplace.css`

**Interfaces:**
- Consumes: существующую разметку `ProjectCard.jsx`.
- Produces: одинаковое положение и размер кнопок при разной длине описаний.

- [ ] **Step 1: Задать `grid-template-rows: auto auto 1fr auto` для body**
- [ ] **Step 2: Растянуть `.project-card__open` на 100%, установить `min-height: 52px` и центрирование**
- [ ] **Step 3: Проверить focus-visible, hover и touch target**

### Task 4: Перевести карьерный маршрут на Motion

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/components/CareerTimeline/CareerTimeline.jsx`
- Modify: `src/components/CareerTimeline/CareerTimeline.css`

**Interfaces:**
- Consumes: `items`, `getReachedCareerIndexesByProgress`, SVG `ROAD_PATH`.
- Produces: `activeProgress`, управляющий `motion.path`, `planeX`, `planeY`, `planeAngle` и контрольными точками.

- [ ] **Step 1: Добавить пакет `motion`**
- [ ] **Step 2: Создать `useScroll({ target, offset })` и сгладить его `useSpring`**
- [ ] **Step 3: Рассчитать координаты и касательную через `getPointAtLength`**
- [ ] **Step 4: Привязать `motion.path` и `motion.span` к одному `activeProgress`**
- [ ] **Step 5: Сохранить завершённый reduced-motion fallback и ResizeObserver cleanup**

### Task 5: Проверить и выпустить

**Files:**
- Modify only when a confirmed defect requires it.

**Interfaces:**
- Consumes: готовый UI.
- Produces: зелёные тесты, production build, визуально проверенный deploy.

- [ ] **Step 1: Запустить `npm test` и исправить только реальные регрессии**
- [ ] **Step 2: Запустить `npm run build`**
- [ ] **Step 3: Запустить Impeccable detector один раз по изменённым UI-файлам**
- [ ] **Step 4: Проверить 375, 430, 768, 1024, 1280 и 1440 px одним визуальным раундом**
- [ ] **Step 5: Выполнить один пакет исправлений и один контрольный раунд при необходимости**
- [ ] **Step 6: Закоммитить релевантные файлы Conventional Commit и отправить `main`**
- [ ] **Step 7: Дождаться успешного GitHub Actions deploy и проверить `https://genidev.ru/`**
