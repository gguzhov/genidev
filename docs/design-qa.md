# Design QA

Дата финальной проверки: 2026-08-10.

## Среда

- Browser: Google Chrome 151.0.7922.108, headless/CDP, device scale factor 1.
- Backend: Vite 6.4.2 production preview, `npm run preview -- --host 0.0.0.0`.
- Viewport height: 900 CSS px; проверенные ширины: 375, 430, 768, 1024, 1280 и 1440 CSS px.
- Финальный headless capture выполнен с `--use-angle=swiftshader-webgl --enable-unsafe-swiftshader`, поскольку нативный headless GPU path писал служебные SharedImage diagnostics.
- До и после browser QA выполнены `npm test` и `npm run build`.
- Финальные lifecycle-проверки воспроизводятся командой `node scripts/verify-final-fixes-cdp.mjs http://127.0.0.1:9227 http://127.0.0.1:4173` против production preview.

## Итог

Финальная responsive-приёмка пройдена. На всех шести ширинах `scrollWidth === clientWidth`, menu/hash navigation, Telegram CTA contract, смена задачи, открытие/закрытие project case и внутренний scroll диалога работают. JavaScript exceptions, failed requests и HTTP 4xx/5xx в прогоне отсутствовали.

## Проверка по viewport

| Width | Результат | Проверенный сценарий |
| --- | --- | --- |
| 375 px | PASS | Hero copy перед ProfileCard; menu 48×48 px; CTA 343×52 px; scroll-snap problem tabs; одноколоночная timeline; static project grid; dialog close 44×44 px, внутренний scroll без overflow; `Esc`, focus return, Back/Forward; Telegram click перехвачен перед внешней навигацией. |
| 430 px | PASS | Длинный hero и final CTA не обрезаются; mobile spacing и ProfileCard корректны; menu/CTA, problem change и project dialog прошли; dialog не имеет горизонтального overflow. |
| 768 px | PASS | Раскрытое меню достигает 193 px и остаётся читаемым; OptionWheel меняет описание; timeline остаётся чистой одноколоночной композицией; static project grid и dialog reflow без overflow. |
| 1024 px | PASS | Desktop OptionWheel, центральная чередующаяся timeline и компактный DriftWall видимы без cropping; semantic project controls стабильны; dialog scroll/reflow без overflow. |
| 1280 px | PASS | Двухколоночный hero сбалансирован; центральная timeline выровнена; DriftWall заполняет витрину без случайных краёв; Back/Forward синхронизируют route-backed case. |
| 1440 px | PASS | Max-width удерживает длину строк и композицию; hero, timeline, DriftWall и final CTA визуально связаны и не растягиваются сверх меры. |

На каждой ширине меню было реально открыто и закрыто через hash-ссылку, выбран второй problem, проверен `https://t.me/gguzhov` с `_blank`/`noreferrer` без перехода за пределы сайта, открыт case «Остров Здоровья» и закрыт через `Esc` с возвратом фокуса. Back/Forward дополнительно проверены на 375 и 1280 px.

## Структура и доступность

- PASS: один `<main>`, один landing `<h1>`, последовательные section `<h2>` и ids `problems`, `career`, `projects`, `contact`.
- PASS: CardNav содержит ссылки на все четыре ids, закрывается перед hash navigation; sections имеют `scroll-margin-top: 104px`.
- PASS: keyboard path — menu trigger → `Enter` → panel → `Esc`; focus возвращается в trigger.
- PASS: OptionWheel реагирует на `ArrowDown` и меняет связанное описание.
- PASS: project dialog получает начальный focus на close button, `Shift+Tab` замыкает focus trap, `Esc` закрывает, focus возвращается в project card.
- PASS: `focus-visible` в Chrome — solid outline 3 px.
- PASS: dialog имеет `aria-labelledby`, body scroll блокируется, case surface прокручивается внутри; изображения кейсов имеют содержательные `alt`.
- PASS: декоративные DriftWall tiles имеют `aria-hidden`, `pointer-events: none`, default cursor и не получают hover/active transform; в accessibility tree остаются только две semantic project buttons.

## Reduced motion

При эмуляции `prefers-reduced-motion: reduce` на 1024 px:

- LiquidEther canvas не создаётся, autoplay отсутствует;
- ProfileCard остаётся с нейтральным transform до и после pointer event;
- все career events видимы без reveal-анимации;
- DriftWall заменяется static project grid;
- hero entrance отключён, информация остаётся доступной на статичном фоне из токенов проекта.

Runtime-переключение preference также проверено через CDP: при `no-preference` в hero находится ровно один canvas, при переходе в `reduce` компонент размонтируется, canvas удаляется из DOM, а при возврате в `no-preference` создаётся ровно один новый canvas. Один и тот же canvas node сохраняется при открытии кейса, переключении между двумя кейсами и закрытии popup — обычные rerender страницы не пересоздают WebGL-контекст.

## Без JavaScript

- PASS: production `index.html` содержит семантический `<noscript>`, сгенерированный Vite-плагином напрямую из `src/content/siteContent.js`.
- PASS: при отключённом JavaScript видимы идентичность и hero CTA, все 4 бизнес-задачи, все 5 событий карьерного пути, обе карточки проектов со всеми ключевыми метриками и Telegram-контакт.
- PASS: Telegram-ссылки сохраняют `href="https://t.me/gguzhov"`, `target="_blank"` и `rel="noreferrer"`; React root остаётся пустым, fallback имеет ненулевую высоту и не скрыт стилями.
- PASS: renderer экранирует текст и значения внешних HTML-атрибутов; production build дополнительно проверен прямым чтением `dist/client/index.html`.

## Routes и assets

- `/`, `/projects/ostrov-zdoroviya`, `/projects/ilonmask-vpn` — HTTP 200; обе прямые project routes рендерят правильный dialog title.
- `/images/gennady-profile.webp`, `/projects/ostrov-cover.webp`, `/projects/ilonmask-cover.webp` — HTTP 200 с `image/webp`.
- Browser QA: 0 JavaScript errors/exceptions, 0 failed requests, 0 HTTP errors. SwiftShader вывел четыре одинаковых GL Driver performance warnings о `ReadPixels` во время full-page screenshot capture; это headless capture diagnostic, не ошибка приложения.

## Evidence

Все снимки — full-page PNG при DPR 1. Перед capture страница последовательно прокручена до каждого career event, чтобы evidence отражал реальное post-IntersectionObserver состояние.

- `docs/design-evidence/implementation/landing-375.png` — 375×5432 px.
- `docs/design-evidence/implementation/landing-430.png` — 430×5539 px.
- `docs/design-evidence/implementation/landing-768.png` — 768×5130 px.
- `docs/design-evidence/implementation/landing-1024.png` — 1024×5210 px.
- `docs/design-evidence/implementation/landing-1280.png` — 1280×5536 px.
- `docs/design-evidence/implementation/landing-1440.png` — 1440×5545 px.

## Исправленные регрессии

- Добавлен финальный contact CTA из `siteContent`, включая читаемый `@gguzhov` и точный Telegram contract.
- CardNav дополнен ссылкой `#contact`; все section targets получили корректный floating-header offset.
- У декоративных `.project-card--wall` отключены pointer events, pointer cursor, hover zoom/elevation и active scale; parallax контейнера и отдельные semantic controls сохранены.

## Ограничения и follow-up

- Проверка выполнена в desktop headless Chrome с эмуляцией viewport/touch/media. Физический iPhone/iPad, настоящий notch/safe-area, экранная клавиатура и Safari не проверялись; соответствующие CSS `env(safe-area-inset-*)` присутствуют, но физическая safe-area не заявляется как протестированная.
- Vite продолжает выводить известное non-blocking предупреждение о главном чанке 855.26 kB (gzip 240.70 kB). Безопасный split потребовал бы менять загрузку Three/LiquidEther над первым экраном; это оставлено performance follow-up, чтобы не ухудшать hero UX в финальном polish.

final result: passed
