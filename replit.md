# Sweetie Studio — Editorial Lifestyle Boutique

A full-stack React + Express e-commerce app with an AI stylist powered by Google Gemini.

## Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite
- **Backend:** Express, TypeScript (tsx in dev, esbuild for prod)
- **AI:** Google Gemini 2.5 Flash (AI Stylist feature)
- **Auth:** JWT (admin dashboard)

## How to run on Replit
The workflow `Start application` runs `PORT=5000 npm run dev`, which starts the Express server with Vite middleware in development mode.

## Required Secrets (Replit Secrets panel)
| Key | Purpose |
|-----|---------|
| `GEMINI_API_KEY` | AI Stylist feature |
| `ADMIN_EMAIL` | Admin dashboard login email |
| `ADMIN_PASSWORD` | Admin dashboard login password |
| `SESSION_SECRET` | JWT signing secret (already set) |

## Vercel Deployment
The project is pre-configured for Vercel:
- `vercel.json` — routes `/api/*` to the serverless Express handler, `/*` to the static frontend
- `api/index.ts` — Express app exported as a Vercel serverless function
- Build command: `npm run build` → outputs to `dist/`

Set the same environment variables in your Vercel project dashboard (Settings → Environment Variables).

## WhatsApp
All WhatsApp links use number `919891454247`.

## User preferences
