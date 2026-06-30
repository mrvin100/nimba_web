<!-- BEGIN:nimba-web-context -->
# Nimba — Frontend Service (AI Agent Instructions)

Web client for Nimba, the internal banking credit-case platform (codename Prodigy).
Next.js 16 (App Router) + TypeScript, consuming the versioned REST API from the sibling
`app/` backend. `docs/nimba-mvp-backlog.md` is the source of truth; read the relevant
`NIMBA-<n>` story in full before implementing.

> **Architecture & patterns** follow the sibling **Tûm web** project's conventions
> (structure, module layout, best practices). **Tooling/stack choices stay Nimba's** —
> see "Stack (Nimba tools)" below. In particular: **no Better Auth** (the backend owns
> auth), **no TanStack Query / Zustand by default**, **no i18n**, **no PWA**.

## Stack (Nimba tools — do not substitute)

| Concern | Tool |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (added on demand via CLI; `components.json` style new-york, base slate) |
| Forms | React Hook Form + Zod (`zodResolver`) |
| HTTP | ky — shared client in `lib/api-client.ts` |
| Auth | **Backend Spring Security session cookie** — the frontend only relays it (same-origin proxy + `credentials: include`). No frontend auth library. |
| Server state | Light hooks over the ky client; **TanStack Query is NOT installed** — apply the layer-omission rule (backlog 1.11). Introduce only if a concrete story needs background refresh. |
| Client/UI state | `useState`; **Zustand only if a story truly needs shared client state.** |

## Project structure (no `src/` — App Router at root)

```
app/                       # routes — thin shells (Server Components by default)
  (dri)/                   # DRI analyst route group (no URL segment)
components/
  ui/                      # shadcn primitives — add on demand, NEVER bulk-add; external (do not lint/format/test)
  shared/                  # cross-cutting components (e.g. app-header)
  modules/<domain>/        # feature modules: identity, credit-case, amortization-schedule
lib/                       # cn(), api-client, api-error, constants, env, env.server
proxy.ts                   # Next.js 16 middleware replacement (export `proxy`)
```

## Patterns (from Tûm)

- **`page.tsx` is a thin shell** — render the feature component, set metadata, do
  server-side redirects. No form logic, no hooks, no JSX beyond the component call.
- **Feature logic lives in `components/modules/<domain>/`** — one file per component,
  flat (no nested `components/`/`hooks/`/`services/` folders), exported via `index.ts`.
  e.g. `identity/{login-form.tsx, use-session.ts, auth-service.ts, auth-schemas.ts, index.ts}`.
- **Server Components by default**; add `"use client"` only for state/effects/browser APIs.
- **Forms**: React Hook Form + Zod; `Controller` for controlled inputs;
  `form.setError("root", …)` for API errors; field errors via `formState.errors`.
- **Every screen has loading / empty / error states.**
- **shadcn on demand**: `pnpm dlx shadcn@latest add <component>`; never `add --all`.
  `components/ui/` is external — excluded from lint/format/test.
- **Promote** a component to `components/ui/` only when reused across modules; to
  `components/shared/` for cross-cutting app components.

## API & auth

- Calls go through `lib/api-client.ts` (ky, `prefixUrl` = `env.apiBasePath`,
  `credentials: include`). The browser is same-origin; Next.js proxies `/api/*` to the
  backend (`next.config.ts`), so the `SameSite=Strict` session cookie flows without CORS.
- Non-OK responses surface as a typed `ApiError` (`lib/api-error.ts`) carrying the
  backend problem detail. Handle status codes explicitly (401 invalid credentials, 429
  throttled, 422 validation, etc.).
- The backend OpenAPI contract is the source of truth; validate response shapes with Zod
  when drift is a risk.

## Environment & constants

- **Never** read `process.env` outside `lib/env.ts` (client, `NEXT_PUBLIC_*` only) and
  `lib/env.server.ts` (server-only, guarded by `server-only`). `next.config.ts` is the
  one infra boundary that may read `process.env` for the dev proxy.
- **Never hardcode route strings or cookie names.** Use `ROUTES` and `AUTH_COOKIES`
  from `lib/constants.ts`.

## Engineering rules (hard requirements)

1. **No AI authorship trace** anywhere (commits, PRs, comments, headers).
2. **Conventional Commits** with a `Refs: NIMBA-<number>` trailer.
3. **Branching**: one branch per story, `nimba-{number}-{slug}`, from `develop`; squash-merge via PR.
4. **No hardcoded config** — env files only.
5. **No duplicated logic** — colocate Zod schemas with their module; one source of truth via `z.infer`.
6. **Run before a PR**: `pnpm lint` and `pnpm build` must pass.

## Key reference files

- `web/CLAUDE.md` — Claude Code instructions (includes this file)
- `web/README.md` — setup and structure
- `docs/nimba-mvp-backlog.md` — full backlog
- `app/` — backend service (Kotlin / Spring Boot)
<!-- END:nimba-web-context -->
