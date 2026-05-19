# Deployment

Проект деплоится на **Vercel** вместо DigitalOcean.

## Архитектура деплоя

- **Backend/API** — Vercel Serverless Functions (Hono на Bun/Node)
- **Web** — Vercel Static Site (React + Vite)
- **Landing** — Vercel Static Site (Astro)
- **Database** — Vercel Postgres или внешний PostgreSQL
- **Mobile** — Expo EAS (отдельно от Vercel)

## Переменные окружения

### Backend

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=<at-least-32-random-characters>
CORS_ORIGINS=https://web.example.com
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_DAYS=30
COOKIE_SECURE=true

# Google Integrations
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...

# Email
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

`JWT_SECRET` генерируется командой: `openssl rand -hex 32`

## Vercel CLI

Установка и логин:
```bash
npm i -g vercel
vercel login
```

## Деплой

### Первый деплой

```bash
# Backend + Web вместе
vercel --prod
```

### Настройка проекта

1. Создайте проект на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Укажите `Root Directory` — корень репозитория
4. Добавьте Environment Variables в dashboard

### Database

Для production используйте:
- **Vercel Postgres** — встроенное решение
- **Supabase** — managed PostgreSQL
- **Neon** — serverless PostgreSQL

### Cron Jobs

Для ежедневных сводок используйте Vercel Cron Jobs:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## Валидация перед деплоем

```bash
bun run typecheck
bun run test
bun run build
```

## Проверка после деплоя

- `/health` на backend URL
- Auth flow с CORS
- Prisma migrations применены
- Google integrations работают

## Mobile (Expo EAS)

```bash
bunx eas-cli env:create --name EXPO_PUBLIC_API_URL --value https://api.example.com --environment production
bunx eas-cli build --profile production --platform all
```
