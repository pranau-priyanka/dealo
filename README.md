# Dealo web

Production foundation for Dealo: a responsive, local-deal discovery platform for web and PWA, with future iOS and Android clients consuming the same product APIs.

## Stack decision

- Next.js 16 App Router + React 19 + TypeScript: server rendering, route handlers, strong routing conventions and deploy-anywhere Node output.
- Tailwind CSS 4 + CSS design tokens: fast, consistent UI work without locking tokens to one component library.
- `next-intl`: explicit `en-GB` and `pt-PT` routes, browser-language negotiation and cookie persistence.
- Zod: runtime validation at system boundaries, starting with environment configuration.
- Vitest + Testing Library and Playwright: fast component feedback plus real browser and mobile-viewport coverage.
- ESLint + Prettier: automated code-quality and formatting gates.

Node.js 20.9+ is required; use the current active LTS in CI and production.

## Get started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The first request detects the browser's preferred language. Portuguese resolves only to `pt-PT`; all unsupported languages resolve to `en-GB`. A manual choice writes the `DEALO_LOCALE` cookie for one year and wins on future visits.

## Quality commands

```bash
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

## Structure

```text
messages/                 en-GB and pt-PT source messages
e2e/                      cross-browser user journeys
src/
  app/[locale]/            route groups and screens, including public deal discovery
  components/              shared shell and product components
    ui/                    design-system primitives
  i18n/                    locale routing, request and navigation policy
  features/                auth, deal discovery and saved-deal domain logic
  lib/                     framework-independent boundaries (auth, env)
  test/                    test setup and shared fixtures
  proxy.ts                 first-visit negotiation and locale cookie handling
```

Feature work should grow under `src/features/<feature>` when it gains domain state, API adapters or several components. Keep reusable visual primitives in `components/ui`; do not put domain logic there.

## Localisation policy

- Supported locales are exactly `en-GB` and `pt-PT`. Never add `pt-BR` content or Brazilian Portuguese terminology.
- URLs always carry a locale prefix (`/en-GB/...`, `/pt-PT/...`) for predictable sharing and indexing.
- The selector is present globally and at Profile → Settings → Language.
- A manual language choice is saved to the device immediately and to an authenticated profile when available.

## Guest access

Deal discovery is public. Visitors can search and view published, live deals without registering or signing in. Authentication is only required for personal actions: saving a deal and syncing profile settings across devices. After signing in or confirming a new account, visitors return to the deal they were viewing.

## Milestone 3: discovery and saving

- Public server-rendered deal listing, keyword search and detail routes
- Save and remove saved deals using the existing Supabase Row Level Security policy
- Guest-safe save prompts that preserve the intended return route through authentication
- Locale-aware expiry dates and fully translated `en-GB` and `pt-PT` discovery copy

There are currently no sample deals inserted into the production database.

## Milestone 4: merchant workspace

- Protected merchant workspace at `/{locale}/merchant`; signed-out visitors are returned to sign-in safely.
- Merchant onboarding creates one managed business workspace for the account.
- Merchant owners can add venues, create draft offers and move offers through the supported lifecycle: draft → published → paused/expired, and paused → published/expired.
- The existing Row Level Security policies remain the authorisation boundary: a merchant can only read or mutate its own venues and deals.
- `202608050003_add_deal_status_audit.sql` adds a merchant-visible audit table and trigger for every offer status change.

Apply the new migration before using status controls in a shared production environment. Merchant-created offers work without sample catalogue data; a published offer automatically becomes visible to guests only during its configured live window.

## Authentication boundary

Supabase authentication uses HTTP-only cookies on the server and browser, with an email/password sign-up and sign-in flow. `getCurrentUser` validates the session server-side; saved deals require an authenticated user. Session refresh is performed in `proxy.ts`, while `/auth/callback` exchanges confirmation codes using the PKCE flow.

### Connect Supabase

1. Create the Dealo project in Supabase and copy the project URL and publishable key from its **Connect** dialog.
2. Add them to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Run the SQL files in [supabase/migrations](supabase/migrations) in order in the Supabase SQL Editor, or link the project and run `supabase db push`.
4. In **Authentication → URL Configuration**, add your local and production URLs, including `http://localhost:3000/auth/callback` and `https://<production-domain>/auth/callback`.
5. Keep email confirmation enabled in production. No service-role key is used or exposed by this app.

The migrations create profiles, merchants, venues, deals, saved deals and deal-status audit events. Every public table has Row Level Security enabled. Published, current deals are public; profiles and saved deals are private to the authenticated owner; merchant content can be managed only by that merchant's owner.

## Product and engineering assumptions

1. Dealo is consumer-first; the initial shell prioritises discovery, saved deals and profile settings. Merchant tooling is a separate protected area, entered through **For merchants**.
2. Launch geography is not yet fixed. London and Lisbon text is illustrative only, not location logic.
3. Search covers the current public result set; geolocation consent, maps, payments and merchant onboarding remain future work.
4. The API contract will be client-agnostic so native iOS and Android apps can share capabilities with web/PWA.
5. PWA install metadata is included now. Offline caching and push notifications wait for explicit product and privacy requirements.
6. WCAG 2.2 AA is the target: semantic landmarks, skip navigation, visible focus and 44px minimum interactive controls start that baseline.

## Environment and secrets

`.env.example` documents browser-visible configuration. Never place secrets in `NEXT_PUBLIC_*`. Server-only credentials will be validated separately when backend integrations are added.

Do not commit `.env.local`, credentials, test reports or build output.
