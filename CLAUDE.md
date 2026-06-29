# Nimba Web — Claude Code Instructions

This file configures Claude Code for the Nimba frontend service. It includes all project
context from `AGENTS.md`.

@AGENTS.md

## Claude-Specific Instructions

### Before Writing Any Code

1. Read `AGENTS.md` fully — do not skip this step
2. Read the specific `NIMBA-<n>` story in `docs/nimba-mvp-backlog.md` in full, plus
   Section 1 (Global Engineering Rules) and Section 1.11 (the layer-omission rule)
3. Confirm the backend endpoint(s) the story consumes exist and check their contract
4. Check whether the component/type/schema you are about to create already exists

### Code Style

- TypeScript strict; no `any` without a justified, commented reason
- Functional components, Server Components by default; add `"use client"` only when a
  component needs interactivity or browser APIs
- Colocate Zod schemas with their module; derive types with `z.infer` — one source of
  truth for validation and typing
- Use `cn()` from `@/lib/utils` for conditional class names
- Add shadcn/ui primitives via the shadcn CLI into `components/ui/`; do not hand-edit
  generated primitives (they are ESLint-ignored)

### Hard Constraints

- **Never** add PWA artifacts (service worker, manifest, offline caching) — this is a
  full web client by design
- **Never** install TanStack Query or Zustand pre-emptively — only when a concrete story
  needs background refresh or shared client state
- Authentication is a backend session cookie; never store tokens client-side or add a
  frontend auth library

### PR & Commit Rules

- Branch naming: `nimba-{number}-{slug}`
- Squash merge only into `develop`
- Run `pnpm lint` and `pnpm build` before opening a PR — both must pass
- **Never** include AI authorship traces in any artifact

### When Stuck

- If a story has an `[INTERACTIVE STEP]`, stop and present options — do not guess
- If a backend endpoint the story needs is not available, stop and report
- If unsure about a Next.js 16 / React 19 API, verify against the installed version
  rather than assuming older behavior
