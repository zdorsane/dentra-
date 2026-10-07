# DENTRA

**The intelligent operating system for dental clinics.**

DENTRA is a dental clinic management platform: patients, appointments, treatments, an interactive dental chart, inventory, billing, staff, analytics and an AI assistant, all in one dashboard.

## Features

| Module | What it does |
| --- | --- |
| Dashboard | Daily overview of the clinic: schedule, revenue, alerts |
| Patients | Patient records, history and follow-ups |
| Appointments | Calendar and appointment management |
| Dental chart | Interactive tooth chart with a 3D tooth viewer |
| Treatments | Treatment plans and procedures |
| Inventory | Stock levels and low-stock alerts |
| Billing | Invoices and payments |
| Staff | Team members and roles |
| Analytics | Charts and clinic performance metrics |
| AI assistant | Insights and a chat assistant for clinic operations |

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) and React 19
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Recharts for charts
- Three.js with React Three Fiber for the 3D tooth viewer
- Supabase (optional) for authentication and data

## Getting started

Requirements: Node.js 20 or later and npm.

```bash
git clone https://github.com/zdorsane/dentra-.git
cd dentra-
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo mode

With no environment variables set, DENTRA runs in **demo mode**: mock data and a local demo session, with no backend required. Sign in with:

- **Email:** `demo@dentra.app`
- **Password:** `demo123`

### Connecting Supabase (optional)

Copy `.env.example` to `.env.local` and fill in your project's values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |

## Project structure

```
app/          Routes (landing, auth, onboarding, dashboard modules)
components/   UI components grouped by feature
lib/          Auth, data access, mock data, store and utilities
types/        Shared TypeScript types
public/       Static assets
```

## Deployment

The app is deployed on [Vercel](https://vercel.com). Every push to `main` triggers a production deployment, and every pull request gets a preview URL.

To deploy your own copy, import the repository at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js automatically; add the Supabase variables under **Settings → Environment Variables** if you use Supabase.
