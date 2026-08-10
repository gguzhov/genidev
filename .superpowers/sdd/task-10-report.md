# Task 10 — понятный выбор бизнес-задачи

## Статус

DONE

## Результат

- `OptionWheel` удалён из композиции `ProblemSelector`; обработчики `wheel` отсутствуют.
- Один адаптивный rail показывает четыре пронумерованные бизнес-задачи: horizontal scroll-snap на mobile и вертикальный список с `768px`.
- Rail реализован как именованная группа native buttons: активная задача обозначена через `aria-pressed`, каждая кнопка управляет одной общей region, а region независимо названа собственным видимым H3. Поддерживаются ArrowLeft/Right/Up/Down, Home и End.
- Копия секции заменена на «От запуска продукта до AI-автоматизации» и «Разбираю задачу, считаю эффект и довожу решение до запуска».
- Панель явно показывает цепочку «Что делаю → Действия → Результат»; пункты действий в `siteContent.js` переформулированы как конкретные глагольные действия.
- Движение ограничено active indicator и opacity/translate панели. Длительность — `var(--motion-state)` (280ms); при `prefers-reduced-motion` анимация панели и переход индикатора отключаются.
- Новые зависимости, цвета и внешние сервисы не добавлялись.

## TDD

### RED

Команда:

`node --test tests/premium-landing-contract.test.mjs tests/problem-selector-state.test.mjs`

Результат: exit 1, 6 tests, 2 pass, 4 fail.

Ожидаемые причины:

- `ProblemSelector` всё ещё импортировал и монтировал `OptionWheel`;
- отсутствовали `tablist`/`tab`/`tabpanel`, roving tabindex и keyboard contract;
- оставались старая копия и прежняя структура панели;
- отсутствовали vertical desktop rail и 280ms panel state motion.

### GREEN

- Focused: `node --test tests/premium-landing-contract.test.mjs tests/problem-selector-state.test.mjs` — 6/6 PASS.
- Full regression: `npm test` — 76/76 PASS.
- Production: `npm run build` — PASS, 71 modules transformed; client JS 318.31 kB (gzip 104.99 kB), CSS 39.86 kB (gzip 10.75 kB).
- `git diff --check` — PASS.

## Responsive и browser self-review

Проверено в Codex in-app Browser на production preview при высоте viewport 900px.

| Ширина | Rail | Page overflow | Min button height | Связь rail/panel |
| --- | --- | ---: | ---: | --- |
| 375px | row, `x mandatory`, local overflow | 0px | 64px | одна колонка |
| 430px | row, `x mandatory`, local overflow | 0px | 64px | одна колонка |
| 768px | vertical | 0px | 128px | две неперекрывающиеся колонки |
| 1024px | vertical | 0px | 133px | две неперекрывающиеся колонки |
| 1280px | vertical | 0px | 136px | две неперекрывающиеся колонки |
| 1440px | vertical, max-width 1280px | 0px | 136px | две неперекрывающиеся колонки |

- Первичная DOM/AX snapshot и keyboard-проверка выполнены до review-fix; обнаруженная reviewer-ом tab-модель заменена итоговой button-group/region моделью ниже.
- Wheel: вертикальный wheel над desktop rail прокрутил страницу на 300px и не сменил выбранную задачу.
- Motion: обычный режим показывает `0.28s`; при эмуляции `prefers-reduced-motion: reduce` `animation-name: none`, opacity панели `1`, indicator transition сведён к системному минимуму reduced-motion.
- Mobile и desktop композиции визуально осмотрены: текст читаем, rail и panel не перекрываются, панель прокручивается вместе со страницей.
- Console errors/warnings: 0.

## Scope и concerns

- Hero, career, marketplace, project cases, `.npmrc`, `tmp/` и чужие untracked docs/evidence не изменялись.
- Физическое touch-устройство, экранная клавиатура, safe-area/notch и Safari не проверялись; mobile проверен viewport-эмуляцией in-app Chromium.
- Блокирующих замечаний нет.

## Review fix — ARIA-связь controls и dynamic content

### Причина

Первичная реализация использовала четыре `role="tab"`, каждый с `aria-controls` на один и тот же `tabpanel`, тогда как этот panel был назван только выбранным tab. Для единственной динамической content surface это нарушало ожидаемую ARIA-модель tabs.

Итоговая модель:

- rail: `role="group"`, `aria-label="Бизнес-задачи"`;
- controls: native `<button>` с `aria-pressed` и `aria-controls`;
- content surface: `role="region"`, `aria-live="polite"`;
- region имеет `aria-labelledby` на собственный стабильный видимый H3;
- `tablist`, `tab`, `tabpanel`, `aria-selected` и искусственный roving `tabIndex` удалены.

### RED

Команда:

`node --test tests/premium-landing-contract.test.mjs tests/problem-selector-state.test.mjs`

Результат: exit 1, 6 tests, 4 pass, 2 fail.

Ожидаемые падения:

- `problem selector uses a direct task rail and never mounts OptionWheel` — отсутствовал `role="group"`;
- `connects pressed task buttons to one independently labelled result region` — отсутствовали group/pressed/region semantics, сохранялись tab roles.

### GREEN и regression

- `node --test tests/premium-landing-contract.test.mjs tests/problem-selector-state.test.mjs` — 6/6 PASS, exit 0.
- `npm test` — 76/76 PASS, exit 0.
- `npm run build` — PASS, 71 modules transformed; client JS 318.26 kB (gzip 104.96 kB), CSS 39.86 kB (gzip 10.75 kB).
- `git diff --check` — PASS, exit 0.

### Post-fix browser check

Повторная browser-сессия после build недоступна: in-app Browser discovery вернул пустой список. Runtime AX snapshot не подменялся статическим предположением; итоговая модель покрыта focused structural contract, полным test run и production build. Визуальная композиция и CSS этим semantic-only fix не менялись.
