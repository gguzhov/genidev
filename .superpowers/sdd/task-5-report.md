# Task 5 — общая motion-система, docs и полный QA

## RED

- Создан `tests/marketplace-final-regression.test.mjs` с контрактами JetBrains Mono, отсутствия глобального `0.01ms` kill switch и infinite animation, token-driven motion, progressive one-shot marketplace reveal, stale copy и безопасного DATONIKS PDF/build.
- Первый запуск: `1 PASS / 6 FAIL`. Ожидаемые причины: stale `Inter`, глобальный reduced-motion reset, отсутствующие reveal lifecycle/CSS и финальные privacy/motion-контракты.
- Отдельный lifecycle RED воспроизвёл runtime-переход в reduced motion: ожидаемое финальное состояние не фиксировалось до добавления media-query listener.

## GREEN

- Удалён stale `Inter`; корневой font declaration использует `--font-primary`.
- Удалён глобальный `0.01ms !important` reduced-motion kill switch. Motion-компоненты сохраняют локальные финальные состояния.
- Реализован `createMarketplaceRevealLifecycle`: enhancement включается только при доступном observer и разрешённом motion, отключает observer после первого reveal и игнорирует late callbacks после cleanup.
- Runtime-переход в reduced motion завершает pending reveal навсегда, снимает observer и не переигрывается при возврате настройки.
- Карточки видимы по умолчанию; при enhancement проявляются один раз за `--motion-reveal` с `--motion-ease` и шагом `70ms`. Reduced/no-observer сразу остаются в финальном видимом состоянии.
- Сохранён один смысловой signal — bounded barcode scan; infinite loops не добавлены.
- Удалены eyebrow из изменённых career/contact headings, tracking ограничен `-0.04em`.
- Темизированы browser surfaces: selection, scrollbar, caret/accent-controls.

## Impeccable

- `context.mjs` запущен один раз до работы.
- Mechanical detector запущен ровно один раз после UI по восьми изменённым JSX/CSS targets.
- Результат: `[]`; P0/P1 и intentional exceptions отсутствуют.
- Выполнен один bounded visual pass. Дефектов для fix pass не найдено; второй цикл полировки не запускался.

## Browser QA

- Использован Codex In-app Browser с production preview.
- Проверены 375/430/768/1024/1280/1440px и все пять секций.
- Везде: page overflow отсутствует, targets ≥44px, project media `3:2`, results `4/4/4`; сетка проектов `1/1/2/3/3/3`.
- PASS: menu/Escape/focus return, problem keyboard navigation, все три dialogs, focus trap, DATONIKS PDF, Back/Forward, reduced motion, console/network/assets.
- Сохранено ровно 30 PNG в `docs/design-evidence/marketplace-datoniks-final/`.

## Проверки

- Targeted regression: `8/8 PASS`.
- Full tests перед browser QA: `161/161 PASS`.
- Финальный production build: PASS, main JS `337.07 kB` (`111.33 kB` gzip), без chunk warning.
- Финальный единый прогон `npm test && npm run build && git diff --check`: `162/162 PASS`, production build PASS, diff check empty.

## Защищённые файлы

Пользовательские untracked `.npmrc`, `tmp/` и старые evidence-папки не изменялись.
