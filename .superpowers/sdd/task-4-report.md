# Task 4 — отчёт

## Результат

- Навигация переведена на плоский список «Задачи / Опыт / Проекты / Связаться» с круглой фотометкой без видимого ФИО и отдельным CTA «Связаться».
- Сохранён lifecycle меню: 280 ms timeline, inert на закрытии, focus trap, Escape и возврат фокуса. Legacy grouped input нормализуется для обратной совместимости.
- Карьерный блок получил утверждённые заголовок и вводный текст, а факты разделены на ответственность и подтверждения. Неподтверждённые сведения о поставщиках или таможне не добавлялись; DATONIKS явно остаётся в поиске инвестиционного партнёра.
- Финальный контакт стал split-card с новым человеческим текстом, автономным `contact`-контрактом и существующим реальным портретом. На mobile текст и CTA идут до фотографии.
- Для раскрытого desktop-меню сгенерирован один restrained ice-core; на ширинах ниже 768 px он скрыт, при reduced motion статичен.

## TDD

1. RED: `node --test tests/navigation-contact-career.test.mjs` — 0/4 PASS. Падения были вызваны grouped navigation, старой карьерной и контактной подачей и отсутствующим asset.
2. GREEN: тот же focused test — 4/4 PASS.
3. Второй RED→GREEN: удалён legacy `cta` prop у `FinalContact`; focused contract сначала упал, затем прошёл 20/20 вместе с `tests/project-structure.test.mjs`.
4. Visual RED→GREEN: browser QA обнаружил обрезанную четвёртую ссылку desktop-меню; добавлен regression assertion, desktop visual ограничен до 226 px, повторная геометрическая проверка подтвердила размещение всех четырёх ссылок внутри nav.

## Imagen

- Режим: built-in `imagegen` (`stylized-concept`), без CLI/API fallback.
- Итоговый файл: `public/images/ai-ice-core-v1.webp`, 720×720 px, 20 KB.
- Prompt: restrained abstract AI sensor/core from translucent ice and crystalline optical layers; pale cold neutral-blue studio field; compact non-humanoid geometric core; centered square composition; no text, letters, numbers, logos, brands, faces, eyes, people, humanoid shapes, robots, pseudo-interface or watermark.

## Проверки

- `npm test` — PASS, 154/154.
- `npm run build` — PASS, Vite production build и Sites packaging.
- `git diff --check` — PASS.
- Browser QA в реальном приложении:
  - 375, 430, 768, 1024, 1280 и 1440 px — page overflow отсутствует;
  - menu target 48×48 px, contact CTA 236×52 px;
  - 375/430 px — contact copy/CTA выше портрета, AI-core `display: none`;
  - 768 px — split contact, AI-core скрыт и не запрашивается;
  - 1024+ px — AI-core видим только внутри раскрываемой панели;
  - desktop menu — четыре плоские ссылки без group labels, asset загружен, все ссылки помещаются;
  - keyboard — Shift+Tab замыкает focus trap на последнюю ссылку, Escape закрывает меню и возвращает фокус триггеру;
  - reduced motion — media query активен, core без transform, карьерный progress сразу завершён, меню раскрывается в конечное состояние;
  - console warnings/errors — 0.

## Изменённые файлы

- `src/App.jsx` — flat navigation и отдельный navigation CTA.
- `src/components/CardNav/CardNav.jsx` — нормализация ссылок, фотометка и desktop AI visual.
- `src/components/CardNav/CardNav.css` — плоская геометрия меню, responsive/reduced-motion visual.
- `src/components/CareerTimeline/CareerTimeline.jsx` — утверждённая подача и semantic responsibility/proof.
- `src/components/CareerTimeline/CareerTimeline.css` — сканируемые utility labels и proof layout.
- `src/components/FinalContact/FinalContact.jsx` — автономный split contact с реальным портретом.
- `src/components/FinalContact/FinalContact.css` — mobile-first text-before-photo и desktop split.
- `src/content/siteContent.js` — утверждённый contact title/body/CTA.
- `public/images/ai-ice-core-v1.webp` — сгенерированный декоративный asset.
- `tests/navigation-contact-career.test.mjs` — Task 4 contract и visual regression.
- `tests/premium-landing-contract.test.mjs` — обновлён устаревший контактный контракт.
- `tests/project-structure.test.mjs` — обновлён автономный интерфейс `FinalContact`.

## Отклонения

- Указанные в brief legacy-файлы `tests/card-nav-contract.test.mjs`, `tests/contact-content.test.mjs` и `tests/career-timeline.test.mjs` отсутствуют в base `9286cc9`; вместо них использованы существующие эквивалентные contract/state/regression tests и полный suite.
- Защищённые untracked `.npmrc`, `tmp/` и старые evidence-папки не изменялись.

## Review revision — desktop-only AI core

- Исправлен breakpoint декоративного core: скрыт до 1024 px и появляется только в `@media (min-width: 1024px)`.
- Удалён unconditional `<img src>`: `CardNav` содержит только пустой `aria-hidden="true"` visual, а `background-image` объявлен внутри desktop media query. Поэтому браузер не запрашивает 20 KB asset на 375/768 px.
- TDD RED: обновлённый `tests/navigation-contact-career.test.mjs` упал на старом `<img src>` и breakpoint 768.
- TDD GREEN: focused contract — 4/4 PASS; covering CardNav regressions — 31/31 PASS; полный suite — 154/154 PASS.
- `npm run build` и `git diff --check` — PASS.
- Из-за очищенного in-app Browser runtime (`list=[]` после troubleshooting) по явной авторизации использован ограниченный локальный headless Chrome с временным чистым профилем, без пользовательской сессии.
- Fresh evidence проверены визуально:
  - `task-4-evidence/375-nav.png` — плоское меню без core;
  - `task-4-evidence/768-nav.png` — полноширинные ссылки без пустой visual-колонки и core;
  - `task-4-evidence/1024-nav.png` — сдержанный core видим справа, ссылки не обрезаны;
  - `task-4-evidence/375-contact.png`, `768-contact.png`, `1024-contact.png` — контактный текст, CTA и реальный портрет читаемы, без overflow.
- Runtime evidence: 375/768 — `display:none`, `background-image:none`, `requestedCore:false`; 1024 — `display:block`, CSS background URL и `requestedCore:true`. На всех трёх ширинах `aria-hidden="true"` и page overflow отсутствует.
- Визуальный review не выявил вредного эффекта generic-eye: объект остаётся абстрактным, спокойным и вторичным, поэтому регенерация не выполнялась.
