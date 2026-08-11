# Task 2 report — evidence-first ice карточки

## Результат

- Два проекта получили по четыре точных подтверждённых результата из task brief.
- Создан `ProjectVisual`: отдельные слои Imagen-фона, реального интерфейса и точного локального бренд-ассета.
- Карточка стала семантическим `<article>` с отдельной кнопкой `Открыть кейс: …`; метрики вынесены в список и не входят в accessible name кнопки.
- Обе карточки используют одну геометрию `3 / 2` на всех marketplace-breakpoints; прежняя асимметрия и вертикальный сдвиг второго проекта удалены.
- На fine-pointer устройствах фон, реальный экран, логотип и ледяной свет спокойно реагируют на положение курсора. Движение событийное, без `requestAnimationFrame`, таймеров и бесконечного цикла. Touch и `prefers-reduced-motion` получают статичную композицию.
- Полноэкранный кейс сохраняет реальную обложку с её intrinsic ratio и `object-fit: contain`, а четыре результата выводятся семантическим списком.

## TDD

RED:

```text
node --test tests/evidence-first-project-visuals.test.mjs
3 tests, 0 pass, 3 fail
```

Ожидаемые причины: отсутствовали четыре результата, `project.visual`, `ProjectVisual`, semantic article и pointer/reduced-motion contract.

GREEN:

```text
node --test tests/evidence-first-project-visuals.test.mjs
3 tests, 3 pass, 0 fail
```

Устаревшие contract assertions предыдущих итераций обновлены под `ProjectVisual`, семантические `<li>` и единую 3:2 геометрию.

## Imagen

Режим: built-in Imagegen. Логотипы и UI через Imagegen не создавались.

### Остров Здоровья

Исходный output:
`/Users/gguzhov/.codex/generated_images/019fef70-0226-7ab1-a648-f6bdd57b57b0/exec-b2d4461c-b465-4642-86c8-e774c80d0abb.png`

Project-bound WebP:
`public/projects/ice/ostrov-ice-v1.webp` — 1536×1024, WebP quality 84.

Prompt:

```text
Use case: stylized-concept
Asset type: 3:2 portfolio project card background
Primary request: an original premium icy digital environment representing a system of personalized medicine
Scene/backdrop: translucent architectural glass and ice layers, a restrained pulse line, connected clinical data nodes, spacious composition
Style/medium: high-end 3D editorial technology render, precise and minimal
Lighting/mood: soft cold daylight, controlled silver-blue glow, calm and trustworthy
Color palette: deep navy, silver white, pale glacier blue
Composition/framing: landscape 3:2, central depth with quiet margins for real product layers
Constraints: no text, no letters, no numbers, no logos, no people, no medical crosses, no UI screenshots, no watermark
Avoid: acid neon, cyberpunk clutter, fantasy crystals, random devices
```

### IlonMask VPN

Исходный output:
`/Users/gguzhov/.codex/generated_images/019fef70-0226-7ab1-a648-f6bdd57b57b0/exec-73a72e64-3763-4b15-b629-7307f3d5c452.png`

Project-bound WebP:
`public/projects/ice/ilonmask-ice-v1.webp` — 1536×1024, WebP quality 84.

Prompt:

```text
Use case: stylized-concept
Asset type: 3:2 portfolio project card background
Primary request: an original premium icy digital environment representing a protected subscription network
Scene/backdrop: translucent orbital ice structure, controlled connection routes, layered secure network nodes, spacious composition
Style/medium: high-end 3D editorial technology render, precise and minimal
Lighting/mood: deep cold atmosphere, restrained cyan-white signal, confident and fast
Color palette: midnight navy, black-blue, silver white, pale cyan
Composition/framing: landscape 3:2, central network structure with quiet margins for real product layers
Constraints: no text, no letters, no numbers, no logos, no rockets, no people, no UI screenshots, no watermark
Avoid: acid neon, cyberpunk city, glowing padlocks, fantasy crystals, random satellites
```

Оба PNG и оба финальных WebP визуально проверены через `view_image`: нет текста, логотипов, UI, watermark или запрещённых объектов; 3:2 композиции различимы и оставляют место для evidence-слоёв.

Exact local assets:

- `public/projects/brands/ostrov-logo.svg` скопирован без изменения из локального проекта клиники; external references отсутствуют.
- `public/projects/brands/ilonmask-logo.webp` скопирован без изменения из локального VPN-проекта; 2048×2048, ненулевые dimensions.

## Проверки

```text
focused suite: 26/26 pass
npm test: 120/120 pass
npm run build: pass
git diff --check: pass
browser console errors/warnings: 0
```

Browser QA:

- 375 / 430 / 768 / 1024 / 1280 / 1440 px: `scrollWidth === viewport`, обе media ratio `1.5`, 8/8 result chips без внутреннего overflow, обе кнопки высотой 44px.
- 375 и 768 px: визуально проверены обе карточки; логотипы и реальные интерфейсы читаемы, карточки одинаковой ширины и без перекрытий.
- 1280 px: после движения курсора `--project-pointer-x` изменился `0px → 4.21px`, свет `50% → 66.24%`; фон и product-frame получили разные restrained transforms.
- `prefers-reduced-motion`: media query активен, pointer variable остаётся `0px`, composition статична.
- Fullscreen case на 375 px: четыре результата, без overflow; внутренний scroll `auto`, close target 44×44px.
- Fullscreen case на desktop: четыре результата, `object-fit: contain`, focus после открытия переходит на кнопку закрытия, Escape закрывает кейс.

Ограничение browser backend: locator/CUA synthetic `Enter` фокусировал нативную кнопку, но не эмитил её click; pointer click, native `<button>`, `focus-visible`, accessible label и focus trap проверены. Ошибок страницы нет.

## Затронутые пользовательские файлы

`.npmrc`, `tmp/` и старые untracked `docs/design-evidence/*` не изменялись и не добавлялись в commit.
