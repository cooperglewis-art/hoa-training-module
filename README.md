# HOA Training Module

Client-facing learning platform for HOA/POA/COA teams:
- Invite-based enrollment by organization
- Module + lesson progression
- Final assessment with pass threshold
- Certificate issuance and PDF download
- Org admin and super admin reporting views

## Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth + custom session cookie APIs
- Tailwind + Radix UI
- Playwright + Vitest

## Local Setup

1. Install dependencies:
```bash
npm ci
```

2. Copy env vars:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
npx prisma migrate deploy
```

4. Seed demo data:
```bash
npx tsx prisma/seed.ts
```

5. Start the app:
```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Key Environment Variables

- `DATABASE_URL`: PostgreSQL connection string.
- `NEXTAUTH_SECRET`: required session signing secret.
- `NEXTAUTH_URL`: canonical app URL.
- `NEXT_PUBLIC_APP_URL`: public app origin used in links.
- `NEXT_PUBLIC_APP_NAME`: client-facing product name.
- `NEXT_PUBLIC_LAW_FIRM_NAME`: law firm branding shown in UI/certificate/disclaimer.
- `RESEND_API_KEY`: email provider API key.
- `RESEND_FROM_EMAIL`: sender address for invites and certificates.

## Seed Accounts

All seed users use password: `password123`.

- Super Admin: `admin@example.com`
- Org Admin: `orgadmin@sunsetridge.com`
- Org Admin: `orgadmin@lakewood.com`
- Learner (completed): `learner1@example.com`
- Learner (in progress): `learner2@example.com`
- Learner (new): `learner3@example.com`

## Common Scripts

- `npm run dev`: start local dev server
- `npm run lint`: run ESLint
- `npm run test`: run unit tests
- `npm run test:e2e`: run Playwright tests
- `npm run build`: production build
- `npm run db:migrate`: create/apply local migration in dev
- `npm run db:seed`: run seed script

## Auth and Access Model

- Registration requires a valid invite token or valid org enrollment slug.
- Login requires at least one org membership.
- Middleware protects role-specific routes:
  - Learner: `/dashboard`, `/module/*`, `/assessment`, `/certificate/*`
  - Org Admin: `/org/*`
  - Super Admin: `/admin/*`
- Learners must acknowledge the disclaimer before continuing.

## Certificate Flow

1. Learner completes all modules.
2. Learner passes final assessment.
3. System creates course completion + certificate record.
4. Certificate PDF is generated and can be downloaded.
5. Certificate email is sent (best-effort, non-blocking).

## Deployment Notes

- Apply migrations in deployment (`prisma migrate deploy`) before booting app.
- Set all required env vars in the deployment platform.
- Ensure outbound email domain/SPF/DKIM is configured for `RESEND_FROM_EMAIL`.
- Run CI checks (`lint`, `type-check`, `tests`, `build`) before promoting.
