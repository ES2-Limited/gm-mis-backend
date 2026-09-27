# SPIN GM-MIS — Backend (NestJS + PostgreSQL)

Standard NestJS API for the SPIN Grievance Management MIS. This first slice ships
the **User module + Settings (RBAC)** and **JWT auth**, backed by the managed
DigitalOcean PostgreSQL database, with SendGrid for account invites.

## Stack
- NestJS 10, TypeORM 0.3, PostgreSQL (DO managed, SSL)
- JWT auth (`@nestjs/jwt` + passport-jwt), bcrypt password hashing
- class-validator DTOs, SendGrid mail

## Setup
```bash
cp .env.example .env      # fill in DB creds, JWT_SECRET, SendGrid key
npm install
npm run migration:run     # creates the schema + seeds the superadmin
npm run start:dev         # http://localhost:3001/api
```

> The DB is firewalled (DO "Trusted Sources"). Add the machine's public IP to the
> database's trusted sources in the DO control panel before running migrations.

## What the migrations create
- `users` table (full RBAC profile).
- Seeds **one** account — the superadmin **System Administrator**, password
  from `SEED_PASSWORD` (default `Admin@123`). All other users are created in-app.

## RBAC model (mirrors the frontend)
- **Role** — access level (FPMU Admin, SPMU Admin, Grievance Officer, Field
  Officer, SEA/SH Focal Person, M&E Viewer). Drives default module permissions.
- **Specialism** — which grievance type routes to the user (Table 2 functions).
- **Escalation tier** — 1–5 ladder rung. Tier 4–5 (and national roles) force
  `scope = All states`; tiers 1–3 require a single state.
- **Permissions** — explicit module list, or `null` = role default.

## Endpoints
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → `{ accessToken, user }` |
| GET | `/api/auth/me` | current JWT identity |
| GET | `/api/users/meta` | roles, functions, modules, tiers, role-permissions |
| GET | `/api/users` | list (settings permission) |
| GET | `/api/users/:id` | one |
| POST | `/api/users` | create (sends invite email if SendGrid set) |
| PATCH | `/api/users/:id` | update |
| PATCH | `/api/users/:id/status` | `{ status: active \| suspended }` |
| DELETE | `/api/users/:id` | remove |

All `/api/users*` routes require a JWT with the `settings` permission.

### Settings domain (all persisted in the DB)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/taxonomy` | 14 framework categories (subgroups, lead, route, startLevel…) |
| POST/PATCH/DELETE | `/api/taxonomy[/:id]` | manage categories (settings perm) |
| GET | `/api/coverage` | states → LGAs → communities tree |
| PATCH | `/api/coverage/states/:name` | `{ active }` |
| PATCH | `/api/coverage/lgas` | `{ state, name, covered }` |
| POST/DELETE | `/api/coverage/communities[/:id]` | manage communities |
| GET | `/api/settings` | all config (`sla`, `tierDays`, …) |
| PUT | `/api/settings/:key` | `{ value }` (settings perm) |
| GET | `/api/audit` | audit log (audit perm; `?action=&q=&highOnly=`) |
| POST | `/api/audit` | record an action (actor from JWT) |

### Cases engine
| Method | Path | Notes |
|---|---|---|
| **POST** | **`/api/intake`** | **Public intake — any channel posts a grievance** (header `x-api-key`) |
| GET | `/api/cases` | scoped list (super/national → all; else own state); `?status=&state=&category=&channel=&q=` |
| GET | `/api/cases/stats` | report figures (totals, open, breached, by category/state/channel/priority, resolution rate) |
| GET | `/api/cases/:id` | one case (scoped) |
| POST | `/api/cases` | desk-officer intake (JWT) |
| PATCH | `/api/cases/:id/status` \| `/assign` | lifecycle |
| POST | `/api/cases/:id/screening` \| `/escalate` \| `/notes` \| `/investigation` \| `/corrective-actions` \| `/appeals` \| `/satisfaction` | working file |
| POST | `/api/cases/run-auto-escalation` | escalate all overdue cases one tier (cron) |

Escalation auto-bumps the tier, recomputes the SLA due date, re-derives the
responsible GRC, and logs every step in the case `activity` history.

### Insights (DeepSeek) — key stays server-side
| Method | Path | Notes |
|---|---|---|
| POST | `/api/insights/chat` | proxies to DeepSeek with the server's `DEEPSEEK_API_KEY` |

### Seeded data (migrations)
- **Superadmin** user only.
- **Taxonomy** — the 14 framework categories with subgroups, specialist lead, full route, responsible levels, priority, restricted flag.
- **Coverage** — the 12 SPIN states active with all 279 LGAs covered.
- **Config** — SLA targets + tier timelines.
- **Audit** — seed activity events.
