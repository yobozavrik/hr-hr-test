# HR Recruiter

HR-рекрутер с ИИ-ассистентом для автоматизации подбора персонала.

## Возможности

- **Поиск вакансий** — парсинг и агрегация вакансий с популярных платформ
- **Поиск резюме** — сбор и анализ резюме кандидатов
- **Сравнение ЗП** — анализ средних зарплат по рынку
- **Ежедневные сводки** — утренние дайджесты новых вакансий и резюме
- **Google Calendar** — автоматическое создание задач и встреч
- **Email интеграция** — отправка и просмотр писем
- **Google Sheets** — экспорт данных в таблицы
- **Отчеты** — аналитика по закрытию вакансий

## Архитектура

- `backend` — Bun + Hono + Prisma + PostgreSQL
- `web` — React + Vite + TanStack Query/Router
- `mobile` — Expo + React Native
- `landing` — Astro статический сайт
- `packages/contracts` — shared Zod schemas

## Быстрый старт

```bash
bun install
```

Запустите PostgreSQL через Docker:
```bash
docker compose up -d postgres
```

Создайте `.env` файлы:
```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
```

Примените миграции:
```bash
bun run --cwd backend prisma:migrate
```

Запустите dev-серверы:
```bash
bun run dev:backend
bun run dev:web
```

## Деплой

Деплой на Vercel:
```bash
vercel --prod
```

## Документация

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — архитектура проекта
- [docs/LOCAL_DATABASE.md](docs/LOCAL_DATABASE.md) — локальная БД
- [docs/TESTING.md](docs/TESTING.md) — тестирование

## Лицензия

MIT
