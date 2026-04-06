# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Package Manager

- Always use **pnpm** instead of npm or yarn.
- Install dependencies: `pnpm install`
- Add a package: `pnpm add <package>`
- Add a dev dependency: `pnpm add -D <package>`
- Run scripts: `pnpm <script>`

---

## Frontend

### Framework & Language

- **React** with **TypeScript**.
- Prefer functional components and hooks.

### State Management

- Use **Redux Toolkit (RTK)** for global/shared state.
- Use `createSlice`, `createAsyncThunk`, and `RTK Query` where appropriate.
- Keep local/ephemeral UI state in `useState` or `useReducer` — do not over-use Redux.
- Store structure lives in `src/store/`.

### Styling

- Use **Tailwind CSS v3** for all styling.
- Do **not** write custom CSS files unless strictly necessary.
- Follow a mobile-first approach with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, etc.).
- Use `clsx` or `tailwind-merge` for conditional class composition.
- Tailwind config is at `tailwind.config.ts` — extend it there (colors, fonts, spacing) rather than using arbitrary values.

---

## Backend

### Framework & Language

- **Python** with **FastAPI**.
- Follow async patterns — use `async def` for all route handlers and service functions.
- Structure the project with clear separation: `routers/`, `services/`, `models/`, `schemas/`, `core/`.
- Use **Pydantic v2** for request/response schemas and data validation.
- Use **Alembic** for database migrations.

### API Conventions

- RESTful routes with clear, consistent naming.
- Return appropriate HTTP status codes.
- Use FastAPI's dependency injection (`Depends`) for shared logic (auth, DB sessions, etc.).
- All endpoints should have response models defined via Pydantic schemas.

---

## Database

- **PostgreSQL** is the primary database.
- Use **SQLAlchemy (async)** as the ORM with `asyncpg` as the driver.
- Define models in `models/` and Pydantic schemas separately in `schemas/`.
- All schema changes must be done through **Alembic** migrations — never alter the DB directly.
- Use connection pooling via SQLAlchemy's `AsyncEngine`.

---

## Project Conventions

### General

- Use **TypeScript** on the frontend — avoid `any` types.
- Use **Python type hints** on all function signatures in the backend.
- Keep business logic out of route handlers; delegate to service functions.
- Write small, focused functions and components.

### Naming

- Frontend: `camelCase` for variables/functions, `PascalCase` for components and types.
- Backend: `snake_case` for all Python code.
- Database: `snake_case` for table and column names.

### Environment Variables

- Store secrets and config in `.env` (never commit this file).
- Frontend accesses env vars via `import.meta.env.VITE_*`.
- Backend loads env vars using **pydantic-settings** (`BaseSettings`).

### Linting & Formatting

- Frontend: **ESLint** + **Prettier**.
- Backend: **Ruff** for linting and formatting.
- Run checks before committing.

---

## Folder Structure

```
root/
├── frontend/                        # React + TypeScript app
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── app/                     # App entry, router, global providers
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers.tsx
│   │   ├── assets/                  # Images, fonts, icons
│   │   ├── components/              # Shared/reusable UI components
│   │   │   ├── ui/                  # Base primitives (Button, Input, Modal…)
│   │   │   └── layout/              # Header, Sidebar, PageWrapper…
│   │   ├── features/                # Feature-based modules
│   │   │   └── <feature>/
│   │   │       ├── components/      # Feature-specific components
│   │   │       ├── hooks/           # Feature-specific hooks
│   │   │       ├── slice.ts         # RTK slice (actions + reducers)
│   │   │       ├── api.ts           # RTK Query endpoints for this feature
│   │   │       └── types.ts         # Local TypeScript types
│   │   ├── hooks/                   # Shared custom hooks
│   │   ├── store/                   # Redux store setup
│   │   │   ├── index.ts             # configureStore, RootState, AppDispatch
│   │   │   └── middleware.ts        # Custom middleware
│   │   ├── services/                # RTK Query base API & global services
│   │   │   └── baseApi.ts
│   │   ├── utils/                   # Pure helper functions
│   │   ├── types/                   # Global TypeScript types & interfaces
│   │   └── styles/                  # Global CSS / Tailwind base overrides
│   │       └── globals.css
│   ├── .env
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                         # FastAPI app
│   ├── app/
│   │   ├── main.py                  # FastAPI app instance, middleware, router mount
│   │   ├── core/                    # Config, security, dependencies
│   │   │   ├── config.py            # BaseSettings (pydantic-settings)
│   │   │   ├── security.py          # JWT, password hashing
│   │   │   └── dependencies.py      # Shared Depends() — DB session, current user
│   │   ├── db/                      # Database setup
│   │   │   ├── base.py              # SQLAlchemy declarative base
│   │   │   ├── session.py           # Async engine & session factory
│   │   │   └── init_db.py           # DB initialisation helpers
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   └── <entity>.py
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   │   └── <entity>.py
│   │   ├── routers/                 # FastAPI routers (one per resource)
│   │   │   └── <entity>.py
│   │   ├── services/                # Business logic (called by routers)
│   │   │   └── <entity>.py
│   │   └── utils/                   # Backend utility functions
│   ├── alembic/                     # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/                       # Pytest test suite
│   │   ├── conftest.py
│   │   └── <feature>/
│   ├── .env
│   ├── alembic.ini
│   ├── pyproject.toml               # Ruff, pytest config
│   └── requirements.txt
│
├── CLAUDE.md
├── .gitignore
└── docker-compose.yml               # PostgreSQL + backend + frontend services
```

---

## Common Commands

### Frontend

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript check
```

### Backend

```bash
uvicorn app.main:app --reload          # Start dev server
alembic upgrade head                   # Apply migrations
alembic revision --autogenerate -m ""  # Generate new migration
ruff check . && ruff format .          # Lint and format
```

### Database

```bash
psql -U <user> -d <dbname>   # Connect to PostgreSQL
alembic history               # View migration history
alembic downgrade -1          # Roll back one migration
```

## Comments

Use the comments like these:
// ── Add Transaction Modal ──────────────────────────────────────────────────
// ── Tab config ─────────────────────────────────────────────────────────────
// ── Placeholder for unbuilt modules ───────────────────────────────────────
// ── App ────────────────────────────────────────────────────────────────────

I want to see every part of code separated and explained clearly in this way. Use it on every component, method, function, constaint, constructor, use these comments on the backend and on the frontend
