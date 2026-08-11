# Task 2 report — маркетплейс из трёх равных кейсов

Дата: 2026-08-11
Статус: DONE

## Результат

- Заголовок секции заменён на «Маркетплейс моих разработок», удалён eyebrow «Реализованные проекты», добавлено точное описание из frozen spec.
- Marketplace показывает три равных проекта: одна колонка на mobile, две на 768–1023 px и три от 1024 px. Третья карточка на 768 px сохраняет ширину колонки и не растягивается через span.
- Все карточки используют media 3:2, компактный status/duration row, ровно четыре прямоугольные evidence-плашки и один card-wide action `Открыть кейс` через `onOpenProject(slug)`.
- Для DATONIKS сохранён честный статус «Инвестиционный проект · ищу партнёра». Generated atmosphere, реальный слайд 3 и точный логотип остаются тремя независимыми DOM-слоями.
- `will-change: transform` включается только после реального `pointermove`, снимается на `pointerleave`, при смене media preference и cleanup. Pointer listeners по-прежнему существуют только для fine hover без reduced motion.
- После bounded visual pass точный светлый логотип DATONIKS получил контрастную подложку из существующей палитры проекта.

## TDD RED → GREEN

RED:

```text
node --test tests/marketplace-redesign.test.mjs
5 tests, 0 pass, 5 fail
```

Ожидаемые причины: старый heading, отсутствующая третья desktop-колонка, отсутствие status-row, технический слайд вместо atmosphere и постоянный `will-change`.

После visual QA отдельный regression RED подтвердил отсутствие контрастной подложки логотипа DATONIKS: `5 pass / 1 fail`.

GREEN:

```text
node --test tests/marketplace-redesign.test.mjs
6 tests, 6 pass, 0 fail

node --test tests/marketplace-redesign.test.mjs tests/marketplace-state.test.mjs tests/iteration-2-fixes.test.mjs
30 tests, 30 pass, 0 fail
```

Два устаревших тестовых ожидания прошлой итерации синхронизированы с frozen spec: точный marketplace description и generated DATONIKS atmosphere вместо slide 10.

## Imagen asset

Режим: built-in Imagegen/Imagen, use case `stylized-concept`.

- Исходный output: `/Users/gguzhov/.codex/generated_images/019ff000-9dc8-7563-a02f-975abbf0fa2a/exec-9c83a963-f6e9-4257-9a26-77a7dedd6662.png`.
- Финальный project-bound asset: `public/projects/ice/datoniks-ice-v1.webp`.
- Формат и размер: WebP, 1536×1024, 173 KB.
- PNG и финальный WebP проверены через `view_image`: prefab-инфраструктура и restrained digital ice читаются; текста, логотипов, UI, людей, лиц, роботов, метрик и watermark нет.

Финальный prompt:

```text
Use case: stylized-concept
Asset type: 3:2 atmosphere background for a portfolio project card
Primary request: create an abstract prefab modular data-center environment made of restrained digital ice and modular infrastructure forms
Scene/backdrop: spacious cold architectural environment with modular container-like volumes, crystalline translucent layers, subtle cable-path geometry and one calm directional light signal
Style/medium: premium photorealistic 3D concept render, clean evidence-first editorial aesthetic, sophisticated and restrained rather than sci-fi spectacle
Composition/framing: landscape 3:2, balanced central infrastructure silhouette, useful depth around the edges for overlaid evidence layers, no cropped focal object
Lighting/mood: cool diffuse daylight, pale blue and neutral ice, quiet professional atmosphere, readable midtone contrast
Color palette: pale neutral blue, frosted white, restrained deep blue accents
Materials/textures: frosted glass, brushed metal, translucent ice, subtle condensation and precise industrial seams
Constraints: image must contain only the atmospheric environment; no text, no letters, no numbers, no logos, no brands, no user interface, no screens with UI, no people, no human figures, no faces, no robots, no metrics, no watermark; do not depict a readable dashboard or pitch slide
Avoid: cyberpunk neon, dark dystopia, server-brand marks, signage, typography, charts, diagrams, labels, badges
```

## Проверки

```text
focused: 6/6 pass
required related: 30/30 pass
npm test: 143/143 pass
npm run build: pass
git diff --check: pass
```

Headless Chrome 151 / CDP, viewport height 1400, DPR 1:

| Width | Columns | Equal card width | Media | Metrics | Actions | Page overflow |
| --- | ---: | --- | --- | --- | --- | ---: |
| 375 | 1 | PASS | 3:2 | 4 × 3 | 1 × 3, 44 px | 0 |
| 430 | 1 | PASS | 3:2 | 4 × 3 | 1 × 3, 44 px | 0 |
| 768 | 2 | PASS, включая третью | 3:2 | 4 × 3 | 1 × 3, 44 px | 0 |
| 1024 | 3 | PASS, equal height | 3:2 | 4 × 3 | 1 × 3, 44 px | 0 |
| 1280 | 3 | PASS, equal height | 3:2 | 4 × 3 | 1 × 3, 44 px | 0 |
| 1440 | 3 | PASS, equal height | 3:2 | 4 × 3 | 1 × 3, 44 px | 0 |

На 375, 768 и 1024 px выполнен визуальный capture/inspect. Перекрытий, обрезки карточек и page overflow не обнаружено; generated atmosphere, slide 3 и exact logo DATONIKS загружаются отдельными слоями.

## Ограничения

- QA выполнен в headless Chrome, не на физическом mobile-устройстве и не в Safari.
- Защищённые untracked `.npmrc`, `tmp/` и `docs/design-evidence/*` не изменялись и не добавляются в commit.
