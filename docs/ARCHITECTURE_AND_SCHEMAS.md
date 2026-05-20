# Детальний опис архітектури, схем бази даних та завдань

Цей документ надає вичерпну технічну специфікацію системи **HR Recruiter**: структуру каталогів, архітектурні рішення, опис схем баз даних, а також перелік виконаних та майбутніх завдань.

---

## 1. Структура документації та проектних каталогів

Проект організований як монорепозиторій на базі **Bun Workspaces** та містить такі ключові модулі:

```text
hr/
├── docs/                     # Системна документація (Архітектура, БД, Тестування)
├── backend/                  # REST API сервер на базі Hono та Prisma ORM
│   ├── prisma/               # Схема бази даних та файли міграцій
│   │   ├── migrations/       # SQL міграції Prisma (включаючи 20260520000000_init)
│   │   └── schema.prisma     # Декларативна схема моделей Prisma
│   └── src/                  # Вихідний код бекенду (auth, hr, integrations, storage)
├── web/                      # React SPA веб-клієнт на базі Vite та TanStack
│   ├── src/
│   │   ├── components/       # Спільні UI компоненти (включаючи ErrorBoundary)
│   │   ├── lib/              # Клієнти API, контекст авторизації (auth, hr-api)
│   │   ├── pages/            # Сторінки (Dashboard, Vacancies, Resumes, Analytics)
│   │   └── routes.tsx        # Роутинг TanStack Router із Route Guards
├── landing/                  # Статичний промо-сайт (landing page) на Astro
├── mobile/                   # Мобільний додаток на базі Expo та React Native
└── packages/
    └── contracts/            # Спільні Zod-схеми валідації та DTO між клієнтами і сервером
```

---

## 2. Архітектура системи

Архітектурний дизайн проекту слідує принципу **Modular Monolith** із чітким розділенням обов'язків.

```mermaid
graph TD
    subgraph Clients
        Web[React SPA Client]
        Mobile[Expo Mobile Client]
    end

    subgraph Packages
        Contracts[@hr-recruiter/contracts]
    end

    subgraph Backend
        Hono[Hono API Server]
        Auth[Auth Guard]
        Service[HR Service]
        Scrapers[Integrations Scrapers]
        AI[AI Match Scorer]
        DB[(PostgreSQL)]
    end

    Web -. Validates shapes .-> Contracts
    Mobile -. Validates shapes .-> Contracts
    Hono -. Validates request .-> Contracts

    Web -- REST API requests --> Hono
    Mobile -- REST API requests --> Hono

    Hono --> Auth
    Auth --> Service
    Service --> DB
    Service --> Scrapers
    Service --> AI
```

### 2.1. Авторизація та безпека (Auth Flow)
* **JWT сесії**: Короткоживучі Access Token зберігаються виключно в пам'яті клієнта (RAM) для запобігання XSS-атакам.
* **HttpOnly Cookies**: Довгоживучі Refresh Token зберігаються в захищених HttpOnly, SameSite куках.
* **Ротація Refresh-токенів**: При кожному оновленні Access Token бекенд виконує атомарну ротацію токенів у базі даних (видає нову пару, а стару маркує як відкликану) для захисту від повторного використання.
* **Хешування паролів**: Використовується алгоритм Argon2id через вбудований `Bun.password.hash`.

### 2.2. Пошуковий шар (Scrapers Integration)
* Уніфікована служба пошуку вакансій та кандидатів інтегрована з основними платформами:
  * **LinkedIn Scraper**
  * **Work.ua Scraper**
  * **Robota.ua Scraper**
* Всі парсери повертають результати через загальний інтерфейс, що дозволяє паралельно виконувати запити за допомогою `Promise.all`.

### 2.3. AI-Аналіз та Матчинг кандидатів (AI Service)
* Бекенд містить сервіс `AIService` інтегрований із LLM (через OpenAI/Anthropic SDK).
* Сервіс аналізує опис вакансії та резюме кандидата, розраховує **Match Score** (від 0 до 100) та генерує детальний звіт:
  * *Сильні сторони кандидата* (Pros).
  * *Слабкі сторони / прогалини у кваліфікації* (Cons).
  * *Рекомендації для інтерв'юера*.

---

## 3. Схема Бази Даних (Database Schema)

Система використовує **PostgreSQL** та **Prisma ORM**. Первинні ключі генеруються базою даних за допомогою функції `UUIDv7` (потребує PostgreSQL 18+).

 Моделі представлені такими таблицями:

### 3.1. Таблиця `users`
Зберігає користувачів системи (рекрутерів).
* `id` (`UUID`, PK, за замовчуванням `gen_random_uuid()` / `uuidv7`)
* `email` (`TEXT`, Unique, Index) — електронна пошта.
* `password_hash` (`TEXT`) — хеш пароля Argon2id.
* `display_name` (`TEXT`, Optional) — ім'я користувача.
* `created_at` / `updated_at` (`TIMESTAMP`)

### 3.2. Таблиця `auth_sessions`
Сесії авторизації та Refresh-токени.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE) — рекрутер, якому належить сесія.
* `refresh_token_hash` (`TEXT`, Unique) — SHA-256 хеш токена оновлення.
* `expires_at` (`TIMESTAMP`, Index) — дата закінчення сесії.
* `revoked_at` (`TIMESTAMP`, Optional) — дата відкликання сесії (якщо відкликано).
* `user_agent` / `ip_address` (`TEXT`, Optional)
* `created_at` / `updated_at` (`TIMESTAMP`)

### 3.3. Таблиця `vacancies`
Опубліковані або знайдені вакансії.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE) — власник вакансії.
* `title` (`TEXT`) — назва вакансії.
* `company` (`TEXT`) — назва компанії.
* `location` (`TEXT`, Optional) — локація.
* `salary_from` / `salary_to` (`INTEGER`, Optional) — вилка зарплати.
* `currency` (`TEXT`, default `'RUB'`) — валюта.
* `description` (`TEXT`) — опис вакансії.
* `source` (`TEXT`) — джерело (напр. `manual`, `work.ua`, `linkedin`).
* `source_url` (`TEXT`, Optional) — посилання на першоджерело.
* `status` (`TEXT`, default `'active'`) — статус (`active`, `closed`).
* `created_at` / `updated_at` (`TIMESTAMP`, Index)

### 3.4. Таблиця `resumes`
Резюме кандидатів.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE) — власник резюме.
* `full_name` (`TEXT`) — ім'я та прізвище кандидата.
* `email` / `phone` (`TEXT`, Optional) — контакти.
* `position` (`TEXT`) — бажана посада.
* `salary` (`INTEGER`, Optional) — зарплатні очікування.
* `currency` (`TEXT`, default `'RUB'`)
* `skills` (`TEXT[]`, default `[]`) — масив навичок кандидата.
* `experience` / `education` (`TEXT`, Optional) — опис досвіду та освіти.
* `source` (`TEXT`) — джерело.
* `source_url` (`TEXT`, Optional)
* `status` (`TEXT`, default `'new'`) — статус (`new`, `interviewing`, `offered`, `rejected`).
* `created_at` / `updated_at` (`TIMESTAMP`, Index)

### 3.5. Таблиця `matches`
Зв'язок між вакансіями та кандидатами із оцінкою відповідності.
* `id` (`UUID`, PK)
* `vacancy_id` (`UUID`, FK -> `vacancies.id` ON DELETE CASCADE)
* `resume_id` (`UUID`, FK -> `resumes.id` ON DELETE CASCADE)
* `score` (`DOUBLE PRECISION`, default `0`) — оцінка сумісності від AI.
* `status` (`TEXT`, default `'pending'`) — статус розгляду (`pending`, `approved`, `rejected`).
* `created_at` (`TIMESTAMP`)
* **Унікальний індекс**: `(vacancy_id, resume_id)` — запобігає дублюванню зв'язку між однією вакансією та одним резюме.

### 3.6. Таблиця `tasks`
Справи та завдання рекрутера (календар).
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE)
* `title` (`TEXT`) — заголовок події.
* `description` (`TEXT`, Optional)
* `event_type` (`TEXT`) — тип події (`interview`, `call`, `follow_up`).
* `scheduled_at` (`TIMESTAMP`, Index) — запланований час.
* `status` (`TEXT`, default `'pending'`) — статус події (`pending`, `completed`, `cancelled`).
* `created_at` / `updated_at` (`TIMESTAMP`)

### 3.7. Таблиця `email_logs`
Логи надісланих електронних листів.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE)
* `to` (`TEXT`) — адресат.
* `subject` (`TEXT`) — тема листа.
* `body` (`TEXT`) — тіло листа.
* `status` (`TEXT`, default `'sent'`)
* `created_at` (`TIMESTAMP`, Index)

### 3.8. Таблиця `salary_reports`
Звіти щодо ринкових зарплат.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE)
* `position` (`TEXT`) — посада для оцінки.
* `location` (`TEXT`, Optional) — локація оцінки.
* `avg_salary` / `min_salary` / `max_salary` (`INTEGER`) — показники вилки.
* `currency` (`TEXT`, default `'RUB'`)
* `source` (`TEXT`) — джерело даних.
* `created_at` (`TIMESTAMP`, Index)

---

## 4. Список виконаних та майбутніх завдань (Tasks & Roadmap)

### 4.1. Виконано (Done)
- [x] **Аналітика та Звіти (Ресурси)**:
  - Розроблено сторінку `AnalyticsPage` з інтерактивними графіками на базі `Recharts` (Funnel, Skills, Salary).
  - Реалізовано генерацію детальних звітів по кандидатах та аналіз ринкових зарплат.
  - Налаштовано експорт звітів у Excel (CSV з UTF-8 BOM для правильного відкриття в Excel) та друкований PDF-варіант (через CSS `@media print`).
- [x] **Віджети Дашборду**:
  - Інтегровано блоки «Daily Digest» та «Recruiting Activity» на головну сторінку для швидкого перегляду статистики за 7 днів та середнього Match Score.
- [x] **Усунення критичних зауважень аудиту**:
  - **Prisma Migrations**: Створено початкову міграцію [20260520000000_init](file:///d:/operator_v2.2-main/hr/backend/prisma/migrations/20260520000000_init/migration.sql).
  - **Типізація бєкенду**: Замінено `any` на `DbClient` у всіх роутерах модуля `hr`.
  - **Docker Compose**: Узгоджено назву локальної бази даних (`web_app_demo`).
  - **Route Guards**: Захищено маршрути `/app/*` від неавторизованого доступу з редиректом на головну.
  - **ErrorBoundary**: Запобіжний компонент інтегрований у головний лейаут додатку для перехоплення неочікуваних клієнтських винятків.
  - **Docker Hygiene**: Додано `.dockerignore` для очищення збірок бєкенду від `node_modules` та локальних конфігів.

### 4.2. Заплановано на майбутнє (Roadmap / To Do)
- [ ] **Email-інтеграція**:
  - Налаштувати відправку реальних листів через SMTP/AWS SES (зараз створено лише логи надсилань у таблиці `email_logs`).
- [ ] **OAuth2 Авторизація**:
  - Додати швидкий вхід за допомогою Google/LinkedIn.
- [ ] **Мобільний клієнт (Expo)**:
  - Завершити синхронізацію контрактів для додатка `mobile/` та додати екран аналітики на мобільні телефони.
- [ ] **Календар завдань**:
  - Реалізувати інтеграцію завдань рекрутера з Google Calendar через API.
