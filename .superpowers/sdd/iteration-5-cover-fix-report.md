# Final Important cover fix — отчёт

Статус: **DONE**

## Результат

- Фактические размеры локальных assets подтверждены напрямую: Ostrov `1341×768`, IlonMask `1200×630`.
- В shared project content добавлены truthful `coverWidth` и `coverHeight` для обоих проектов.
- `ProjectCard` и `ProjectCase` используют эти metadata как intrinsic `width`/`height`; для проектов без metadata сохранён прежний fallback `1536×1024`.
- Fullscreen `ProjectCase` получает динамический `aspect-ratio` из metadata и показывает cover через `object-fit: contain`, поэтому IlonMask logo/navigation и полная ширина исходника больше не обрезаются.
- Базовый `aspect-ratio: 3 / 2`, image-error state и fallback title сохранены. Ошибка загрузки cover по-прежнему переключает surface в `has-image-fallback`.
- Marketplace сохраняет намеренный карточный crop, включая отдельный Ostrov browser-chrome crop; изменены только truthful intrinsic attributes.
- Copy, facts, metrics, routes, cases, accessibility и motion contracts не менялись.

## TDD

### RED

`node --test tests/iteration-5-cover-dimensions.test.mjs`

- **0 passed, 3 failed**.
- Ожидаемые причины: metadata отсутствуют, оба потребителя hardcode-ят `1536×1024`, ProjectCase использует статический `3:2` и `object-fit: cover`.

### Focused GREEN

- Новый regression suite — **3/3 PASS**.
- Связанные content/routing/marketplace/case/previous-iteration suites — **39/39 PASS**.

## Финальная проверка

- `npm test` — **PASS, 112/112**.
- `npm run build` — **PASS**, Vite собрал 69 modules и Sites artifacts.
- `git diff --check` — **PASS**.
- Новых dependencies и внешних assets нет.
- `.npmrc`, `tmp/`, plan/spec и evidence folders не изменялись.
