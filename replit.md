# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains an Ontario Family Law Guide mobile app (Expo) and a shared Express API backend.

## Artifacts

- **ontario-family-law** (`artifacts/ontario-family-law/`) — Expo mobile app, preview path: `/`
  - **Homepage** — "OPEN BETA" badge + hero + scope clarity card (what it does / doesn't do) + "Build my case guide — free" CTA; 4-step intake wizard (role w/ "Not sure" + sub-role picker, needs multi-select w/ "Not sure yet", urgency, branch confirmation screen) → sets `userRole` + `caseIssues[]`; FREE vs PREMIUM comparison moved below the intake wizard
  - **Tab bar** — 5 tabs: Home | My Case | Timeline | Draft | Resources (Resources promoted from "More" → visible tab)
  - **My Case / Overview tab** — Document analysis card (paste doc text → AI identifies form type, deadline, confidence, next steps); "AI-ASSISTED SUMMARY" label on situation block; caseIssues pills; "Generated from your answers" note
  - **My Case / Checklist tab** — "AI-SUGGESTED NEXT STEPS" sparkle badge above first 3 steps
  - AI-powered family law assistant chat (streams from backend)
  - Deadline tracker with local persistence (AsyncStorage)
  - Ontario court forms reference (Form 8, 10, 14, 35.1, 13, etc.)
  - Legal resources directory with links to Legal Aid, FRO, Steps to Justice
  - **Premium features (gated by RevenueCat — $60 one-time):**
    - AI Document Drafter — generates Form 10, 14B, 15B, 35.1, 13 drafts from user facts
    - Affidavit Builder — structured affidavit outline from user's facts
    - Communication Coach — draft/review messages to other party with case-harm flagging
    - Paywall screen at `/paywall`
- **api-server** (`artifacts/api-server/`) — Express 5 API backend, preview path: `/api`
  - `/api/family-law/chat` — Streaming AI chat endpoint using OpenAI (gpt-4o)
  - `/api/family-law/analyze-document` — FREE AI document analysis (gpt-4o JSON mode): takes `documentText`, returns `{ documentType, deadline, confidence, summary, nextSteps[] }`; logs LOW CONFIDENCE / TEMPLATE FALLBACK when confidence is low
  - `/api/family-law/premium/draft-document` — AI document draft generation (premium)
  - `/api/family-law/premium/affidavit` — AI affidavit outline generation (premium)
  - `/api/family-law/premium/coach-message` — AI communication coaching (premium)
  - **Programmatic SEO / SSR pages** (`src/ssr/`, `src/routes/seo.ts`):
    - `/api/landing` — CRO-optimized marketing landing page (server-rendered, Googlebot-crawlable)
    - `/api/learn` — Ontario family law glossary index (20 terms)
    - `/api/learn/:slug` — Individual term pages with `DefinedTerm` + `FAQPage` schema
    - `/api/guides` — Court form guides index (6 forms)
    - `/api/guides/:slug` — Individual form guides with `HowTo` + `FAQPage` schema + step-by-step instructions
    - `/api/sitemap.xml` — XML sitemap (29 URLs, dynamically generated)
    - `/api/robots.txt` — Robots.txt pointing to sitemap

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: Expo SDK 54, Expo Router v6
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (not used in mobile-first build)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **AI**: OpenAI gpt-4o via user-provided `familylawapi` secret key
- **Payments**: RevenueCat (connected integration) — entitlement: `premium`, product: `premium_monthly` ($9.99/month)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts exec tsx src/seedRevenueCat.ts` — seed RevenueCat (idempotent)

## Design System — "The Guided Sanctuary"

Editorial, warm, dignified aesthetic inspired by premium legal publications.

- **Primary**: `#002631` (Midnight Teal) — authority elements, headlines
- **Background/Surface**: `#fcf9f2` (Warm Sand) — base layer, breathable warmth
- **CTA/Tertiary**: `#450e09` (Grounded Coral) — primary actions, active states, progress
- **Surface hierarchy**: `surface` → `surfaceContainerLow` → `surfaceContainerLowest` (depth through tonal shifts, no 1px borders)
- **No-line rule**: Containers defined by background color shifts, not borders
- **Fonts**: Newsreader (serif, 400–700 + italics) for headlines, Inter for body, Manrope for labels/badges
- **Border radius**: 20–32px (nothing sharp — `xl` to `full`)
- **Ambient shadows**: Very soft, tinted with primary (opacity 4–12%, blur 16–32px)
- Dark mode supported with complementary teal-based dark palette

## RevenueCat Configuration

- Project: `proj751469a0`
- Entitlement: `premium`
- Product: `premium_monthly` at $9.99/month (P1M duration)
- Test Store API Key: `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`
- iOS API Key: `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- Android API Key: `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- Client SDK: `react-native-purchases@9.7.2` (in mobile app)
- Server SDK: `@replit/revenuecat-sdk@4.0.0` (in workspace root)

## Ontario Family Law Features

- Plain-language AI assistant with Ontario-specific context (system prompt)
- Form numbers: Form 8/8A, 10, 14/14A/14B, 15/15A/15B, 35.1, 13/13.1
- Deadlines: 30-day Form 10 deadline, default/noted-in-default explanation
- Definitions: affidavit, service, case conference, FRO
- Resources: Legal Aid Ontario, Duty Counsel, FLICs, Steps to Justice, FRO, Law Society
- Privacy: no permanent storage, users advised to redact personal info
- All AI-generated content includes legal disclaimer

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
