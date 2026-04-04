# Scudo Markets — Kalshi Trading Dashboard

A third-party event contract trading dashboard built by **Scudo Strategy Group**, powered by the Kalshi API.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Auth:** Supabase (email/password)
- **Data:** Kalshi Trading API v2
- **Hosting:** Vercel
- **Repo:** GitHub

## Project Structure

```
kalshi-scudo/
├── app/
│   ├── api/kalshi/          # Server-side Kalshi API proxy routes
│   │   ├── markets/route.ts # GET /api/kalshi/markets
│   │   ├── portfolio/route.ts # GET /api/kalshi/portfolio
│   │   └── trade/route.ts   # POST /api/kalshi/trade
│   ├── auth/callback/route.ts # Supabase email confirmation handler
│   ├── dashboard/
│   │   ├── layout.tsx       # Protected layout with nav
│   │   └── page.tsx         # Main dashboard with market cards
│   ├── login/page.tsx       # Auth page with Scudo branding
│   ├── globals.css          # Scudo design system
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Root redirect
├── components/
│   └── DashboardNav.tsx     # Top navigation bar
├── lib/
│   ├── kalshi.ts            # Kalshi API client (server-only)
│   ├── supabase-browser.ts  # Supabase client for browser
│   └── supabase-server.ts   # Supabase client for server
├── middleware.ts             # Auth route protection
└── .env.local               # Environment variables (DO NOT COMMIT)
```

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/eaguilar452/kalshi-scudo.git
cd kalshi-scudo
npm install
```

### 2. Environment Variables

Copy `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tmmpflyjeeanunhrsvok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wlWzIiSHg7ycRmt1cz_rLw_bCSspe9c
KALSHI_API_KEY=your_kalshi_api_key_here
```

### 3. Supabase Setup

In your Supabase dashboard:
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel domain (e.g., `https://kalshi-scudo.vercel.app`)
3. Add `https://kalshi-scudo.vercel.app/auth/callback` to **Redirect URLs**

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

1. Push to GitHub
2. In Vercel, click **Import Git Repository** → select `kalshi-scudo`
3. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `KALSHI_API_KEY` (keep this one secret)
4. Deploy

## Security Architecture

- **Kalshi API key** is ONLY on the server (in `/api/` routes and Vercel env vars)
- **Supabase anon key** is safe for client-side (Row Level Security protects data)
- **Middleware** protects `/dashboard/*` routes — no auth = redirect to `/login`
- **API proxy pattern** — the browser never talks to Kalshi directly

## Phase Roadmap

- [x] Phase 1: Auth + Dashboard shell + Market display + Trade API
- [ ] Phase 2: Live orderbook view, position tracking, P&L charts
- [ ] Phase 3: Trade execution UI, order confirmations, notifications
- [ ] Phase 4: Research integration, market analysis, Scudo editorial content

---

**Scudo Strategy Group** · Fort Lauderdale · scudosg.com
