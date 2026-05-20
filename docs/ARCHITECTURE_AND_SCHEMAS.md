# Detailed Architecture, Database Schemas, and Tasks

This document provides a comprehensive technical specification of the **HR Recruiter** system, including directory structure, architectural designs, database schema descriptions, and the list of completed and future tasks.

---

## 1. Documentation and Project Catalog Structure

The project is organized as a monorepo powered by **Bun Workspaces** and contains the following key modules:

```text
hr/
├── docs/                     # System documentation (Architecture, Database, Testing)
├── backend/                  # REST API server built with Hono and Prisma ORM
│   ├── prisma/               # Database schema and migrations
│   │   ├── migrations/       # Prisma SQL migrations (including 20260520000000_init)
│   │   └── schema.prisma     # Declarative Prisma model schema
│   └── src/                  # Backend source code (auth, hr, integrations, storage)
├── web/                      # React SPA web client built with Vite and TanStack
│   ├── src/
│   │   ├── components/       # Shared UI components (including ErrorBoundary)
│   │   ├── lib/              # API clients, authentication context (auth, hr-api)
│   │   ├── pages/            # Page views (Dashboard, Vacancies, Resumes, Analytics)
│   │   └── routes.tsx        # TanStack Router configuration with Route Guards
├── landing/                  # Static landing page built with Astro
├── mobile/                   # Mobile application built with Expo and React Native
└── packages/
    └── contracts/            # Shared Zod schemas and DTOs between client and server
```

---

## 2. System Architecture

The project's architectural design follows the **Modular Monolith** pattern with a clear separation of concerns.

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

### 2.1. Authentication and Security (Auth Flow)
* **JWT Sessions**: Short-lived Access Tokens are stored exclusively in the client's memory (RAM) to prevent XSS attacks.
* **HttpOnly Cookies**: Long-lived Refresh Tokens are stored in secure, HttpOnly, SameSite cookies.
* **Refresh Token Rotation**: Upon each Access Token refresh, the backend performs atomic token rotation in the database (issues a new pair and revokes the old one) to protect against replay attacks.
* **Password Hashing**: Uses the Argon2id algorithm via Bun's built-in `Bun.password.hash`.

### 2.2. Search Layer (Scrapers Integration)
* A unified job and candidate search service integrates with major boards:
  * **LinkedIn Scraper**
  * **Work.ua Scraper**
  * **Robota.ua Scraper**
* All scrapers return results through a common interface, allowing requests to be executed concurrently using `Promise.all`.

### 2.3. AI-Analysis and Match Scoring (AI Service)
* The backend contains an `AIService` integrated with LLMs (via OpenAI/Anthropic SDKs).
* The service analyzes job vacancy descriptions and candidate resumes, calculates a **Match Score** (from 0 to 100), and generates a detailed report outlining:
  * *Candidate strengths* (Pros).
  * *Qualification gaps / weaknesses* (Cons).
  * *Recommended questions for the interviewer*.

---

## 3. Database Schema

The system uses **PostgreSQL** and **Prisma ORM**. Primary keys are database-generated using `UUIDv7` (requires PostgreSQL 18+).

The models are represented by the following tables:

### 3.1. `users` Table
Stores system users (recruiters).
* `id` (`UUID`, PK, defaults to `gen_random_uuid()` / `uuidv7`)
* `email` (`TEXT`, Unique, Index) — user email address.
* `password_hash` (`TEXT`) — Argon2id password hash.
* `display_name` (`TEXT`, Optional) — display name of the user.
* `created_at` / `updated_at` (`TIMESTAMP`)

### 3.2. `auth_sessions` Table
Stores active authentication sessions and Refresh Token hashes.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE) — owner of the session.
* `refresh_token_hash` (`TEXT`, Unique) — SHA-256 hash of the refresh token.
* `expires_at` (`TIMESTAMP`, Index) — expiration date/time.
* `revoked_at` (`TIMESTAMP`, Optional) — revocation date/time (if applicable).
* `user_agent` / `ip_address` (`TEXT`, Optional)
* `created_at` / `updated_at` (`TIMESTAMP`)

### 3.3. `vacancies` Table
Stores manually created or imported job vacancies.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE) — owner of the vacancy.
* `title` (`TEXT`) — vacancy title.
* `company` (`TEXT`) — company name.
* `location` (`TEXT`, Optional) — location.
* `salary_from` / `salary_to` (`INTEGER`, Optional) — salary range boundaries.
* `currency` (`TEXT`, default `'RUB'`) — currency type.
* `description` (`TEXT`) — vacancy description.
* `source` (`TEXT`) — source platform (e.g. `manual`, `work.ua`, `linkedin`).
* `source_url` (`TEXT`, Optional) — URL to the original posting.
* `status` (`TEXT`, default `'active'`) — vacancy status (`active`, `closed`).
* `created_at` / `updated_at` (`TIMESTAMP`, Index)

### 3.4. `resumes` Table
Stores candidate resumes.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE) — owner of the resume.
* `full_name` (`TEXT`) — candidate's full name.
* `email` / `phone` (`TEXT`, Optional) — contact details.
* `position` (`TEXT`) — target job position.
* `salary` (`INTEGER`, Optional) — salary expectations.
* `currency` (`TEXT`, default `'RUB'`)
* `skills` (`TEXT[]`, default `[]`) — array of candidate skills.
* `experience` / `education` (`TEXT`, Optional) — background details.
* `source` (`TEXT`) — source platform.
* `source_url` (`TEXT`, Optional)
* `status` (`TEXT`, default `'new'`) — resume status (`new`, `interviewing`, `offered`, `rejected`).
* `created_at` / `updated_at` (`TIMESTAMP`, Index)

### 3.5. `matches` Table
Tracks relationships between vacancies and resumes with AI-generated compatibility scores.
* `id` (`UUID`, PK)
* `vacancy_id` (`UUID`, FK -> `vacancies.id` ON DELETE CASCADE)
* `resume_id` (`UUID`, FK -> `resumes.id` ON DELETE CASCADE)
* `score` (`DOUBLE PRECISION`, default `0`) — AI compatibility score.
* `status` (`TEXT`, default `'pending'`) — match status (`pending`, `approved`, `rejected`).
* `created_at` (`TIMESTAMP`)
* **Unique Index**: `(vacancy_id, resume_id)` — prevents duplicate match links.

### 3.6. `tasks` Table
Recruiter tasks and scheduled calendar events.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE)
* `title` (`TEXT`) — task title.
* `description` (`TEXT`, Optional)
* `event_type` (`TEXT`) — event category (`interview`, `call`, `follow_up`).
* `scheduled_at` (`TIMESTAMP`, Index) — scheduled date and time.
* `status` (`TEXT`, default `'pending'`) — event status (`pending`, `completed`, `cancelled`).
* `created_at` / `updated_at` (`TIMESTAMP`)

### 3.7. `email_logs` Table
Logs sent emails for auditing.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE)
* `to` (`TEXT`) — recipient email address.
* `subject` (`TEXT`) — email subject.
* `body` (`TEXT`) — email body content.
* `status` (`TEXT`, default `'sent'`)
* `created_at` (`TIMESTAMP`, Index)

### 3.8. `salary_reports` Table
Stores queried market salary statistics.
* `id` (`UUID`, PK)
* `user_id` (`UUID`, FK -> `users.id` ON DELETE CASCADE)
* `position` (`TEXT`) — position title.
* `location` (`TEXT`, Optional) — location context.
* `avg_salary` / `min_salary` / `max_salary` (`INTEGER`) — market values.
* `currency` (`TEXT`, default `'RUB'`)
* `source` (`TEXT`) — market data source.
* `created_at` (`TIMESTAMP`, Index)

---

## 4. Tasks and Roadmap

### 4.1. Completed (Done)
- [x] **Analytics and Reporting (Features)**:
  - Developed `AnalyticsPage` with interactive Recharts charts (Funnel, Skills, Salary).
  - Implemented candidate reports and market salary analytics.
  - Implemented report exports: Excel (CSV with UTF-8 BOM for correct cell encoding) and print-ready PDF layouts (via `@media print` rules).
- [x] **Dashboard Widgets**:
  - Integrated "Daily Digest" and "Recruiting Activity" widgets into the dashboard view to track 7-day uploads and average Match Scores.
- [x] **Audit Recommendations Resolution**:
  - **Prisma Migrations**: Created initial migration [20260520000000_init](file:///d:/operator_v2.2-main/hr/backend/prisma/migrations/20260520000000_init/migration.sql).
  - **Backend Type-Safety**: Replaced `any` with `DbClient` across all Hono `hr` routers.
  - **Docker Compose**: Synchronized local database name configuration (`web_app_demo`).
  - **Route Guards**: Protected `/app/*` routes from unauthenticated navigation with automatic login redirects.
  - **ErrorBoundary Component**: Added root-level error boundaries to the React layout to intercept exceptions.
  - **Docker Hygiene**: Configured `.dockerignore` for backend modules.

### 4.2. Planned (To Do / Roadmap)
- [ ] **Email Service Integration**:
  - Integrate a real SMTP or AWS SES mail sender (currently only writes to `email_logs`).
- [ ] **OAuth2 Authentication**:
  - Add Google and LinkedIn social login.
- [ ] **Mobile Client (Expo)**:
  - Synchronize contract definitions for the `mobile/` client and add analytics screen implementations.
- [ ] **Calendar Task Sync**:
  - Sync task records with external Google Calendar endpoints.
