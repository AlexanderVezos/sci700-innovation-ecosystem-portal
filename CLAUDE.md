# SCI700 Innovation Portal — Project Context

## What this is

A wireframe/prototype for the **Sunshine Coast Innovation Ecosystem Portal** — a web platform to connect startups, investors, researchers, corporates, and government in the Sunshine Coast region. Built as part of SCI700.

Stack: React + Vite, Tailwind CSS, Framer Motion, React Router. Backend stub at `server/` serving mock data from `localhost:3001`. Vite dev server proxies `/api` → `http://localhost:3001`, so all fetch calls use relative paths (`/api/...`). Run with `npm run dev` — `vite --host` is set, so the app is accessible on LAN.

---

## Survey findings (33 respondents, April 2026)

### Who the users are (Q1)
- Startup founders / entrepreneurs — largest group (~29%)
- Service providers, Corporate/Industry, Government (~15% each)
- Scaleups/SMEs (~13%)
- Research institutions, Incubators (~10% each)
- Investors (~5%)

### Most wanted features (Q2, ranked)
1. Searchable directory of startups, scaleups, investors, research partners (~78%)
2. Events calendar and networking opportunities (~76%)
3. Matchmaking / recommendation tools (~70%)
4. Funding, grants, incentives information (~60%)
5. Ability to post opportunities — pilots, test & trial (~55%)
6. Open innovation challenges / problem statements from industry (~45%)
7. Ability to list your startup or VC fund (~45%)
8. Case studies of successful collaborations (~45%)
9. Co-working spaces (~40%)
10. Accelerator program information (~38%)

### Primary use cases (Q4, top 3 selections)
1. Identifying startups, investors, or technology partners (~57%)
2. Understanding available support, funding, or incentives (~55%)
3. Discovering innovation opportunities or challenges (~50%)
4. Finding pilot or co-development opportunities (~45%)
5. Building new commercial or R&D partnerships (~42%)

### Access method (Q3)
- Desktop / web browser — dominant (~75%)
- Mobile device (~15%)
- Email alerts / newsletters (~12%)

### Key qualitative themes (Q5)
- Information currency is critical — needs a clear ownership/curation model
- AI matchmaking suggested (skills, availability, partner profiles)
- Living ecosystem map / visual (respondent linked Canterbury Tech bubbles map as reference)
- Tailored user profiles (startup vs investor vs corporate view)
- Measure success by **connections made**, not page views
- UniSC / research linkages valued
- R&D job board suggested
- "The value is not in the directory but in the actual collaborations, opportunities, and real push for progress"

---

## Current implementation status

### Pages built
| Page | Status | Notes |
|---|---|---|
| Home | Working | Hero (video bg), stat blobs, pillar cards. Copy is live. |
| Directory | Working | Card list from API with text search and type filter (tag chips). Add-startup form (`AddStartupForm`). Has View Profile + Say Hello buttons. |
| Events | Working | Own event cards with date, location, organiser, type badge. Text search + event-type filter. Add-event form. |
| Opportunities | Working | Opportunity cards (Pilot, Co-development, Challenge, Research, Other) with search + type filter. Add-opportunity form. |
| Resources | Working | 9-card bento grid: Business Planning, Funding & Grants, Networks & Mentors, Legal & Compliance, Digital Tools, Market Research, Sustainability, Talent & Hiring, Accelerators. Expand-on-click. Copy is live. |

### Not yet built (priority order from survey)
1. **Matchmaking** — "find collaborators" flow to address the #3 most-wanted feature.
2. **Profile pages** — individual startup/org profiles behind the "View Profile" button.
3. **Ecosystem Map** — EcosystemMap.jsx exists as a shell; visual bubbles map not fully implemented.
4. **Real copy** — all hero/page copy is `**` placeholder; needs content before any demo.

### Known issues
- `Directory.jsx` renders `<Table />` which calls `/api/startups` — requires `server/` running locally.

---

## Design intent
- Desktop-first (matches ~75% desktop access finding); mobile hamburger nav is implemented in `Navbar.jsx`
- Amber (`amber-400`) as the primary accent colour throughout
- Framer Motion for page transitions and card interactions; reduce-motion support via `MotionContext`
- The portal should feel like a place to *do things* (connect, post, match) not just browse lists
