# Resume Intelligence

Resume Intelligence is a full-stack SaaS application for AI-assisted resume analysis, improvement, creation, and export. The project is developed incrementally in eight production-oriented phases.

## Technology

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, and TanStack Query
- Backend: NestJS and TypeScript
- Planned platform services: PostgreSQL, Prisma, JWT authentication, PDF processing, and server-side LLM integration

## Repository structure

```text
resume-intelligence/
├── frontend/          React application
├── backend/           NestJS REST API
├── docker-compose.yml
├── .env.example
└── README.md
```

## Local development

Prerequisites: Node.js 22 or newer, npm 11 or newer, and Docker Desktop.

```bash
npm install
cp .env.example .env
npm run db:generate
docker compose up -d postgres
npm run db:migrate
npm run dev:frontend
npm run dev:backend
```

The frontend runs at `http://localhost:5173`. The backend runs at `http://localhost:3000/api`, and PostgreSQL is exposed on port `5432` by default.

### Database commands

```bash
npm run db:generate  # Generate the typed Prisma client
npm run db:migrate   # Create or apply development migrations
npm run db:studio    # Open the Prisma database browser
```

The initial migration is committed under `backend/prisma/migrations`. Production environments should apply committed migrations with `npm run prisma:deploy --workspace backend`.

### Authentication API

The backend exposes JWT authentication under `/api/auth`:

- `POST /register` creates an account and returns an access token.
- `POST /login` verifies credentials and returns an access token.
- `GET /me` returns the current user and requires `Authorization: Bearer <token>`.

Set a random `JWT_SECRET` containing at least 32 characters before starting the backend.

### Public resume analyzer

`POST /api/analysis/resume` accepts multipart form data without authentication:

- `resume`: required text-based PDF, maximum 5 MB
- `jobDescription`: optional text, maximum 12,000 characters

The backend extracts PDF text in memory and sends it to Groq using the model configured by `GROQ_MODEL`. Set `GROQ_API_KEY` only in the backend environment. Raw PDFs and extracted resume text are not persisted; only the structured analysis result and basic request metadata are stored.

### Resume builder API

Authenticated resume management is available under `/api/resumes`:

- `GET /` lists the current user's resumes.
- `POST /` creates a resume.
- `GET /:id` returns an owned resume with all sections.
- `PUT /:id` saves the complete builder state.
- `DELETE /:id` permanently removes an owned resume.

All endpoints require a bearer token and return `404` for resumes not owned by the authenticated user.

## Environment configuration

Copy `.env.example` to `.env` for local development. Frontend variables must use the `VITE_` prefix and must never contain secrets. LLM credentials and prompts will remain exclusively in the backend.

## Development phases

1. Monorepo initialization
2. Database and backend foundation
3. Authentication
4. Public resume analyzer
5. Resume builder
6. AI resume improvement
7. PDF export
8. Production hardening and documentation
