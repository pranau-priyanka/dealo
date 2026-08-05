# Dealo web

Milestone 1 production foundation for Dealo: a responsive, local-deal discovery platform for web and PWA, with future iOS and Android clients consuming the same product APIs.

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
  app/[locale]/            route groups and screens
  components/              shared shell and product components
    ui/                    design-system primitives
  i18n/                    locale routing, request and navigation policy
  lib/                     framework-independent boundaries (auth, env)
  test/                    test setup and shared fixtures
  proxy.ts                 first-visit negotiation and locale cookie handling
```

Feature work should grow under `src/features/<feature>` when it gains domain state, API adapters or several components. Keep reusable visual primitives in `components/ui`; do not put domain logic there.

## Localisation policy

- Supported locales are exactly `en-GB` and `pt-PT`. Never add `pt-BR` content or Brazilian Portuguese terminology.
- URLs always carry a locale prefix (`/en-GB/...`, `/pt-PT/...`) for predictable sharing and indexing.
- The selector is present globally and at Profile → Settings → Language.
- User-profile synchronisation is deferred until authenticated profiles exist; the device cookie is the Milestone 1 persistence layer.

## Authentication boundary

Login and registration routes, translated states, and the `getCurrentUser` server contract are present but deliberately disabled. Milestone 2 should select and integrate an OpenID Connect provider, add session-backed route protection and sync locale preference to the user profile. No mock credentials or insecure local auth are shipped.

## Product and engineering assumptions

1. Dealo is consumer-first; the initial shell prioritises discovery, saved deals and profile settings. Merchant tooling will be a separate protected area.
2. Launch geography is not yet fixed. London and Lisbon text is illustrative only, not location logic.
3. Deal inventory, geolocation consent, search, maps, payments and merchant onboarding are outside Milestone 1.
4. The API contract will be client-agnostic so native iOS and Android apps can share capabilities with web/PWA.
5. PWA install metadata is included now. Offline caching and push notifications wait for explicit product and privacy requirements.
6. WCAG 2.2 AA is the target: semantic landmarks, skip navigation, visible focus and 44px minimum interactive controls start that baseline.

## Environment and secrets

`.env.example` documents browser-visible configuration. Never place secrets in `NEXT_PUBLIC_*`. Server-only credentials will be validated separately when backend integrations are added.

## Repository information needed next

This workspace had no repository, so `create-next-app` initialised a local Git repository in `dealo-web`. To publish it, engineering needs:

- Git hosting organisation and target repository name/URL
- default branch and branch-protection rules
- CI provider and required checks (`lint`, `typecheck`, unit, build, e2e)
- deployment target, environments and owning cloud account
- code owners and security/contact policy

Do not commit `.env.local`, credentials, test reports or build output.
