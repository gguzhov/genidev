# Design QA

Дата финальной проверки: 2026-08-11.

## Среда

- Codex In-app Browser, production preview Vite 6.4.2: `http://127.0.0.1:4173/`.
- Viewport height: `900px`; ширины: `375`, `430`, `768`, `1024`, `1280`, `1440px`.
- Проверка выполнялась на production build. В конце viewport override сброшен, browser session закрыта.
- Один Impeccable mechanical detector запущен после завершения UI по всем изменённым JSX/CSS: результат `[]`, P0/P1 нет. Повторный detector не запускался.

## Итог

Финальная приёмка пяти секций пройдена на всех шести ширинах. На каждой ширине `scrollWidth === clientWidth`, видимы все заголовки и длинный контент, touch targets не меньше `44×44px`, карточки проектов сохраняют `3:2`, а результаты — `4/4/4`.

| Width | Колонки проектов | Page overflow | Touch targets | Результат |
| --- | ---: | --- | --- | --- |
| 375px | 1 | нет | ≥44px | PASS |
| 430px | 1 | нет | ≥44px | PASS |
| 768px | 2 | нет | ≥44px | PASS |
| 1024px | 3 | нет | ≥44px | PASS |
| 1280px | 3 | нет | ≥44px | PASS |
| 1440px | 3 | нет | ≥44px | PASS |

Погрешность вычисленного ratio медиа на всех ширинах — не более `0.00004` от `1.5`. На 375/430px hero, паспорт задачи, карьерная линия, три карточки и контакт остаются одноколоночными; rail задач имеет только локальный snap-scroll и не создаёт overflow страницы.

## Keyboard и route-backed dialogs

- Menu: открытие, плоский список из четырёх ссылок, `Escape`, закрытие и возврат фокуса в trigger — PASS.
- Problem selector: `ArrowDown` переводит pressed-state и фокус на следующую задачу — PASS.
- Все три кейса (`Остров Здоровья`, `IlonMask VPN`, `DATONIKS`) проверены на 375px: initial focus на close, close `44×44px`, внутренний вертикальный scroll, `scrollWidth === clientWidth`, `Escape` и возврат фокуса — PASS.
- Focus trap: `Shift+Tab` от close переносит фокус на последний доступный control внутри dialog — PASS.
- History: Back закрывает DATONIKS, Forward открывает тот же route-backed case повторно — PASS.
- DATONIKS PDF link: `/documents/datoniks-pitch-deck-public.pdf`, `_blank`, `noreferrer`; HTTP `200`, `application/pdf`, 17 страниц, `14 830 894` bytes — PASS.

## Reduced motion, console и network

- `prefers-reduced-motion: reduce`: hero animations и barcode scan имеют `animation-name: none`; WorkSequence статичен; career `5/5` в финальном состоянии.
- Три project cards: `opacity: 1`, `transform: none`, `clip-path: none`; reveal helper не добавляет ready/hidden-state.
- Browser console warnings/errors: `0`.
- После production reload: `15` successful responses, `0` `Network.loadingFailed`, `0` HTTP `4xx/5xx`; fonts `loaded`, `12` изображений загружены, broken/pending images `0` после lazy-load.

## Evidence и bounded pass

В [`docs/design-evidence/marketplace-datoniks-final`](./design-evidence/marketplace-datoniks-final/) сохранено ровно 30 актуальных PNG: пять секций × шесть ширин. Имена: `<width>-01-hero.png` … `<width>-05-contact.png`.

Один общий визуальный pass выполнен по шести составным лентам и ключевым исходным PNG. Перекрытий, обрезанного текста, случайных пустот и responsive-регрессий не найдено, поэтому отдельный fix pass не потребовался. Дополнительный цикл полировки не запускался.

Ограничение: физические iPhone/iPad, Safari, настоящий notch/safe-area и экранная клавиатура не проверялись; QA выполнен в in-app Chromium с viewport/media emulation.
