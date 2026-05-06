# SCI700 Innovation Portal

## What this is

A working prototype for the **Sunshine Coast Innovation Ecosystem Portal** — a web platform connecting startups, investors, researchers, corporates, and government in the Sunshine Coast region. Built as the capstone deliverable for SCI700 (Master's, UniSC, 2026).

The demo is **20 May 2026** — a live event with an iPad on a table, a big screen, and real stakeholders in the room. Everything built until then is in service of that moment.

---

## Silicon Coast

The platform may be rebranded to **Silicon Coast** — a brand identity for the Sunshine Coast's emerging tech ecosystem. This is pending stakeholder sign-off and affects all copy, branding assets, and the `startupsc` Cloudflare subdomain. Do not implement this until instructed. When it lands, it's a sweeping change across every page.

---

## Tech stack

| Layer         | Tech                                                            |
| ------------- | --------------------------------------------------------------- |
| Frontend      | React 19 + Vite, React Router v7                                |
| Styling       | Tailwind CSS v4                                                 |
| Animation     | Framer Motion (with `MotionContext` for prefers-reduced-motion) |
| Backend       | Express 5, Node.js                                              |
| Database      | MongoDB (cloud-hosted, MongoDB Atlas)                           |
| Visualisation | D3 (force simulation on EcosystemMap)                           |

**Running the project:** `npm run dev` starts Vite (`--host`, LAN-accessible) and nodemon concurrently.

**API:** Vite proxies `/api` → `http://localhost:3002`. All fetch calls use relative paths (`/api/...`). Server runs on port **3002** (was 3001 — do not hardcode 3001 anywhere).

---

## Design system

- **Accent colour:** Amber (`amber-400`) throughout — buttons, tags, highlights, active states
- **Layout:** Desktop-first (~75% of surveyed users on desktop); mobile hamburger nav implemented in `Navbar.jsx`
- **Motion:** Framer Motion for page transitions and card interactions; `MotionContext` provides a `useMotion()` hook that respects `prefers-reduced-motion`
- **Feel:** The portal should feel like a place to _do things_ — connect, post, discover — not just browse lists

---

## Pages

| Page           | Route            | Status  | Notes                                                                                                                                                                                     |
| -------------- | ---------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home           | `/`              | Working | Hero (video bg), animated phrase cycling, stat blobs, pillar cards                                                                                                                        |
| Directory      | `/directory`     | Working | Startup table via `Table.jsx`, text search, tag filter, sort, add-startup form                                                                                                            |
| Events         | `/events`        | Working | List + calendar view, type filter, text search, sort, add-event form, real-time polling                                                                                                   |
| Opportunities  | `/opportunities` | Working | Cards with type + sector filter, deadline sort, contact reveal, add-opportunity form, real-time polling                                                                                   |
| Ecosystem Map  | `/map`           | Working | D3 force-simulation bubble map, tag filter, click-to-detail side panel, new node pulse animation                                                                                          |
| Resources      | `/resources`     | Working | 10-card flip grid: Business Planning, Funding & Grants, Networks & Mentors, Legal & Compliance, Digital Tools, Market Research, Sustainability, Talent & Hiring, Accelerators, Co-working |
| Privacy Policy | `/privacy`       | Working | Static, April 2026                                                                                                                                                                        |
| Terms          | `/terms`         | Working | Static, April 2026                                                                                                                                                                        |

---

## API routes

All submissions land as `status: "pending"` and are invisible to public GET endpoints until approved.

| Method | Route                        | Description                                     |
| ------ | ---------------------------- | ----------------------------------------------- |
| GET    | `/api/startups`              | All approved startups, sorted by name           |
| GET    | `/api/startups/pending`      | All pending startups (no frontend yet)          |
| POST   | `/api/startups`              | Submit a new startup (→ pending)                |
| PATCH  | `/api/startups/:id`          | Set status to `approved` or `rejected`          |
| GET    | `/api/events`                | All approved events, sorted by date             |
| GET    | `/api/events/pending`        | All pending events (no frontend yet)            |
| POST   | `/api/events`                | Submit a new event (→ pending)                  |
| PATCH  | `/api/events/:id`            | Set status to `approved` or `rejected`          |
| GET    | `/api/opportunities`         | All approved opportunities, sorted by createdAt |
| GET    | `/api/opportunities/pending` | All pending opportunities (no frontend yet)     |
| POST   | `/api/opportunities`         | Submit a new opportunity (→ pending)            |
| PATCH  | `/api/opportunities/:id`     | Set status to `approved` or `rejected`          |

**Note:** PATCH endpoints are currently unauthenticated — fine for the prototype, not for production.

---

## Remaining work

### Engineering tasks (owner: Alex)

| Task                      | Priority      | Notes                                                                                                                                 |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Scraping**              | Demo-critical | Scrape the Australian Business Register and calendars of events to seed real Sunshine Coast businesses and events into the directory. |
| **Make Resources useful** |               | Content curation populate links, using LevelUps help                                                                                  |
| **News Tab**              |               | List success stories                                                                                                                  |
| **Better directory**      |               | List inventors and more instead of just startups and allow for defining themselves as more than just one tag                          |

### Business / stakeholder tasks (not engineering)

| Task                            | Notes                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| **Silicon Coast rebrand**       | Pending stakeholder sign-off                                                          |
| **Switch to Postgres**          | Infrastructure decision, not yet decided                                              |
| **User accounts + matchmaking** | Deferred post-demo; matchmaking is the #3 most-wanted feature but requires auth first |

---

## Survey findings (33 respondents, April 2026)

### Who responded (Q1)

- Startup founders / entrepreneurs ~29%
- Service providers, Corporate/Industry, Government ~15% each
- Scaleups/SMEs ~13%
- Research institutions, Incubators ~10% each
- Investors ~5%

### Most wanted features (Q2, ranked)

1. Searchable directory (~78%)
2. Events calendar & networking (~76%)
3. Matchmaking / recommendations (~70%)
4. Funding, grants, incentives info (~60%)
5. Post opportunities — pilots, test & trial (~55%)
6. Open innovation challenges from industry (~45%)
7. List your startup or VC fund (~45%)
8. Case studies of successful collaborations (~45%)
9. Co-working spaces (~40%)
10. Accelerator program info (~38%)

### Primary use cases (Q4)

1. Identifying startups, investors, or tech partners (~57%)
2. Understanding support, funding, or incentives (~55%)
3. Discovering innovation opportunities or challenges (~50%)
4. Finding pilot or co-development opportunities (~45%)
5. Building commercial or R&D partnerships (~42%)

### Access method (Q3)

- Desktop / web browser ~75%
- Mobile ~15%
- Email alerts / newsletters ~12%

### Key qualitative themes (Q5)

- Information currency is critical — needs a clear ownership/curation model
- AI matchmaking suggested (skills, availability, partner profiles)
- Living ecosystem map / visual (Canterbury Tech bubbles map referenced)
- Tailored views per user type (startup vs investor vs corporate)
- Measure success by **connections made**, not page views
- UniSC / research linkages valued
- R&D job board suggested
- _"The value is not in the directory but in the actual collaborations, opportunities, and real push for progress"_
