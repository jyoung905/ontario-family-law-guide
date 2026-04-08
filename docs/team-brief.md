# Ontario Family Law Guide — Full Project Brief
**Date:** April 6, 2026  
**For:** Internal team  
**Status:** Active development — Expo mobile app + Express API backend

---

## 1. What We're Building and Why

**Ontario Family Law Guide** is a mobile app for self-represented Ontarians navigating the family court system. The target user is someone who has just been served with court papers — or who is about to file — and cannot afford a lawyer, does not understand the legal documents in front of them, and is scared of making a costly procedural mistake.

The app's core emotional promise is **relief, clarity, and forward motion**. The product must make the user feel like they have a knowledgeable guide next to them, not a legal robot.

**Primary revenue model:** $60 one-time purchase (not a subscription) that unlocks AI document drafting — court form generation, affidavit builder, and a filing package. This is positioned as "the work lawyers usually charge for," making the price feel like a fraction of the alternative.

**Core conversion thesis:** Users who see the AI work for them for free (document analysis, plain-language explanations, personalized next steps) are far more likely to pay to unlock the drafting tools. The free tier must feel genuinely useful, not crippled.

---

## 2. Full Feature Inventory

### Free Tier (no account required)

| Feature | Where | Description |
|---|---|---|
| **Intake wizard** | Home tab | 3 questions: user role, case issues (multi-select), urgency. Builds a personalized case guide. |
| **Personalized case guide** | My Case → Overview | Role-specific deadline alert, next action card, situation summary, consequence warning — all generated from intake answers. |
| **Document analysis** | My Case → Overview | User pastes text from any court document → AI returns: document type, critical deadline, confidence level (high/medium/low), plain-language summary, and numbered next steps. Free. Powered by gpt-4o. |
| **AI-assisted labels** | My Case → Overview + Checklist | "AI-ASSISTED SUMMARY" badge with sparkle icon, "Generated from your answers" note, "AI-SUGGESTED NEXT STEPS" badge — visible signals that AI is actively working for the user. |
| **Case issues pills** | My Case → Overview | Shows the specific issues the user selected (Parenting & custody, Support, Property, Protection order) as visual tags in the situation summary. |
| **Personalized checklist** | My Case → Checklist | Role-specific action checklist with progress bar. First 3 steps are labeled as AI-suggested. Expandable. |
| **Documents to gather** | My Case → Checklist | Checkable list of required documents for the user's specific scenario. |
| **Deadline tracker** | Timeline tab | Add, view, and track upcoming court deadlines. Persisted locally via AsyncStorage. |
| **AI chat assistant** | My Case → Ask button | Plain-language family law Q&A. Streaming responses. System prompt tuned for Ontario-specific context: form numbers, deadlines, duty counsel, Legal Aid. |
| **Legal resources** | My Case → Support tab | Duty Counsel, Legal Aid Ontario, FLIC, Steps to Justice — with phone numbers and plain descriptions. |
| **Safety resources** | My Case → Support tab | Behind a tap-to-reveal toggle. Ontario Victim Support Line, Shelter Safe. Never forced on users. |
| **More screen** | More tab | Settings, app info, premium row, "MY CASE" section (visible post-onboarding) with full reset + confirmation modal. |
| **SEO pages (web)** | /api/landing, /api/learn/*, /api/guides/* | Server-rendered marketing pages, glossary (20 terms), court form guides (6 forms) with structured schema markup. XML sitemap included. |

### Premium Tier — $60 One-Time

| Feature | Description |
|---|---|
| **AI Court Form Drafter** | Generates a structured draft of Form 10, 14B, 35.1, 13, etc. from the user's facts. Streamed response. All placeholders clearly marked. Legal disclaimer appended. |
| **Affidavit Builder** | Structured affidavit outline following Form 14A conventions for Ontario Superior Court. Numbered paragraphs, exhibit suggestions, deponent info. |
| **Filing Package** | (Framed in UI — full implementation to come) Combines drafted forms into a cohesive filing package. |
| **Communication Coach** | Draft or review messages to the other party. AI flags language that could harm the user's case (⚠️ FLAG markers). Suggests professional rewording. |

The paywall headline reads: **"Prepare your documents yourself."** — positioned against paying a lawyer, not against doing nothing.

---

## 3. The Homepage (Public Landing — New Users)

The homepage is the first screen a new user sees. It is built to do three things in order:

1. **Establish relevance immediately** — "Understand your family court documents. Know what to do next."
2. **Demonstrate value before asking anything** — three fast benefit bullets
3. **Get the user into the intake wizard** — the CTA scrolls directly to the wizard with no friction

### Structure (top to bottom)

1. **ONTARIO FAMILY LAW** label (Manrope, uppercase, muted)
2. **Hero headline** — "Understand your family court documents. Know what to do next." (Newsreader serif, 30px)
3. **Sub** — "Plain-language Ontario family law help for people who can't afford to be confused." (Inter, muted)
4. **Benefit bullets** (3 rows, each with icon):
   - See what the document likely means
   - Understand your next deadline
   - Draft the forms and materials you may need
5. **Primary CTA** — "Get started — it's free" (dark primary background, full width, scrolls to intake)
6. **Founder trust block** — "Built by someone who went through Ontario family court self-represented and knows exactly how costly confusion can be." — Founder (bordered left accent, serif text)
7. **Free vs Premium comparison table** (side-by-side columns)
8. **Trust bar** — "Designed for Ontario family court · Plain language · Not a law firm"
9. **Intake wizard** — 3-step form (role → issues → urgency)
10. **Legal disclaimer** — General information only, not legal advice.

### Returning User View
When the user has completed intake (`hasOnboarded = true`), the home screen switches to a clean **"Welcome back."** view with three action cards: Resume my case, See my deadline, Upload or review documents.

---

## 4. My Case Screen

This is the central hub of the app. It has three sub-tabs:

### Overview Tab

**Document Analysis Card (new, top of screen)**
- Collapsed by default — shows icon + "Analyze a court document" with description
- Tap to expand → TextInput for pasting document text (minimum 20 characters to enable button)
- "Analyze document" button → calls `POST /api/family-law/analyze-document`
- Results display:
  - "We analyzed your document" banner with sparkle
  - Document type badge (primary color)
  - Confidence pill (green = high, amber = medium, red = low)
  - Deadline pill in red (only shown if a deadline is detected)
  - Plain-language summary paragraph
  - Numbered next steps (1, 2, 3…)
  - "Analyze another document" reset link

**Situation Summary (below the main action cards)**
- Left accent bar in urgency color
- "YOUR SITUATION" label + "AI-ASSISTED" sparkle badge (right-aligned)
- Role-specific summary text (Newsreader)
- Case issues as pills (from intake step 2 answers)
- "Generated from your answers" footer note (small, muted)

**Urgency / Deadline card** — shows most pressing deadline with time remaining  
**Next Action card** — primary call-to-action in dark primary color  
**Consequence card** — what happens if the user does nothing (small, bottom)

### Checklist Tab

- Progress bar (% complete, done/total count)
- "AI-SUGGESTED NEXT STEPS" label with sparkle icon above the step list
- First 3 steps visible by default, "View full checklist" expand
- Locked premium steps shown as blurred rows with "$60 ONE-TIME" unlock badge (non-subscribers)
- "Documents to gather" checkable list below
- All check state is local (not persisted to server)

### Support Tab

- Legal help resources (Duty Counsel, Legal Aid, FLIC, Steps to Justice)
- Safety resources behind a tap-to-reveal (never forced)
- Contextual premium card for non-subscribers at the bottom

---

## 5. Paywall Screen (`/paywall`)

**Headline:** "Prepare your documents yourself."  
**Sub:** "Reduce the risk of procedural errors that cost people their cases."

Three primary premium features (full visual weight):
1. Draft your court forms (Form 10, 14B, 35.1)
2. Build your affidavit chronology
3. Generate a complete filing package

Communication Coach shown at 65% opacity — tertiary feature, not the lead.

**Price:** $60 one-time (not a subscription)  
**CTA:** "Unlock for $60 — no subscription"  
**Trust copy below CTA:** "One payment. Used across your entire case. No recurring charges."

Payment is processed through RevenueCat. On web (development), the SDK runs in browser mode with a test store key.

---

## 6. Design System — "The Guided Sanctuary"

The visual language is calm, authoritative, and warm — designed to reduce anxiety in users who are in high-stress situations. Inspired by premium legal publications, not legal tech SaaS.

| Token | Value | Use |
|---|---|---|
| `primary` | `#002631` (Midnight Teal) | Headers, primary buttons, key UI |
| `surface` | `#fcf9f2` (Warm Sand) | Page backgrounds |
| `tertiary` | `#450e09` (Grounded Coral) | CTAs, progress fills, active states |
| `surfaceContainerLow` | Tonal teal-sand blend | Card backgrounds |
| `surfaceContainerHigh` | Slightly deeper | Dividers, track backgrounds |
| `mutedForeground` | Muted teal-grey | Sub-labels, supporting text |

**Typography:**
- **Newsreader** (serif, Google Fonts) — page headlines, form questions, situation summaries. Communicates authority and calm.
- **Inter** — body text, item labels, descriptive copy.
- **Manrope** — UI labels, badges, metadata. `700Bold` for uppercase tags, `600SemiBold` for mid-weight labels.

**Key rules:**
- No hard 1px borders on containers — depth is created through background color shifts only
- Border radius: 18–24px for cards, 100px for pills and buttons
- Shadows: very soft, tinted with primary (4–12% opacity, 16–32px blur)
- Dark mode fully supported with a complementary dark teal palette

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | pnpm workspaces |
| **Mobile app** | Expo SDK 54, Expo Router v6, React Native |
| **API backend** | Express 5, TypeScript, Node.js 24 |
| **AI** | OpenAI gpt-4o — streaming chat, JSON-mode document analysis, streaming document drafts |
| **Payments** | RevenueCat SDK (`react-native-purchases`) |
| **Persistence** | AsyncStorage (local, mobile-only — no server-side user accounts) |
| **Build** | esbuild (API), Metro (Expo) |
| **Fonts** | Expo Google Fonts (Newsreader, Inter, Manrope) |
| **Icons** | @expo/vector-icons (Ionicons) |
| **Safe area** | react-native-safe-area-context |

**No user accounts.** The app is fully local — all state (intake answers, checklist progress, deadlines) is stored in AsyncStorage on the device. This was a deliberate privacy and friction decision: users don't need to sign up to get value.

---

## 8. API Endpoints

**Base URL:** `https://{domain}/api`

### Free Endpoints

| Method | Path | Request Body | Response |
|---|---|---|---|
| `POST` | `/family-law/chat` | `{ messages: [], systemContext?: string }` | Server-sent events (streaming text) |
| `POST` | `/family-law/analyze-document` | `{ documentText: string, userRole?: string }` | JSON: `{ documentType, deadline, confidence, summary, nextSteps[] }` |

**analyze-document details:**
- Uses gpt-4o with `response_format: { type: "json_object" }` for structured output
- `confidence` is `"high"`, `"medium"`, or `"low"` — displayed as a color-coded pill in the UI
- If confidence is low or document is unrecognized, server logs: `[analyze-document] LOW CONFIDENCE / TEMPLATE FALLBACK`
- Input is truncated to 4,000 characters
- Returns `"No deadline detected"` in the deadline field when none is found

### Premium Endpoints (require no auth header — gated by RevenueCat in the app)

| Method | Path | Request Body | Response |
|---|---|---|---|
| `POST` | `/family-law/premium/draft-document` | `{ formType, userFacts, userRole? }` | Streaming SSE — full drafted form |
| `POST` | `/family-law/premium/affidavit` | `{ facts, userRole? }` | Streaming SSE — affidavit outline |
| `POST` | `/family-law/premium/coach-message` | `{ situation, draftMessage? }` | Streaming SSE — coached message |

All streaming endpoints append a legal disclaimer to the final SSE `done` event.

### SEO / Marketing Endpoints

| Path | Description |
|---|---|
| `GET /api/landing` | Server-rendered marketing landing page |
| `GET /api/learn` | Glossary index (20 Ontario family law terms) |
| `GET /api/learn/:slug` | Individual glossary term with `DefinedTerm` + `FAQPage` schema |
| `GET /api/guides` | Court form guides index (6 forms) |
| `GET /api/guides/:slug` | Step-by-step form guide with `HowTo` schema |
| `GET /api/sitemap.xml` | XML sitemap (29 URLs) |
| `GET /api/robots.txt` | Robots.txt |

---

## 9. Key Files

```
artifacts/
  ontario-family-law/
    app/
      (tabs)/
        index.tsx          — Homepage (landing + returning user view + intake wizard)
        my-case.tsx        — My Case screen (Overview, Checklist, Support tabs)
        _layout.tsx        — Tab bar layout (Home, My Case, Timeline, Draft, More)
        more.tsx           — Settings, reset case, premium row
      paywall.tsx          — Paywall screen
    context/
      AppContext.tsx        — Global state: userRole, caseIssues[], deadlines, hasOnboarded, resetCase()
    hooks/
      useColors.ts         — Design system color tokens (light/dark)
    lib/
      revenuecat.ts        — useSubscription() hook, RevenueCat initialization

  api-server/
    src/
      routes/
        family-law/
          index.ts         — /chat and /analyze-document endpoints
          premium.ts       — /draft-document, /affidavit, /coach-message endpoints
        seo.ts             — All SEO/SSR routes
      ssr/                 — Server-rendered HTML page templates
      index.ts             — Express app setup, middleware, route mounting
```

---

## 10. RevenueCat Configuration

- **Project ID:** `proj751469a0`
- **Entitlement:** `premium`
- **Product ID:** `premium_monthly`
- **Price in UI:** $60 one-time (note: the RevenueCat product was originally set up as monthly — the UI copy reads $60 one-time but the actual product configuration in RevenueCat should be reviewed before App Store submission)
- **API keys:** stored in Replit Secrets as `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- **SDK on mobile:** `react-native-purchases@9.7.2`
- **Browser mode:** RevenueCat runs in test/browser mode on web — for production, native mobile is required for real purchases

---

## 11. App Context (Global State)

`AppContext.tsx` is the single source of truth for all user state. It uses `useReducer` + `AsyncStorage` for persistence.

| State field | Type | Description |
|---|---|---|
| `userRole` | `string \| null` | "served", "serving", or "other" — set in intake step 1 |
| `caseIssues` | `string[]` | Intake step 2: ["custody", "support", "property", "protection"] |
| `hasOnboarded` | `boolean` | True once the intake wizard is complete |
| `deadlines` | `Deadline[]` | User-added court deadlines |
| `messages` | `Message[]` | AI chat message history |

**Reset:** `resetCase()` wipes all state and AsyncStorage — used on the More screen with a confirmation modal. The user sees a red "Start a new case" button that requires explicit confirmation before clearing.

---

## 12. Ontario Family Law Context in the AI

The system prompt for the chat assistant is tuned specifically for Ontario:

- Always cites form numbers (Form 8, 10, 14B, 35.1, 13, etc.)
- Explains deadlines: 30-day window to file Form 10 Answer after being served
- Defines: affidavit, service, case conference, FRO
- Mentions: Legal Aid Ontario (1-800-668-8258), Duty Counsel, FLICs, Steps to Justice
- Warns about "noted in default" — what happens if you miss your response deadline
- Every response ends with a one-sentence reminder to seek legal advice
- Never gives legal advice — only legal information

---

## 13. What Was Built Today (April 6, 2026)

### Homepage Redesign
Completely rewrote the public landing page for new users. Old version had generic "How it works" framing. New version leads with the specific pain point ("family court documents"), shows immediate value before asking for anything, and positions the app against the cost of confusion — not against other apps.

Changes:
- New hero copy: "Understand your family court documents. Know what to do next."
- Sub: "Plain-language Ontario family law help for people who can't afford to be confused."
- 3 benefit bullets with icons (See what the document likely means / Understand your next deadline / Draft the forms you may need)
- Primary CTA "Get started — it's free" → scrolls to intake wizard via onLayout ref
- Founder trust block (serif quote, left border accent)
- Free vs Premium table kept and updated
- Trust bar below the table
- "Start Here" intake section relabeled, lead text added

### My Case — AI Visibility

**Overview tab:**
- New document analysis card (first element in the tab)
  - Expandable with TextInput for pasting document text
  - Calls `POST /api/family-law/analyze-document`
  - Shows: "We analyzed your document" banner, document type badge, confidence pill (color-coded), deadline pill (red, conditional), plain-language summary, numbered next steps
  - Reset link to analyze another document
- Situation summary card updated:
  - "AI-ASSISTED" sparkle badge added (right-aligned, next to "YOUR SITUATION" label)
  - Case issues pills showing the specific issues from intake
  - "Generated from your answers" note at bottom of card

**Checklist tab:**
- "AI-SUGGESTED NEXT STEPS" label with sparkle icon added above the visible step list

### New API Endpoint — `/api/family-law/analyze-document`
- Method: POST
- Auth: none (free feature)
- Input: `{ documentText: string, userRole?: string }`
- Uses: gpt-4o with `response_format: { type: "json_object" }`
- Output: `{ documentType, deadline, confidence, summary, nextSteps[] }`
- Logging: Warns with `[analyze-document] LOW CONFIDENCE / TEMPLATE FALLBACK` when confidence is low, so the team can monitor for generic/unhelpful outputs
- Input capped at 4,000 characters

---

## 14. What Is Not Yet Built

| Item | Priority | Notes |
|---|---|---|
| **Native file upload** (PDF/image) | High | Currently users paste document text — actual file upload requires PDF parsing library (e.g., `pdf-parse`) + React Native file picker |
| **Real RevenueCat product configuration** | High | Product `premium_monthly` should be changed to a one-time purchase before App Store submission. Confirm pricing in RevenueCat dashboard. |
| **Server-side user accounts** | Low | All state is local. If users switch devices they lose everything. Potential future feature. |
| **Draft tab full UI** | Medium | Draft tab in nav has a premium dot but the underlying drafting screen is minimal — needs a full form selection UI |
| **Push notifications for deadlines** | Medium | Timeline tab tracks deadlines but doesn't send reminders |
| **App Store submission** | Next step | Expo config (`app.json`) should be reviewed for bundle ID, icons, splash screen before submitting |

---

## 15. Running the Project

Two services need to be running:

```bash
# API server (Express, port assigned by Replit)
pnpm --filter @workspace/api-server run dev

# Mobile app (Expo, Metro bundler)
pnpm --filter @workspace/ontario-family-law run dev
```

**Required secrets (set in Replit):**
- `familylawapi` — OpenAI API key
- `SESSION_SECRET` — Express session secret
- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` — RevenueCat test key
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` — RevenueCat iOS key
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` — RevenueCat Android key
- `EXPO_PUBLIC_DOMAIN` — set automatically by Replit to the workspace domain

**Typecheck:**
```bash
pnpm run typecheck
```

---

*This document was generated on April 6, 2026 and reflects the current state of the codebase as of commit `cb4430f`.*
