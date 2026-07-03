# Nimba Web — Frontend Architecture

The layer system every module follows. Identity is the reference implementation —
when in doubt, open `components/modules/identity/` and copy its shape.

## 1. The layers (top to bottom)

```
app/**/page.tsx · layout.tsx     RENDER LAYER — pure: `return <Feature />`; params
                                 extraction and server redirects only. Guards are
                                 mounted ONCE per route group:
                                   (app)  → <WorkspaceShell>  (session + capability)
                                   (auth) → <GuestOnly>       (signed-in → board)
─────────────────────────────────────────────────────────────────────────────────
components/modules/<domain>/     COMPONENT LAYER — UI + validation only.
  <feature>.tsx                  Forms = RHF + Zod + <Field>/<Controller>/<FieldError>;
                                 submit = <SubmitButton formState={{ isSubmitting:
                                 mutation.isPending }}>. ZERO try/catch, ZERO toast,
                                 ZERO mutateAsync: `mutation.mutate(values,
                                 { onSuccess, onError })`; errors displayed with
                                 getErrorMessage or matched by `instanceof` on the
                                 module's TYPED domain errors — never HTTP statuses.
─────────────────────────────────────────────────────────────────────────────────
  use<Domain>.ts                 HOOK LAYER — one file per module owning: the keys
                                 object (built on lib/query-keys QUERY_SCOPES),
                                 queries, mutations (lib/mutation useApiMutation =
                                 invalidation + success/error toasts), write-through
                                 setQueryData, lazy queries (`enabled`).
─────────────────────────────────────────────────────────────────────────────────
  <domain>.service.ts            SERVICE LAYER — ALL endpoints of the module's
                                 backend scope, thin ky calls (.json<T>()). The ONLY
                                 place that inspects HTTP statuses: it throws
                                 user-ready messages (login 401/429) or typed domain
                                 errors (BulkImportRejectedError, ScheduleRejectedError).
─────────────────────────────────────────────────────────────────────────────────
  schema.ts                      CONTRACT LAYER — Zod schemas + z.infer types
                                 mirroring the backend API. Nothing else.
  index.ts                       barrel — components, hooks, types, and URL BUILDERS
                                 only; raw service calls never cross the boundary.
```

Shared plumbing: `lib/api-client` (one ky instance, non-OK → typed `ApiError`),
`lib/api-error` (`getErrorMessage`), `lib/query-keys` (`QUERY_SCOPES` registry —
scope collisions are compile errors), `lib/use-paged-query`, `lib/mutation`,
`lib/format` (fr-FR dates/amounts/initials), `lib/constants` (`ROUTES`,
`AUTH_COOKIES`), `components/shared/*` (SubmitButton, DataTable, Pager, PageHeader,
StatusActionMenu, WorkspaceShell, GuestOnly lives in identity).

## 2. Data flow

**Read**: page → feature component → `useX()` (TanStack Query, key from the module
keys object) → `x.service.ts` → ky → `/api/*` (Next rewrite proxy, session cookie
flows same-origin) → backend. RSC renders structure only — **authenticated data is
always fetched client-side**; the server never recomputes a business figure the
backend already provides (see the amortization overview: even tooltip percentages
come from the API).

**Write**: form (RHF+Zod) → `mutation.mutate(values, { onSuccess, onError })` →
hook (invalidates the module scope, toasts) → service → backend. The component only
routes ready-made feedback (root error vs UI state).

**Auth state changes use HARD navigation** (`window.location.replace`): a soft
`router.replace` would reuse the Router Cache recorded under the previous auth
state (the proxy's workspace→login redirects) — the "spinner loops, never lands on
the board" bug. `useLogin` primes `identityKeys.session` then hard-navigates to
`landingPath(user)`; `useLogout` clears every cache then hard-navigates to login.

## 3. Session & guards

- `proxy.ts` (Next 16 middleware): no cookie on a guarded path → `/login` (cheap gate).
- `useSession` — the single session source (TanStack cache, 401 → `user: null` as a
  *normal* state, never an error). No Zustand: server state stays in the query cache.
- `WorkspaceShell` (mounted once by `app/(app)/layout.tsx`): resolves the active
  workspace from the URL (`workspace-registry`, config-driven), enforces capability
  access, renders sidebar + breadcrumb. Cross-workspace pages (`/profile`) resolve
  onto the user's landing workspace.
- `GuestOnly` (mounted once by `app/(auth)/layout.tsx`): signed-in visitor →
  hard-navigate to their board; the form renders instantly for everyone else.

## 4. UX rules

- Every screen has loading (skeleton mirroring the final layout — no jump), empty
  (`Empty` with guidance) and error states.
- Secondary/heavy content is on demand: detailed tables behind `Collapsible` with a
  **lazy query** (`enabled: open`); the dossier screen is split into `Tabs`.
- Destructive actions (revoke…) confirm through `AlertDialog` (`StatusActionMenu`).
- Success = toast (from the hook); form errors = anchored root message.
- shadcn primitives are added **via the CLI on demand** and removed when unused;
  backend-served binaries use `next/image` with `unoptimized` (the optimizer cannot
  carry the session cookie).
- Page containers are harmonized: `mx-auto w-full max-w-5xl space-y-6 px-6 py-8`
  (lists) / `max-w-4xl` (detail) — same rhythm everywhere.

## 5. Naming

| Element | Convention |
|---|---|
| Module hook file | `use<Domain>.ts` (one per module) |
| Service file | `<domain>.service.ts` |
| Everything else | kebab-case |
| Query keys | `<domain>Keys` object at the head of the hook file, on `QUERY_SCOPES` |
| Schemas | `xxxSchema` + `type Xxx = z.infer<…>` |
| Routes / cookies | `ROUTES` / `AUTH_COOKIES` from `lib/constants` — never inline strings |
