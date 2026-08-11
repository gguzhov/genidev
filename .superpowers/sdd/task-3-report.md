# Task 3 — Паспорта бизнес-задач

## Результат

- Добавлены четыре паспорта с утверждёнными кодами и названиями, конкретными ситуациями «Когда…», четырьмя действиями и четырьмя результатами.
- Заголовок секции заменён на точный `В чем могу быть полезен?`; добавлены подписи `Что беру на себя` и `На выходе`.
- Добавлен декоративный CSS-штрихкод с видимым текстовым кодом и одним scan-сигналом длительностью `280ms` только при смене выбранного `id`.
- Сохранены Arrow/Home/End-навигация, вертикальный скролл страницы и краткий live-region с одним названием выбранной задачи.
- Существенный текст паспортов поднят до `14px`; reduced-motion отключает scan и остальные переходы.

## TDD

- RED: `node --test tests/problem-passports.test.mjs` — 5 ожидаемых падений из-за отсутствующих `code`, `situation`, заголовка, barcode/scan и размера текста.
- GREEN: `node --test tests/problem-passports.test.mjs tests/problem-selector-state.test.mjs tests/evidence-first-motion.test.mjs` — 17/17.

## Проверки

- `npm test` — 150/150.
- `npm run build` — production build собран.
- `git diff --check` — без ошибок.
- Browser QA: 375, 430, 768, 1024, 1280 и 1440 px — page overflow отсутствует, секция и панель внутри viewport, локальный snap-rail сохранён, touch targets не меньше 44px, минимальный существенный текст 14px, действия/результаты 4/4.
- Keyboard: ArrowRight, ArrowDown, Home и End меняют выбор и переводят фокус на выбранную кнопку; страница сохраняет вертикальный скролл; live-region содержит только название выбранной задачи.
- Reduced motion: scan, panel transition и outcome animations статичны.

## Ограничения

- Защищённые untracked-файлы и каталоги (`.npmrc`, `docs/design-evidence/...`, `tmp/`) не изменялись и не добавлялись в commit.
