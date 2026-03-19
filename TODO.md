# CCR Enforcement Training — Remaining TODO

## Security
- [ ] Replace `[LAW FIRM NAME]` placeholder with actual firm name throughout codebase
- [ ] Move database password out of connection string and into a proper secret manager
- [ ] Add rate limiting to login, registration, and password reset endpoints
- [ ] Add CSRF protection to custom `/api/auth/login` route (currently bypasses NextAuth CSRF)
- [ ] Set `secure: true` on session cookie in production (currently only in `NODE_ENV=production`)
- [x] Add Content-Security-Policy headers
- [ ] Audit all `dangerouslySetInnerHTML` usage in ProseBlock — sanitize HTML content from DB
- [ ] Add input sanitization on all admin content editor inputs
- [ ] Implement account lockout after N failed login attempts
- [ ] Add email verification flow (currently `emailVerified` field is unused)
- [ ] Rotate `NEXTAUTH_SECRET` / JWT signing key on a schedule
- [x] Remove `/debug` page before production deployment
- [ ] Add Supabase Row-Level Security policies for multi-tenant data isolation
- [x] Ensure certificate download route validates org membership (not just user ownership)

## Auth & Session
- [ ] Session refresh: JWT doesn't update when role/org changes — add periodic refresh or short expiry with refresh token
- [ ] Register flow: users who register without an invite/org link have no membership — add org selection step or block direct registration
- [x] Add "Remember me" option on login (shorter vs longer JWT expiry)
- [x] Password strength meter on registration form
- [ ] Add OAuth providers (Google, Microsoft) for enterprise SSO

## UI/UX Polish
- [ ] Add loading skeletons for all server component pages (currently blank while loading)
- [x] Add breadcrumb navigation on lesson pages showing Module > Lesson
- [ ] Improve mobile responsiveness — test on iPhone/iPad breakpoints
- [ ] Add keyboard navigation support for drag-drop-match exercises
- [ ] Add progress save indicator ("Your progress is saved") on lesson pages
- [ ] Animate module unlock transitions on dashboard
- [ ] Add confetti animation on assessment pass (currently only in result-animation component, verify it renders)
- [ ] Toast notifications for success/error states on all forms
- [x] Add "Back to Dashboard" button on all inner pages
- [ ] Dark mode support (CSS variables are set up but no toggle exists)
- [x] Add print-friendly styles for certificate page
- [ ] Improve empty states for admin pages with no data

## Content & Learning
- [ ] Review all lesson content for legal accuracy with actual Texas attorney
- [x] Add estimated reading time per lesson
- [ ] Add lesson bookmarking / "pick up where you left off"
- [ ] Module progress should prevent skipping lessons within a module (enforce linear order)
- [ ] Add "Knowledge Check" review mode — let learners re-take in-lesson quizzes without resetting progress
- [ ] Make checkpoint blocks actually gate the "Next" button (verify CheckpointBlock integration)
- [ ] Add downloadable resources (PDF checklists, reference guides) per module
- [ ] Add glossary of legal terms
- [ ] Content versioning: show learners when content has been updated since they last viewed it

## Assessment
- [x] Randomize question order and answer option order per attempt
- [ ] Add timer option for assessment (configurable by admin)
- [x] Prevent browser back-button during assessment attempt
- [x] Add "Are you sure?" confirmation before submitting assessment
- [ ] Track time spent per question for analytics

## Certificate
- [ ] Design a proper PDF template background image (currently generated entirely with pdf-lib drawing)
- [ ] Add QR code to certificate linking to verification page
- [ ] Create public certificate verification page (`/verify/[serialNumber]`)
- [ ] Test certificate PDF rendering with long names / org names (text overflow)

## Email
- [ ] Set up actual Resend account and configure sending domain
- [ ] Design HTML email templates with proper responsive layout
- [ ] Add email unsubscribe link for non-transactional emails
- [ ] Test certificate email attachment delivery (PDF size limits)
- [ ] Add retry logic for failed email sends

## Admin
- [ ] Content editor: replace raw JSON textarea with a visual block editor (drag/drop blocks)
- [ ] Add bulk invite upload (CSV import) for org admins
- [ ] Add learner progress export with more detail (per-lesson completion times)
- [ ] Add dashboard charts (completion over time, pass rates) using a charting library
- [ ] Add ability for super admin to impersonate a learner for debugging
- [ ] Add org billing/subscription management (if monetized)
- [ ] Add email notification preferences per org

## Infrastructure & DevOps
- [ ] Set up Vercel deployment with environment variables
- [ ] Configure Supabase connection pooling (use pooler URL for serverless)
- [ ] Add database migrations (currently using `db push` — switch to `prisma migrate` for production)
- [ ] Set up CI/CD pipeline (GitHub Actions: lint, type-check, test, build)
- [ ] Add error monitoring (Sentry or similar)
- [ ] Add analytics (PostHog, Mixpanel, or similar)
- [ ] Set up database backups
- [x] Add health check endpoint
- [ ] Configure proper logging (structured JSON logs)
- [ ] Load testing for concurrent assessment submissions

## Testing
- [ ] Add E2E tests that run against seeded database (currently tests may fail without DB)
- [ ] Add unit tests for session.ts JWT encode/decode
- [ ] Add integration tests for login → dashboard → module → lesson → assessment flow
- [ ] Add visual regression tests for certificate PDF output
- [ ] Test multi-tenant isolation (learner in Org A cannot see Org B data)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Cross-browser testing (Safari, Firefox, Edge)

## Performance
- [x] Add database indexes for common queries (userId+moduleId on ModuleProgress, etc.)
- [ ] Cache course structure data (doesn't change often)
- [ ] Optimize lesson content loading — only fetch published version
- [ ] Add ISR (Incremental Static Regeneration) for public pages
- [ ] Lazy load interactive lesson components (drag-drop, knowledge-check)
