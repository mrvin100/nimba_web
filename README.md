# Nimba — Frontend Service

Web client for Nimba, the internal banking credit-case platform (codename Prodigy).
Built with Next.js 16 (App Router) and TypeScript, consuming the versioned REST API
exposed by the sibling `app/` backend service.

This is a **full web client, not a PWA**: there is deliberately no service worker and no
install manifest. The DRI analyst works from a bank workstation, so the offline
capability that would justify a PWA is not needed now or in the foreseeable future of
this internal product.

## Tech stack

| Technology | Version |
|---|---|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | 5 (strict) |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (added per feature) |
| Forms | React Hook Form + Zod |
| HTTP (client) | ky (`credentials: 'include'`) |
| Package manager | pnpm |

## Structure

```
app/
└── (dri)/                 # DRI analyst workspace (route group — no URL segment)
    ├── layout.tsx
    ├── page.tsx           # dashboard — credit-case list (NIMBA-12)
    └── login/             # session login (NIMBA-9)
components/
├── ui/                    # shadcn/ui primitives only — no domain knowledge
├── shared/                # cross-cutting components, types, hooks
└── modules/               # one folder per business module
                           # (identity, credit-case, amortization-schedule)
lib/                       # utilities (cn, api client, constants)
```

The four-layer model (routing → component → cache/data → service) has strictly
one-directional dependencies. A module may omit the cache layer when nothing refreshes
in the background after initial load (backlog Section 1.11); the component layer is
never omitted. TanStack Query and Zustand are **not** installed by default — they are
added only when a concrete story needs them.

## Prerequisites

- Node.js 22+
- pnpm 10+
- The backend running (see `app/README.md`) for any feature that calls the API

## Local development

```bash
pnpm install
cp .env.example .env.local   # then point the API URLs at your backend
pnpm dev                     # http://localhost:3000
```

Other commands:

```bash
pnpm build   # production build (run before opening a PR)
pnpm lint    # ESLint
```

Configuration is environment-variable driven (see `.env.example`); authentication lives
entirely in the backend (Spring Security session cookie) and the frontend only relays
the cookie. No auth secrets live here.

## Engineering rules

See `AGENTS.md` (and `CLAUDE.md`) for the full rules: layer boundaries, the no-PWA
constraint, Conventional Commits, no hardcoded configuration, and the
no-AI-authorship-trace rule. These are not optional.
