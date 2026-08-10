# Iteration 2 fix wave — отчёт

Статус: **DONE**

## Результат

- На ширинах ниже `768px` hero идёт в порядке H1 → promise → description → CTA → ProfileCard → WorkSequence. С `768px` текст/CTA и последовательность остаются слева, портрет — справа.
- ProfileCard теперь размещает avatar и info/CTA в одной grid-area. Overlay видим, фокус CTA не прокручивает карточку, `scrollHeight === clientHeight` на всех шести контрольных ширинах.
- Tilt кэширует bounds на pointer enter и resize, хранит последние координаты и выполняет не более одного ожидающего RAF. Ограничение `±1.5deg`, reduced-motion и coarse-pointer guards сохранены.
- Внесены четыре точные формулировки brief: AI problem, launch result, IlonMask duration и marketplace intro. Hero, CTA, метрики, факты и route-backed cases не менялись.
- CardNav использует непрозрачный `--color-surface-raised`. При закрытии content сразу становится `aria-hidden`/`inert`, но остаётся видимым и затухает вместе с surface; полная timeline ограничена `280ms`.
- ProblemSelector лишён panel shadow; desktop rows имеют `70px`, gap уменьшен, действия представлены компактной двухколоночной сеткой с hairline-разделителями. Meaningful labels — не меньше `12px`.
- Большая region ProblemSelector больше не `aria-live`/`aria-atomic`. Отдельный visually-hidden `role="status"` объявляет только title выбранной задачи.
- Desktop CareerTimeline использует `margin-left: 48px`, year column `136px`. Reached state всегда строится как `0..furthestReached`.
- Project labels имеют минимум `12px`, metrics — `12.8px`.
- WorkSequence остаётся вертикальным на tablet и становится пятиколоночным с `1024px`: это устранило обнаруженное browser QA перекрытие labels на `768px`.

## Реальные project covers

- «Остров Здоровья»: подключён существующий реальный production screenshot `public/projects/ostrov/ostrov-home-comet.webp` (`1341×768`). Файл не редактировался.
- IlonMask: исходник `/Users/gguzhov/Documents/AI/Projects/Ilonmaskvpn/frontend/public/images/og-cover.png` (`1200×630`) скопирован без изменений в `public/projects/ilonmask-product-cover.png`.
- SHA-256 источника и копии IlonMask одинаков: `e00e90c78a82f7152b969e0f465cca8a00ef4310fe3b96cd0e21313826d8e5ef`.
- IlonMask media использует исходное `aspect-ratio: 1200 / 630`, поэтому реальный экран не обрезает product identity. Imagegen, raster editing и локальный запуск IlonMask не использовались.

## TDD

### Основной RED

`node --test tests/iteration-2-fixes.test.mjs`

- **0 passed, 11 failed**.
- Все падения были ожидаемыми: mobile order, ProfileCard stack, bounds/RAF, exact copy, live region, selector density, contiguous career state/geometry, CardNav closing/background, covers/fonts.

### Focused GREEN по группам

- Hero/Profile/tilt: `3/3 PASS`.
- ProblemSelector/CareerTimeline/CardNav: новый focused contract `6/6 PASS`; вместе с существующими focused state suites `16/16 PASS`.
- Copy/covers/fonts: новый focused contract `2/2 PASS`; вместе с content/marketplace regression `18/18 PASS`.

### Browser QA fixes через отдельный RED → GREEN

- Tablet WorkSequence: `1/1 FAIL` на старом `768px` horizontal breakpoint → breakpoint `1024px` → `1/1 PASS`; related hero contracts `12/12 PASS`.
- CardNav total collapse: `1/1 FAIL` при timeline со stagger до ~460ms → совместный start и bounded card fade → `1/1 PASS`; related contracts `15/15 PASS`. Runtime: content visible + inert сразу после Escape, hidden и nav height `64px` через `300ms`.
- IlonMask crop: `1/1 FAIL` на старом `4/3` desktop media → натуральное `1200/630` → `1/1 PASS`.

## Финальная верификация

- `npm test` — **PASS, 101/101**.
- `npm run build` — **PASS**, Vite собрал 69 modules и Sites artifacts.
- `git diff --check` — **PASS**.
- Browser console — **0 errors, 0 warnings**.

## Browser QA

Production preview проверен на `375×844`, `430×932`, `768×1024`, `1024×768`, `1280×900`, `1440×900`.

- Page overflow: `0px` на всех ширинах.
- ProfileCard `scrollHeight === clientHeight` на всех ширинах.
- На `375px` portrait начинается на `y=569` и виден на `275px` первого viewport; на `430px` — `384px`.
- DOM order hero: `copy → profile → sequence`; на desktop grid areas сохраняют profile справа.
- Selector row: `64px` mobile, `70px` с `768px`; large panel не live; status содержит только «Запустить новый продукт».
- Career desktop: `48px` margin, `136px` year column.
- Normal-motion reverse scroll: reached `[0,1,2] → [0,1,2,3,4] → [0,1,2,3,4]`, состояние непрерывно.
- Wheel над desktop selector: page `scrollY 896 → 1393`, выбранная задача не изменилась.
- Profile CTA получил keyboard focus с видимым outline; `profile.scrollTop === 0`.
- Reduced motion: media query active, sequence static (`animation-name: none`, opacity `1`), layout без overflow.
- Реальные covers загрузились с natural sizes `1341×768` и `1200×630`; category `12px`, metrics `12.8px`, ProblemSelector meaningful labels `12px`.

## Scope и concerns

- `.npmrc`, `tmp/`, plan/spec и существующие evidence не изменялись и не добавлялись в commit.
- Новых dependencies, цветов и внешних сервисов нет.
- Проверка выполнена в Chromium viewport emulation; физические touch-устройства, Safari и реальная safe-area/notch не проверялись. Это не блокирует bounded browser QA, но остаётся средовым ограничением.
