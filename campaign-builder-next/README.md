# Campaign Builder

An open-source, AI-powered campaign planning workspace for product marketing teams. Built with Next.js 16, TypeScript, Tailwind CSS v4, and Claude.

> Ships with two fictional demo products — NovaTech Platform and NovaTech Analytics — so you can explore all features immediately.

---

## What it does

Campaign Builder gives PMM teams a single workspace to manage campaign strategy from framework to execution:

| Section | What you can do |
|---|---|
| **Framework** | Document positioning, messaging pillars, personas, tagline, campaign brief |
| **Assets** | Track all campaign assets with stage, status, channels, personas, launch dates |
| **Generator** | AI-write content from your framework, or upload your own files |
| **Campaign Flow** | Visualize assets across the buyer journey with edit and reorder support |
| **Journey Map** | Swimlane view by persona — spot coverage gaps at a glance |
| **Calendar** | 13-week quarter grid showing scheduled launches by funnel stage |

---

## Quick start

```bash
git clone https://github.com/desireem-seb/babel-system.git
cd babel-system/campaign-builder-next
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No database or API key required to get started.

---

## AI content generation

The Generator uses Claude to write full campaign assets grounded in your framework's positioning and personas.

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Data storage

**Local (default):** JSON files in `/data/` — no setup, changes persist to disk.

**Production:** Set `DATABASE_URL` to a PostgreSQL connection string. The app auto-migrates on startup.

```bash
heroku config:set DATABASE_URL=postgres://...
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
```

---

## Customizing for your company

1. **Replace demo data** — edit `data/campaign-frameworks.json` and `data/campaigns/<product>.json`
2. **Update branding** — logomark and app name are in `src/components/layout/Sidebar.tsx` and `AppShell.tsx`
3. **Add products** — add a new key to `campaign-frameworks.json`, create a matching `data/campaigns/<id>.json`

---

## Tech stack

- **Framework:** Next.js 16 App Router, `output: standalone`
- **Language:** TypeScript strict
- **Styling:** Tailwind CSS v4, class-based dark mode
- **State:** Zustand + TanStack Query
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`)
- **Database:** PostgreSQL via `pg` (optional, falls back to JSON)
- **Deploy:** Heroku-ready (`Procfile` + `app.json`)

---

## License

MIT
