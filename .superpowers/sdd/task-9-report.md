# Task 9 — новый hero и последовательность комплексного подхода

## Изменения

- H1 теперь показывает личность: «Геннадий Гужов — разработчик цифровых и AI-продуктов.»
- В контент hero добавлены `promise` и последовательность из пяти этапов; пояснение приведено к утверждённой формулировке.
- Непрерывный `LiquidEther` удалён из композиции первого экрана.
- Добавлен семантический `WorkSequence`: нумерованный `<ol>`, вертикальная линия на узких экранах и горизонтальная на tablet/desktop.
- Последовательность появляется один раз через `--sequence-index`/`--sequence-delay`; при `reducedMotion` и `prefers-reduced-motion` она полностью статична.
- Hero и портрет выровнены по единому контейнеру `1280px` и gutters `16/24/32/40px`.
- Вынесены общие layout/motion tokens и задокументированы в `docs/design-system.md`.
- No-JS fallback синхронизирован с новым hero: identity выводится один раз, promise и description сохранены.
- Устаревшие тестовые контракты WebGL заменены контрактами новой последовательности.

## TDD: RED

1. `node --test tests/premium-landing-contract.test.mjs`
   - FAIL: `0/1`.
   - Ожидаемая причина: старый `hero.title`; новый promise, `WorkSequence` и удаление `LiquidEther` отсутствовали.
2. Во время self-review добавлены интеграционные проверки H1/no-JS:
   `node --test tests/premium-landing-contract.test.mjs tests/noscript-fallback.test.mjs`
   - FAIL: `2/4`.
   - Ожидаемые причины: App выводил `hero.title` вместо `identity`, no-JS fallback повторял identity дважды и не выводил promise.

## GREEN и проверки

- `node --test tests/premium-landing-contract.test.mjs` — PASS, `1/1`.
- `node --test tests/premium-landing-contract.test.mjs tests/content-and-routing.test.mjs tests/hero-visual-contract.test.mjs tests/project-structure.test.mjs` — PASS, `23/23`.
- `node --test tests/premium-landing-contract.test.mjs tests/noscript-fallback.test.mjs` — PASS, `4/4`.
- `npm test` — PASS, `70/70`.
- `npm run build` — PASS; Vite собрал production bundle и Sites artifacts.
- `git diff --check` — PASS.

## Визуальная проверка

Проверено в браузере на `375×812`, `430×932`, `768×1024`, `1024×768`, `1280×900`, `1440×900`:

- горизонтального overflow нет на всех ширинах;
- H1 занимает 4 строки на mobile и 3 строки на tablet/desktop;
- на `375/430/768` текст расположен перед портретом;
- на `1024/1280/1440` портрет стоит справа и полностью помещается в первом viewport;
- все 5 этапов видимы, CTA имеет высоту `52px`;
- при эмуляции `prefers-reduced-motion: reduce` у hero и sequence `animation-name: none`, opacity этапов `1`, статичный класс активен;
- ошибок и предупреждений в консоли нет.

## Self-review и concerns

- Цвета не добавлялись: использованы только существующие токены палитры.
- Новые зависимости не добавлялись; проекты и кейсы не изменялись.
- `.npmrc`, `tmp/`, plan/spec и чужие untracked-материалы не затрагивались.
- На `768px` hero остаётся одноколоночным и становится двухколоночным с `1024px`; это соответствует текущей границе desktop-композиции и сохраняет читаемость длинного H1.
- Блокирующих visual concerns нет.
