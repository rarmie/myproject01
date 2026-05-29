# Project: Job Application Tracker

A full-stack application for tracking job applications, including status updates, contact management, and document storage.

## Project Overview

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Shadcn/UI.
- **Backend:** FastAPI (Python).
- **Database/ORM:** Prisma ORM with PostgreSQL.
- **Authentication:** NextAuth.js (Google Provider).
- **Architecture:** Hybrid monorepo with Next.js serving as the primary frontend and potentially some API routes, complemented by a FastAPI backend.

## Building and Running

### Frontend
- **Install dependencies:** `npm install`
- **Development mode:** `npm run dev`
- **Build for production:** `npm run build`
- **Linting:** `npm run lint`

### Backend
- **Setup:** (TODO: Verify specific virtual environment setup)
- **Run server:** `python main.py` or `uvicorn backend.main:app --reload`

### Database
- **Generate Prisma Client:** `npx prisma generate`
- **Push Schema changes:** `npx prisma db push`
- **Seed Database:** `npx prisma db seed`

## Development Conventions

### Frontend
- **Type Safety:** Use TypeScript for all components and utilities.
- **Styling:** Utilize Tailwind CSS 4 and Shadcn/UI components. Follow the theme established in `app/globals.css`.
- **API Requests:** Use Zod for schema validation in API routes (`app/api/`).
- **Data Fetching:** Use the Prisma client (exported from `@/lib/prisma`) for database operations within Next.js API routes.

### Backend
- **Framework:** FastAPI for performance and automatic OpenAPI documentation.
- **Validation:** Pydantic (standard with FastAPI).

### Project Structure
- `app/`: Next.js frontend pages and API routes.
- `backend/`: FastAPI backend implementation.
- `components/`: Shared React components (UI and domain-specific).
- `lib/`: Core utilities, including the Prisma client initialization.
- `prisma/`: Prisma schema and migration/seed scripts.
- `public/`: Static assets.

## Key Files
- `prisma/schema.prisma`: Defines the database models (`JobApplication`, `Contact`, `Document`).
- `lib/prisma.ts`: Initializes the Prisma client with the PostgreSQL adapter.
- `middleware.ts`: Handles authentication protection for specific routes.
- `app/api/auth/[...nextauth]/route.ts`: Configures NextAuth.
