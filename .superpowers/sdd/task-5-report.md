# Task 5 — карьерная линия

## RED

- Добавлен контракт существования `CareerTimeline` и его подключения в `App`.
- Добавлены focused production-logic tests для fallback без `IntersectionObserver`, `prefers-reduced-motion` и cleanup наблюдателя.
- До реализации `npm test` завершался с четырьмя ожидаемыми ошибками: отсутствовали компонент и модуль состояния.
- Отдельный RED для observer cleanup: `observeCareerItems is not a function`.

## GREEN

- Реализован семантический `<ol>` с пятью карьерными событиями из `career`.
- До запуска JS контент остаётся видимым; reveal включается только после mount при доступном `IntersectionObserver` и без reduced motion.
- При reduced motion или отсутствии observer все события сразу доступны. Наблюдатель использует `threshold: 0.2`, снимает наблюдение с показанного события и отключается в cleanup.
- На mobile линия находится слева, все события — справа; с 1024 px линия становится центральной, события чередуются. Карточная поверхность намеренно не используется.

## Проверки

- `node --test tests/career-timeline-state.test.mjs` — 4/4 PASS.
- `npm test` — 33/33 PASS.
- `npm run build` — PASS.
- Проверено в браузере на 375, 430, 768, 1024, 1280 и 1440 px: 5 элементов, `OL`, все элементы читаемы, горизонтального overflow нет; на desktop маркер совпадает с центральной осью.

## Файлы

- `src/components/CareerTimeline/CareerTimeline.jsx`
- `src/components/CareerTimeline/CareerTimeline.css`
- `src/components/CareerTimeline/careerTimelineState.js`
- `src/App.jsx`
- `tests/career-timeline-state.test.mjs`
- `tests/project-structure.test.mjs`

## Self-review / concerns

- Контент не скрывается через `display: none` или `visibility: hidden`; reduced motion также снимает transition/transform.
- Используются существующие цветовые токены; зависимостей не добавлено.
- `vite build` сообщает существующее предупреждение о chunk размером свыше 500 kB (822.86 kB); задача карьерной линии не меняет стратегию разделения кода.
