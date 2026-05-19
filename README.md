# HR Recruiter

HR-рекрутер с ИИ-ассистентом для автоматизации подбора персонала.

## Возможности

- **Поиск вакансий** — создание и управление вакансиями, парсинг с job boards
- **Поиск резюме** — сбор и анализ резюме кандидатов
- **AI-матчинг** — автоматическое сопоставление вакансий и резюме по позиции, зарплате и навыкам
- **Сравнение ЗП** — анализ средних зарплат по рынку
- **Ежедневные сводки** — утренние дайджесты новых вакансий, резюме и матчей (cron job)
- **Google Calendar** — автоматическое создание задач и встреч
- **Google Sheets** — экспорт данных в таблицы
- **Gmail интеграция** — отправка и просмотр писем
- **Email SMTP** — отправка писем через SMTP
- **Отчеты** — аналитика по закрытию вакансий

## Архитектура

- `backend` — Bun + Hono + Prisma + PostgreSQL
- `web` — React + Vite + TanStack Query/Router
- `mobile` — Expo + React Native
- `landing` — Astro статический сайт
- `packages/contracts` — shared Zod schemas

## API Endpoints

### Auth
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `POST /api/auth/refresh` — обновление токена
- `POST /api/auth/logout` — выход

### HR
- `GET/POST/PATCH/DELETE /api/hr/vacancies` — вакансии
- `GET/POST/PATCH/DELETE /api/hr/resumes` — резюме
- `GET/POST/PATCH /api/hr/matches` — матчи
- `GET/POST/PATCH/DELETE /api/hr/tasks` — задачи
- `GET/POST /api/hr/salary/reports` — зарплатные отчеты
- `GET/POST /api/hr/emails` — email логи
- `GET /api/hr/digest/daily` — ежедневная сводка

### Google Integrations
- `GET /api/google/auth-url/:scope` — URL для авторизации (calendar/sheets/gmail)
- `POST /api/google/callback` — callback после авторизации
- `GET /api/google/status` — статус подключения
- `POST/GET /api/google/calendar/events` — Calendar API
- `POST /api/google/sheets` — Sheets API
- `POST /api/google/gmail/send` — Gmail API

## Быстрый старт

```bash
# Установка зависимостей
bun install

# Создание .env файлов
cp backend/.env.example backend/.env
cp web/.env.example web/.env

# Генерация Prisma client
bun run --cwd backend prisma:generate

# Применение миграций (требуется PostgreSQL)
bun run --cwd backend prisma:migrate

# Запуск dev-серверов
bun run dev:backend
bun run dev:web
```

## Деплой на Vercel

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин
vercel login

# Деплой
vercel --prod
```

### Настройка на Vercel Dashboard

1. Добавьте Environment Variables:
   - `DATABASE_URL` — URL PostgreSQL на VPS
   - `JWT_SECRET` — случайный секрет (openssl rand -hex 32)
   - `GOOGLE_CLIENT_ID` — из Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` — из Google Cloud Console
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `OPENAI_API_KEY` — для AI анализа

2. Настройте Cron Jobs в dashboard или через `vercel.json`

## Миграции

```bash
# Локальная разработка
bun run --cwd backend prisma:migrate

# Production (на Vercel или VPS)
bun run --cwd backend prisma:deploy
```

## Документация

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — архитектура проекта
- [docs/LOCAL_DATABASE.md](docs/LOCAL_DATABASE.md) — локальная БД
- [docs/TESTING.md](docs/TESTING.md) — тестирование
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — деплой на Vercel

## Структура БД

### Основные таблицы:
- `users` — пользователи
- `auth_sessions` — сессии авторизации
- `google_tokens` — Google OAuth токены
- `vacancies` — вакансии
- `resumes` — резюме кандидатов
- `matches` — сопоставления вакансий и резюме
- `tasks` — задачи и события календаря
- `email_logs` — логи отправленных писем
- `salary_reports` — отчеты по зарплатам

## Лицензия

MIT
