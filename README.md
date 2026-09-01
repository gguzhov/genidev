# genidev

Персональный двуязычный сайт-портфолио Геннадия Гужова — fullstack-разработчика цифровых и AI-продуктов. Сайт связывает бизнес-задачи с конкретными решениями, показывает карьерный путь и раскрывает реализованные проекты через подробные кейсы.

[Открыть сайт](https://genidev.ru) · [Связаться в Telegram](https://t.me/gguzhov)

![Главная страница genidev](docs/design-evidence/implementation/landing-1280.png)

## Что внутри

- шесть направлений цифровизации бизнеса с примерами решений;
- карьерный путь с подтверждёнными фактами и результатами;
- интерактивная витрина проектов и отдельные route-backed кейсы;
- русская и английская версии без дублирования контента;
- адаптивный интерфейс с keyboard navigation и поддержкой `prefers-reduced-motion`;
- статический fallback для посетителей без JavaScript;
- автоматическая сборка, тестирование и публикация через GitHub Actions.

## Проекты в портфолио

- **Остров Здоровья** — medtech-платформа, AI-сценарии и автоматизация;
- **IlonMask VPN** — продуктовые интерфейсы и развитие VPN-сервиса;
- **DATONIKS** — инфраструктурный проект дата-центров;
- **Wedding Vote** — интерактивное голосование для мероприятий.

## Стек

| Область | Технологии |
| --- | --- |
| Frontend | React 19, Vite 6 |
| Motion и 3D | GSAP, Motion, Three.js |
| UI | Hugeicons, JetBrains Mono, CSS design tokens |
| Качество | Node.js Test Runner, accessibility и visual regression checks |
| Деплой | GitHub Actions, статический release на VPS, Nginx |

## Локальный запуск

Понадобится Node.js 22+.

```bash
git clone https://github.com/gguzhov/genidev.git
cd genidev
npm install
npm run dev
```

Vite откроет локальный адрес, указанный в терминале.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | локальная разработка |
| `npm run build` | production-сборка RU/EN-страниц |
| `npm run preview` | предпросмотр сборки |
| `npm test` | полный набор тестов |
| `npm run test:sites` | проверка Sites/worker-сборки |

## Где менять контент

```text
src/content/siteContent.js   # основной контент и данные проектов
src/content/siteLocale.js    # английская локализация
public/projects/             # обложки, логотипы и материалы кейсов
src/styles/                  # токены и глобальные стили
```

Продуктовые ограничения и подтверждённое позиционирование находятся в [PRODUCT.md](PRODUCT.md), визуальные принципы — в [DESIGN.md](DESIGN.md).

## Деплой

Push в `main` запускает GitHub Actions: зависимости → сборка → тесты → загрузка immutable release на VPS → атомарное переключение текущей версии.
