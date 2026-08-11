# Task 3 report — code-first motion, адаптив и финальная матрица

Статус: выполнено.

## Что изменено

- Добавлена изолированная граница состояния `createWorkSequenceObserver`: путь показывается сразу без IntersectionObserver или при reduced motion, иначе запускается один раз на пересечении `0.35`, после чего observer отключается. Cleanup игнорирует отложенные callback.
- Шестишаговый путь hero переведён на один нормализованный SVG-сигнал (`pathLength="1"`, `stroke-dasharray/offset: 1 → 0`) и один GSAP timeline с шагом узлов `70ms`. Циклов, WebGL и постоянной фоновой анимации нет.
- При смене бизнес-задачи действия доступны первыми, а четыре результата появляются за `280ms` с шагом `45ms`. Live-region продолжает объявлять только заголовок выбранной задачи.
- Проектная сетка остаётся равной: две одинаковые колонки от `768px`, единое медиа `3:2`, подъём карточки ограничен `2px`, движение заднего ледяного слоя доступно только fine pointer.
- Исправлены два замечания Task 2: селекторы метрик DriftWall обновлены с `span` на семантические `li`; декоративные ProjectCard не подключают pointer listeners к ProjectVisual.
- В `docs/design-system.md` закреплены Evidence-first Ice слои, six-stage lifecycle, четыре outcome-chip и reduced-motion contract.

H1 сохранён без изменений: «Разрабатываю цифровые и AI-продукты.» В hero не добавлены ФИО или дополнительный описательный абзац.

## TDD и автоматические проверки

- RED: `tests/evidence-first-motion.test.mjs` — 7/7 ожидаемых падений до реализации.
- GREEN focused: 29/29 (`evidence-first-motion`, `hero-interaction-state`, `problem-selector-state`, `project-case-state`).
- Full suite: 127/127.
- Production build: успешно.
- `git diff --check`: успешно.
- Evidence signatures: 30/30 файлов являются PNG, каждый имеет ожидаемую ширину и высоту `900px`.

Старые motion-contract тесты обновлены с устаревшей CSS-delay реализации на актуальные one-shot observer + GSAP + SVG контракты.

## Browser QA

Проверены ширины `375`, `430`, `768`, `1024`, `1280`, `1440px`:

- 30/30 кадров: соответствующий заголовок секции видим в viewport во время capture;
- 30/30 кадров: `document.documentElement.scrollWidth === window.innerWidth`;
- 30/30 кадров: навигация и её дочерние элементы имеют ненулевую геометрию;
- 30/30 кадров: нет failed images; оба проекта показывают по четыре результата;
- hero сохраняет единственный H1, без `.hero__description`; портрет имеет ненулевую геометрию;
- на `375` и `430px` путь остаётся вертикальным, лицо и CTA видны, карточки и результаты не создают overflow;
- desktop hero проверен отдельно: контент и портрет сбалансированы внутри `100svh`, случайной межсекционной пустоты нет.

Интеракции:

- CardNav: открытие, закрытие по Escape, возврат фокуса на кнопку;
- задачи: click, ArrowRight, корректный `aria-pressed`, четыре результата;
- оба полноэкранных кейса: открытие, Escape, Back, Forward и восстановление активного кейса;
- reduced motion: путь сразу `revealed/static`, узлы видимы, outcome animation отключена, проектные переходы статичны;
- console: 0 warnings/errors.

## Evidence

Каталог: `docs/design-evidence/evidence-first-ice-final/`.

Матрица: `6 ширин × 5 секций = 30 PNG`:

- `hero`
- `problems`
- `career`
- `projects`
- `contact`

Кадры сняты после загрузки шрифтов, точного позиционирования целевой секции, полной отрисовки фиксированной навигации и двух repaint waits. Для доказательства конечных статичных состояний capture выполнялся с `prefers-reduced-motion: reduce`; обычный motion отдельно проверен контрактами и интеракциями.

## Ограничения и защищённые файлы

- `.npmrc`, `tmp/` и старые untracked evidence-каталоги не изменялись и не включаются в commit.
- Новых зависимостей и цветов не добавлено.
- Blockers/remaining concerns: нет.
