# Pegasxs Web

Next.js site to replace Framer. Same design, all logic ported.

## Pages
- `/` — Landing page (home)
- `/studio` — Where users fire renders (requires login)
- `/library` — Example videos + user's own renders
- `/login` — Sign in
- `/signup` — Create account

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your logo
Put your `logo.png` file in the `/public` folder.

### 3. Environment variables
The `.env.local` file already has your Supabase credentials. 
If you need to update them:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://api.pegasxs.com
```

### 4. Run locally
```bash
npm run dev
```
Opens at http://localhost:3000

### 5. Deploy to Vercel

**Option A — Vercel CLI:**
```bash
npm install -g vercel
vercel
```
Follow the prompts. On first deploy it asks you to link to a Vercel project.

**Option B — GitHub:**
1. Push this folder to a GitHub repo
2. Go to vercel.com → "Add New Project"
3. Import your GitHub repo
4. Add environment variables in Vercel dashboard (same as .env.local)
5. Deploy

### 6. Add Vercel domain to CORS
Once deployed, add your Vercel URL to the CORS list in `server.ts`:
```ts
origin: ["https://www.pegasxs.com", "https://pegasxs.com", "https://your-project.vercel.app"],
```

### 7. Stripe: switch sandbox → live
When ready to go live, update the Stripe price IDs in `server.ts` and switch Stripe to live mode.

## Database requirement
The library feature requires a `prompt` column on your `renders` table.
Run this SQL in Supabase if it doesn't exist:
```sql
ALTER TABLE renders ADD COLUMN IF NOT EXISTS prompt text;
```

## What was changed from Framer
- Removed all `framer` and `framer-motion` imports (OnboardingStepper now uses CSS transitions instead)
- Removed `addPropertyControls` (Framer-only)
- `supabaseClient.ts` now uses env variables instead of hardcoded keys
- `RenderButton.tsx` now stores the prompt in the renders table after firing
- `UserLibrary` is a new component (fetches all past renders, shows download + copy prompt)
- Smart CTA button: shows "Begin" when logged out, "Create" when logged in
