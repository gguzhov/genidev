# Gradient Wave Portfolio Redesign — план реализации

## Цель

Обновить личный лендинг так, чтобы посетитель быстро понял полный цикл работы Геннадия, увидел человеческие формулировки задач, сильные доказательства в трёх проектах и получил очевидный путь к контакту или инвестиционным материалам DATONIKS.

## Ограничения

- Сохраняем текущий React/Vite стек и токены `docs/design-system.md`.
- Компонент 21st.dev недоступен без авторизации; создаём локальный совместимый `GradientWave` без Tailwind и новых зависимостей.
- В каждой карточке и кейсе — ровно четыре подтверждённых результата.
- Habr: публикуем проверяемые `9 статей / 300 тыс.+ просмотров`.
- Mobile-first и релизная матрица 375/430/768/1024/1280/1440.

## Task 1 — Зафиксировать новые контентные контракты

**Файлы:**
- `tests/gradient-wave-portfolio-redesign.test.mjs`
- `src/content/siteContent.js`
- `src/content/renderNoscriptFallback.js`

**RED:** тесты требуют новый hero, четыре человеческие задачи, один результат на этап карьеры, `3 млн ₽`, четыре project metrics, отсутствие model metrics/technical, ссылки DATONIKS и социальные ссылки.

**GREEN:** обновить данные и no-JS fallback из общего источника истины.

## Task 2 — GradientWave и цикл hero

**Файлы:**
- `src/components/GradientWave/GradientWave.jsx`
- `src/components/GradientWave/GradientWave.css`
- `src/components/WorkSequence/WorkSequence.jsx`
- `src/components/WorkSequence/WorkSequence.css`
- `src/App.jsx`
- `src/styles/global.css`
- `src/styles/hero.css`

**Проверка:** локальный фон без постоянного RAF/interval/infinite animation; на desktop путь — дуга/цикл, на mobile — вертикальные шесть этапов; GSAP one-shot и reduced-motion static.

## Task 3 — Человеческие бизнес-задачи и карьерный путь

**Файлы:**
- `src/components/ProblemSelector/ProblemSelector.jsx`
- `src/components/ProblemSelector/ProblemSelector.css`
- `src/components/CareerTimeline/CareerTimeline.jsx`
- `src/components/CareerTimeline/CareerTimeline.css`

**Проверка:** четыре задачи понятны без открытия; выбранная задача показывает «Что сделаю» и «Что получите» по четыре пункта. Карьера показывает место/проект, короткое действие и один сильный результат без служебных меток.

## Task 4 — Новая витрина проектов

**Файлы:**
- `src/components/ProjectMarketplace/ProjectCard.jsx`
- `src/components/ProjectMarketplace/ProjectVisual.jsx`
- `src/components/ProjectMarketplace/ProjectMarketplace.css`

**Проверка:** три 3:2 градиентные карточки с центрированными точными логотипами, категориями и ровно четырьмя результатами; keyboard/touch/hover/reduced-motion.

## Task 5 — Упростить кейсы и добавить медиа

**Файлы:**
- `src/components/ProjectCase/ProjectCase.jsx`
- `src/components/ProjectCase/ProjectCase.css`
- `src/components/ProjectCase/ProjectGallery.jsx`
- `src/components/ProjectCase/OtherProjects.jsx`
- `public/projects/datoniks/*`
- `public/projects/ilonmask/*`
- `public/documents/datoniks-business-plan.pdf`

**Проверка:** нет блоков «Расчётные показатели» и «Техническая реализация»; навыки — ровные pills; slider у всех кейсов; DATONIKS содержит Иркутск, компоновку, Drive preview и три материала; другие проекты — графические карточки.

## Task 6 — CTA, социальный подвал и финальная полировка

**Файлы:**
- `src/components/FinalContact/FinalContact.jsx`
- `src/components/FinalContact/FinalContact.css`
- `src/components/SiteFooter/SiteFooter.jsx`
- `src/components/SiteFooter/SiteFooter.css`
- `public/icons/*`

**Проверка:** провокационный CTA без nickname под кнопкой; ограниченная orbital animation; GitHub/Telegram/Habr с официальными иконками; genidev, портрет, disclaimer.

## Task 7 — Верификация

1. `npm test`
2. `npm run build`
3. `git diff --check`
4. Impeccable detector — ровно один раз после завершения UI.
5. Browser QA: 375/430/768/1024/1280/1440; no overflow, face/CTA, hero cycle, 4 outcomes, 3 project cards, sliders, dialogs, PDF/Drive links, footer.
6. Keyboard: menu, task selector, project dialogs, sliders, focus return, Escape/Back/Forward.
7. `prefers-reduced-motion`: wave/cycle/orbit/project depth static.
