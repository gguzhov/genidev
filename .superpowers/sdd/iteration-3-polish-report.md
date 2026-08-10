# Iteration 3 final polish — отчёт

Статус: **DONE_WITH_CONCERNS**

## Результат

- Sticky CTA CardNav скрыт до `560px`. До `559px` header сохраняет компактную grid-композицию brand + menu; hero CTA остаётся доступным.
- Из непрозрачного CardNav удалены `backdrop-filter` и `-webkit-backdrop-filter`; surface, тень, motion и доступность меню сохранены.
- ProfileCard объявлен named inline-size container. Overlay переключается в две колонки только через `@container profile-card (min-width: 350px)`, а не по viewport; узкая tablet-карточка остаётся одноколоночной.
- Mobile anchors используют `scroll-margin-top: 120px`; с `768px` возвращается существующее desktop-значение `104px`.
- Реальный Ostrov screenshot сохранён без raster editing. В metadata добавлен `coverCrop: "browser-chrome"`; ProjectCard переводит его в semantic class, CSS увеличивает только изображение до `116%`, выравнивает вниз и визуально убирает browser chrome. IlonMask cover не изменялся.
- При непосредственном соседстве `.marketplace + .final-contact` верхний padding contact обнулён. Единственный вертикальный gap формирует нижний padding marketplace: `72px` mobile, `96px` tablet, `120px` desktop.
- Copy, facts, metrics, routes, cases, accessibility и motion/reduced-motion contracts не менялись.

## TDD

### RED

`node --test tests/iteration-3-polish.test.mjs`

- **0 passed, 6 failed**.
- Все падения ожидаемые: CardNav breakpoints, ProfileCard viewport media, backdrop filters, mobile anchor offset, отсутствие semantic Ostrov crop, duplicated marketplace/contact gap.

### Focused GREEN

- CardNav/ProfileCard/anchors: `4/4 PASS`; related suites `31/31 PASS`.
- Ostrov crop/contact gap: `2/2 PASS`; related content/marketplace/Iteration-2 suites `29/29 PASS`.

## Финальная автоматическая проверка

- `npm test` — **PASS, 107/107**.
- `npm run build` — **PASS**, Vite собрал 69 modules и Sites artifacts.
- `git diff --check` — **PASS**.
- Новых dependencies, цветов и внешних сервисов нет.
- `.npmrc`, `tmp/`, plan/spec и существующие evidence folders не изменялись.

## Browser QA concern

- После production build in-app Browser runtime не обнаружил доступных browsers (`list=[]`). Выполнена предусмотренная Browser skill диагностика; переход на сторонний automation backend намеренно не выполнялся.
- Поэтому локальный шестиширинный runtime QA, computed container-query state, keyboard/focus и визуальная проверка crop/gap в этой сессии не заявляются.
- Root отдельно снимает финальную 30-file evidence matrix и должен включить туда эти runtime-проверки. Code-level contracts, full regression и production build проходят полностью.
