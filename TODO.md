# CCR Enforcement Training — MVP Checklist

## Priority 1 — Must complete before showing externally

### 1. Unify Auth/Session (CRITICAL — causes redirect loop / flickering)
- [x] Remove the split between NextAuth and the custom JWT cookie path
- [x] Make one system the source of truth for authentication
- [x] Ensure middleware, server components, and client session state all read from the same system
- [x] Fix infinite redirect loop on homepage (GET / and /api/auth/session cycling)

### 2. Fix Content Schema End-to-End
- [x] Define one canonical lesson JSON schema (content is plain `ContentBlock[]` array)
- [x] Update seed data field names to match canonical schema (prose→html, callout→body, etc.)
- [x] Update TypeScript types to match (removed `LessonContent` wrapper)
- [x] Update content loader to normalize both formats
- [x] Update lesson page to use array directly

### 3. Lock Onboarding to Org Context
- [x] Require invite token or org enrollment link for registration
- [x] Block naked self-registration with no org (API returns 400)
- [x] Register page shows informational message directing to org admin
- [ ] Decide whether MVP supports one org per user only

### 4. Replace Placeholders & Write Real README
- [ ] Replace `[LAW FIRM NAME]` placeholder throughout codebase
- [ ] Add setup instructions, env vars, seed accounts
- [ ] Add auth architecture notes
- [ ] Add deployment steps
- [ ] Add content schema documentation

### 5. Legal/Content QA Pass
- [ ] Freeze first course version
- [ ] Review every lesson and question for Texas legal accuracy
- [ ] Verify all statute references (Ch. 202, 209, 82) are current
- [ ] This is a law-firm product — content risk is as important as code risk

### 6. Minimum Security Protections
- [x] Rate limit login (10/min), register (5/min), and forgot-password (5/min) endpoints
- [ ] Add CSRF protection if keeping custom login endpoint
- [x] Remove all production fallback to "dev-secret" (now uses NEXTAUTH_SECRET!)
- [x] Sanitize HTML content before rendering (ProseBlock uses DOMPurify)
- [ ] Move database password to proper secret manager
- [x] Set `secure: true` on session cookie in production (already conditional on NODE_ENV)

### 7. One True Acceptance Test
- [x] E2E test covers: login → disclaimer → complete modules → assessment → certificate → org admin verification
- [x] Uses seeded test data (learner2, orgadmin)
- [ ] Verify test passes end-to-end against running app

### 8. Deployable Database Workflow
- [x] Switch from `prisma db push` to `prisma migrate` (initial migration created and applied)
- [ ] Set up deploy environment variables
- [x] Add CI pipeline (GitHub Actions: lint, type-check, test, build, e2e)

---

## Priority 2 — Soon after MVP, not a blocker for first pilot

### Org Admin Experience
- [ ] Better empty states for admin pages
- [ ] Bulk invite / CSV upload
- [ ] Richer learner progress export (per-lesson completion times)

### Certificate Polish
- [ ] Better visual PDF template (currently generated with pdf-lib drawing only)
- [ ] Long-name overflow handling
- [ ] Optional verification page / QR code

### Mobile & Accessibility
- [ ] Mobile breakpoint testing (iPhone/iPad)
- [ ] Keyboard support for interactive blocks (drag-drop-match)
- [ ] WCAG 2.1 AA accessibility audit

### Operational Visibility
- [ ] Structured logging (JSON logs)
- [ ] Error monitoring (Sentry or similar)
- [ ] Analytics (PostHog, Mixpanel, or similar)
- [ ] Database backups

---

## Not MVP — Do not let these slow you down
- OAuth / enterprise SSO
- Org billing / subscriptions
- Dashboard charts (completion over time, pass rates)
- Super admin impersonation tools
- Public certificate verification page
- Block-editor UX for content authoring
- Dark mode toggle polish
- Confetti / extra animations
- Lesson bookmarking
- Assessment timer
- Content versioning notifications
