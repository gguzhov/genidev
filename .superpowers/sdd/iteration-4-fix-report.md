# Iteration 4 motion fix-wave — отчёт

Статус: **DONE**

## Проверка reviewer claim

- Проверены production JSX/CSS CardNav и все 10 исходных кадров `problems`/`projects` на ширинах `375`, `768`, `1024`, `1280`, `1440` из `docs/design-evidence/premium-iteration-3/`.
- На пяти `problems`-кадрах закрытый CardNav визуально цельный.
- На пяти `projects`-кадрах фиксированный nav захвачен фрагментарно: от отдельных top-descendant до отсутствия surface. При этом production JSX безусловно рендерит menu button, brand и CTA в одном `.card-nav__top`, а closed React/state-machine contract остаётся согласованным.
- Вывод: данные кадры показывают capture/compositor-артефакт fixed layer, а не отсутствие descendant в production DOM. Evidence не изменялись и не переснимались; стабильный recapture с DOM descendant checks выполняет root.

## Исправления

- Из fixed `.card-nav` удалён постоянный `will-change: height`. GSAP timeline, height animation, state machine, easing, длительности и reduced-motion path не менялись.
- ProfileCard теперь инвалидирует cached bounds на passive `scroll`. Listener создаётся только при `tiltEnabled`, удаляется в cleanup и поэтому не активен для coarse pointer или `prefers-reduced-motion`.
- Scroll handler не вызывает layout measurement: он только помечает bounds dirty. Следующий pointer update обновляет rect внутри уже coalesced `requestAnimationFrame`, после чего применяет tilt по актуальным координатам.
- Существующий resize cache, pointer-enter cache, RAF coalescing, cleanup pending frame и диапазон tilt сохранены.

## TDD

### CardNav

- RED: `node --test --test-name-pattern='CardNav height layer' tests/iteration-4-motion-fixes.test.mjs` — **0/1**, ожидаемое падение на `will-change: height`.
- GREEN: тот же тест — **1/1**; связанные motion/iteration suites после обеих групп — **25/25**.

### ProfileCard

- RED: `node --test --test-name-pattern='ProfileCard bounds' tests/iteration-4-motion-fixes.test.mjs` — **0/1**, ожидаемое отсутствие scroll invalidation.
- Первый GREEN обнаружил конфликт с ранее зафиксированным resize-cache contract; production implementation сохранён с `resize → cacheBounds` и дополнен `scroll → invalidateBounds`.
- Focused GREEN: новый suite — **2/2**, связанные suites — **25/25**.

## Финальная проверка

- `npm test` — **PASS, 109/109**.
- `npm run build` — **PASS**, Vite собрал 69 modules и Sites artifacts.
- `git diff --check` — **PASS**.
- Browser runtime после обязательной диагностики не обнаружил доступных browsers (`list=[]`), поэтому live descendant-settled check в этой сессии не выполнялся. Это не блокирует fix-wave: root выполняет финальный stable capture после коммита.
- Copy, facts, metrics, routes, cases, accessibility и motion/reduced-motion contracts не менялись.
- `.npmrc`, `tmp/`, plan/spec и evidence folders не изменялись.
