# Design QA

Дата финальной проверки: 2026-08-11.

## Среда

- Функциональная приёмка выполнена в Codex In-app Browser на production preview Vite 6.4.2: `http://127.0.0.1:4173/`.
- Перед повторной съёмкой evidence выполнена обязательная диагностика In-app Browser; список доступных browser sessions оказался пустым. Для повторной съёмки использован fallback: чистый временный профиль headless Chrome и прямой CDP.
- CDP viewport: `900px` по высоте; ширины: `375`, `430`, `768`, `1024`, `1280`, `1440px`; `deviceScaleFactor: 1`.
- Каждый из 30 кадров начинался с новой навигации. Скриншот снимался по полным DOM-границам конкретной секции, а fixed navigation скрывалась на non-hero кадрах, чтобы не появлялось stitching.
- Проверка и повторная съёмка выполнялись на production build. Временные browser sessions и профиль закрыты после проверки.
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

## Приватность DATONIKS PDF

- Публичная страница 17 и исходный слайд 18 отдельно отрендерены в PNG через Poppler при `180dpi` и визуально проверены. `tesseract` в среде недоступен, поэтому OCR не заявляется.
- На публичной странице 17 отсутствуют запрещённые телефон, email и юридический адрес. На исходном слайде 18 визуально присутствуют все три вида приватных данных.
- Временные single-page PDF/PNG хранились только в `/tmp` и удалены после проверки; рендер исходного слайда 18 не добавлялся в репозиторий.
- [`datoniks-pitch-deck-public.manifest.json`](../public/documents/datoniks-pitch-deck-public.manifest.json) фиксирует SHA-256, fingerprints публичных страниц и durable fingerprint исключённого исходного слайда 18. Regression подтверждает: публичные страницы строго совпадают с исходными страницами 1–17, публичный файл содержит 17 страниц, fingerprint исходного слайда 18 отсутствует в публичном PDF. При недоступном source тест не делает тихий ранний выход: сохраняется проверка durable fingerprint с явной diagnostic-записью.

## Reduced motion, console и network

- `prefers-reduced-motion: reduce`: hero animations и barcode scan имеют `animation-name: none`; WorkSequence статичен; career `5/5` в финальном состоянии.
- Три project cards: `opacity: 1`, `transform: none`, `clip-path: none`; reveal helper не добавляет ready/hidden-state.
- Browser console warnings/errors: `0`.
- После production reload: `15` successful responses, `0` `Network.loadingFailed`, `0` HTTP `4xx/5xx`; fonts `loaded`, `12` изображений загружены, broken/pending images `0` после lazy-load.

## Evidence и bounded pass

В [`docs/design-evidence/marketplace-datoniks-final`](./design-evidence/marketplace-datoniks-final/) сохранено ровно 30 актуальных PNG: пять секций × шесть ширин. Имена: `<width>-01-hero.png` … `<width>-05-contact.png`.

Автоматический manifest [`marketplace-datoniks-final-manifest.json`](./design-evidence/marketplace-datoniks-final-manifest.json) сверяет точное имя, DOM-заголовок, DPR, ожидаемую ширину и полную DOM-высоту каждого PNG. Дополнительный readiness-контракт для каждой ширины фиксирует `6/6` финальных узлов WorkSequence, `4/4` полностью видимых outcomes, `3/3` финальных project cards и `9/9` загруженных и декодированных project images. Verifier также проверяет точный состав, source files и суммарные размеры всех шести contact sheets. Результат: `30/30 PNG + 6/6 contact sheets PASS`.

| Filename | DOM heading | Dimensions |
| --- | --- | ---: |
| 375-01-hero.png | Разрабатываю цифровые и AI-продукты. | 375×1196 |
| 375-02-problems.png | В чем могу быть полезен? | 375×1348 |
| 375-03-career.png | От торговли и экономики — к цифровым продуктам | 375×1835 |
| 375-04-projects.png | Маркетплейс моих разработок | 375×2643 |
| 375-05-contact.png | Расскажите, что должно измениться. | 375×673 |
| 430-01-hero.png | Разрабатываю цифровые и AI-продукты. | 430×1277 |
| 430-02-problems.png | В чем могу быть полезен? | 430×1327 |
| 430-03-career.png | От торговли и экономики — к цифровым продуктам | 430×1814 |
| 430-04-projects.png | Маркетплейс моих разработок | 430×2692 |
| 430-05-contact.png | Расскажите, что должно измениться. | 430×721 |
| 768-01-hero.png | Разрабатываю цифровые и AI-продукты. | 768×832 |
| 768-02-problems.png | В чем могу быть полезен? | 768×1203 |
| 768-03-career.png | От торговли и экономики — к цифровым продуктам | 768×1606 |
| 768-04-projects.png | Маркетплейс моих разработок | 768×2039 |
| 768-05-contact.png | Расскажите, что должно измениться. | 768×682 |
| 1024-01-hero.png | Разрабатываю цифровые и AI-продукты. | 1024×900 |
| 1024-02-problems.png | В чем могу быть полезен? | 1024×1137 |
| 1024-03-career.png | От торговли и экономики — к цифровым продуктам | 1024×1555 |
| 1024-04-projects.png | Маркетплейс моих разработок | 1024×1236 |
| 1024-05-contact.png | Расскажите, что должно измениться. | 1024×666 |
| 1280-01-hero.png | Разрабатываю цифровые и AI-продукты. | 1280×900 |
| 1280-02-problems.png | В чем могу быть полезен? | 1280×1179 |
| 1280-03-career.png | От торговли и экономики — к цифровым продуктам | 1280×1637 |
| 1280-04-projects.png | Маркетплейс моих разработок | 1280×1278 |
| 1280-05-contact.png | Расскажите, что должно измениться. | 1280×725 |
| 1440-01-hero.png | Разрабатываю цифровые и AI-продукты. | 1440×900 |
| 1440-02-problems.png | В чем могу быть полезен? | 1440×1159 |
| 1440-03-career.png | От торговли и экономики — к цифровым продуктам | 1440×1637 |
| 1440-04-projects.png | Маркетплейс моих разработок | 1440×1278 |
| 1440-05-contact.png | Расскажите, что должно измениться. | 1440×765 |

Все 30 кадров визуально просмотрены через шесть воспроизводимых contact sheets в [`marketplace-datoniks-final-contact-sheets`](./design-evidence/marketplace-datoniks-final-contact-sheets/), по одной на ширину. Первый bounded visual pass обнаружил только дефекты процесса съёмки: незавершённый reveal карточек и наложение fixed navigation на non-hero clips. В единственном fix pass capture script дождался финального reveal и исключил navigation из таких кадров; после повторной съёмки все шесть contact sheets проверены без обрезки, неверного offset, stitching и отсутствующего контента. Дополнительный цикл визуальной полировки не запускался.

Review readiness revision пересняла матрицу после более строгой подготовки DOM: hero прокручивается к WorkSequence и ждёт финального состояния всех шести узлов; problem capture ждёт финальные стили четырёх outcomes; project capture последовательно активирует lazy-loading, ждёт финал трёх карточек и вызывает `decode()` у всех девяти изображений. Перед clip smooth scroll принудительно отключается и проверяется `scrollY === 0`, поэтому fixed navigation не фиксируется на промежуточном offset. Новые шесть contact sheets визуально проверены; blank images, частичные reveal и stitching отсутствуют.

## Final whole-branch review

- No-JS fallback и основные React-секции используют общий `sectionCopy`: заголовки задач и карьерного пути, описание маркетплейса и `contact.body` совпадают с видимым интерфейсом; старые формулировки отсутствуют.
- Закрытый CardNav на 375 и 430 px показывает CTA «Связаться». CDP-замеры: CTA `120.86×48px`, логотип `44×44px`, меню `48×48px`; пересечений и горизонтального overflow нет. Обновлённые hero и полные contact sheets обеих mobile-ширин визуально проверены.
- Barcode scan получает ровно одну новую ревизию при входе указателя в паспорт и при keyboard focus выбранной задачи. В Chrome `animation-iteration-count: 1`; при `prefers-reduced-motion: reduce` — `animation-name: none`.
- После исправлений заново сформированы `30/30` evidence PNG, `6/6` contact sheets и manifest; evidence verifier — PASS.

Ограничение: физические iPhone/iPad, Safari, настоящий notch/safe-area и экранная клавиатура не проверялись; QA выполнен в Chromium с viewport/media emulation.
