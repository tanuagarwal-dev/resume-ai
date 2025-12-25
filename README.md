# RESUME AI

An AI-powered career assistant built with Next.js that helps users craft resumes and cover letters, practice interviews, and view industry insights. It integrates Clerk for authentication, Prisma with PostgreSQL (Neon) for persistence, Google Gemini for AI, and Inngest for scheduled background tasks.

## Features

- Resume builder with AI improvements
- Cover letter generator with role- and company-specific prompts
- Interview prep: multiple-choice quizzes and mock interview flow
- Industry insights dashboard (salary ranges, skills, trends) with scheduled refresh
- Authentication, onboarding, and protected routes via Clerk
- Dark mode by default + theme toggle in the header

## Tech Stack

- Frontend: Next.js 15 (React 19), Tailwind CSS, Radix UI, Lucide Icons
- Auth: Clerk
- ORM/DB: Prisma 6, PostgreSQL (Neon)
- AI: Google Generative AI (Gemini)
- Jobs: Inngest (cron-based background tasks)
- Utilities: Zod, React Hook Form, React Markdown, Recharts, Sonner

## Prerequisites

- Node.js 18+ (recommended 20)
- A PostgreSQL database (Neon recommended)
- Clerk account and app keys
- Google AI Studio API key for Gemini

## Environment Variables

Create a `.env` file in the project root with:

```
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=<your_google_ai_studio_api_key>
```


## Setup

Install dependencies and generate Prisma client:

```bash
npm install
npx prisma generate
```

Provision the database and apply migrations:

```bash
# Safe migration path
npx prisma migrate deploy

# Or to reset and sync with schema during development
npx prisma db push --force-reset --skip-generate
```

```bash
node prisma/seed.js
```

## Run

Start the dev server with Turbopack:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Key Modules

- `actions/resume.js`: save and retrieve resumes; AI improvement via Gemini
- `actions/cover-letter.js`: generate tailored cover letters
- `actions/interview.js`: quiz generation and results
- `actions/dashboard.js`: industry insights generation and retrieval
- `lib/prisma.js`: Prisma client singleton
- `middleware.js`: Clerk route protection; ensure matcher covers protected paths
- `lib/inngest/function.js`: scheduled insights refresh using Gemini

## AI Configuration

- Models are selected using currently available Gemini endpoints. If you see 404 or “API key expired”, renew your key in Google AI Studio.
- Recommended model: `models/gemini-2.5-flash` (supports `generateContent`).
- Handle AI response formats robustly (e.g., strip markdown fences, validate JSON before saving).

## Theme

- Dark mode is the default (`ThemeProvider` with `enableSystem={false}`) and a header toggle lets users switch between light/dark.

## Troubleshooting

- Clerk auth errors: Ensure `clerkMiddleware` is in `middleware.js` and the `matcher` includes protected routes (`/dashboard`, `/resume`, `/interview`, `/ai-cover-letter`, `/onboarding`).
- Prisma URL errors: Use `DATABASE_URL` in `.env`; avoid placing the URL in `schema.prisma` for Prisma 7+ (this project uses Prisma 6 and reads from env).
- Gemini 404 or expired key: Regenerate your key in AI Studio; use `models/gemini-2.5-flash`; confirm access by listing models.
- Inngest schedules: Confirm your cron worker is running and that DB writes succeed.

## Scripts

- `npm run dev` — Start Next.js dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `postinstall` — `prisma generate`

## Roadmap

- Centralize AI client with model auto-fallback
- Zod validation for AI JSON outputs
- Add rate limiting and caching for AI calls
- Seed data for quick demos
- CI with lint/build/test on PR

## License


