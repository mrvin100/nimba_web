# Nimba — Frontend Service

> Web client for **Nimba**, the internal banking credit-case platform (codename
> Prodigy). Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
> shadcn/ui · TanStack Query — consuming the versioned REST API of the sibling
> [`app/`](../app) Spring Boot service through a same-origin proxy
> (session-cookie auth, no token ever touches the client).

Deliberately a **full web client, not a PWA**: analysts work from bank
workstations; no service worker, no offline layer.

## 📚 Documentation map

| Document | Purpose |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | **The layer system** — render/component/hook/service/contract, data flows, guards, UX rules, naming. Read this before adding any feature. |
| [`AGENTS.md`](AGENTS.md) | Hard engineering rules (stack constraints, commits, env) |
| [`../app/docs/architecture.md`](../app/docs/architecture.md) | Backend architecture + full API surface this client consumes |
| This file | Quick start + project structure |

## 🚀 Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000 — /api/* proxied to BACKEND_ORIGIN
```

Requires the backend running (see [`../app/README.md`](../app/README.md)); first
visit bootstraps the initial administrator. Before any PR:

```bash
pnpm lint && pnpm build     # both must pass
```

## 🗂 Project structure

```
app/                        routes — PURE render shells (return <Feature />)
  (auth)/                   public: login, bootstrap, set-password  → <GuestOnly>
  (app)/                    workspaces: /dri /dcm /drc /admin /profile → <WorkspaceShell>
components/
  ui/                       shadcn primitives — CLI on demand, pruned when unused
  shared/                   cross-cutting: WorkspaceShell, DataTable, SubmitButton,
                            Pager, PageHeader, StatusActionMenu, sidebar…
  modules/<domain>/         feature modules — identity (REFERENCE), credit-case,
                            amortization-schedule, team, admin, audit
lib/                        api-client (ky), api-error, query-keys (QUERY_SCOPES),
                            mutation, use-paged-query, format, constants, env
proxy.ts                    Next 16 middleware: cookie gate → /login
```

## 🧩 Adding a feature — copy the identity module

Each module is exactly five files plus views — the full contract, data flow and
rules are in [`docs/architecture.md`](docs/architecture.md):

```
schema.ts             Zod + z.infer types (mirror of the backend contract)
<domain>.service.ts   ALL endpoints of the scope; the ONLY layer inspecting HTTP
                      statuses (throws user-ready messages / typed domain errors)
use<Domain>.ts        keys object on QUERY_SCOPES + queries + mutations
                      (useApiMutation: invalidation + toasts) — all cache logic
<feature>.tsx         UI + validation only (RHF + Zod + Field/Controller);
                      mutation.mutate(values, { onSuccess, onError }) — no try/catch
index.ts              barrel (components, hooks, types, URL builders only)
```

Golden rules: no business computation in React (the backend provides every
figure) · heavy content is lazy (`Collapsible` + `enabled`) · destructive actions
confirm via `AlertDialog` · auth-state changes hard-navigate · never read
`process.env` outside `lib/env*` · never hardcode a route string.

## 📄 Conventions

Conventional Commits + `Refs: NIMBA-<n>` · branch `nimba-{n}-{slug}` from
`develop` · squash-merge via PR · no AI authorship trace anywhere.
