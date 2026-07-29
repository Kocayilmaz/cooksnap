# CookSnap

Snap a photo of a food item — a raw ingredient or a ready-made/frozen product — and get an
AI-generated recipe based on how many people you're cooking for and which equipment you have
(oven, pan, pot, air fryer, microwave, pressure cooker, toaster oven, grill/BBQ, slow cooker, or
wok).

## Idea

1. Upload a photo — a raw ingredient (e.g. meatball mix) or a packaged/ready product (e.g. frozen
   lasagna).
2. Choose how many people you're cooking for.
3. Select the cooking equipment you have (oven, pan, pot, air fryer, microwave, pressure cooker,
   toaster oven, grill/BBQ, slow cooker, or wok).
4. The AI recognizes the item and returns recipe(s) scaled to your serving size, for each
   equipment option you selected.

## AI engine — multiple providers, free + premium

- **Free mode (default):** Gemini (image recognition) + Groq (recipe text), rate-limited per user.
- **Premium mode:** If the user provides their own Claude or OpenAI API key, the rate limit is
  lifted and output quality improves. The key is never stored on the server — only in the
  browser, and it's forwarded per-request to power both image recognition and recipe
  generation.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + Redux Toolkit
- **Backend:** Next.js API routes (Gemini / Groq / Claude / OpenAI calls)
- **Data:** Firebase (Firestore) — saved recipes + free-mode usage counter
- **Testing:** Playwright (e2e — upload photo → get recipe flow)
- **CI/CD:** GitHub Actions → Vercel

## Status

Still at the scaffolding stage; features are being built incrementally through small daily
commits. `POST /api/recipe` is wired end-to-end (Gemini image recognition → Groq recipe
generation), accepts a photo, free-text ingredients, or both, and supports 3 recipe modes
(student / home / chef). It also does a best-effort YouTube lookup per recipe (`YOUTUBE_API_KEY`)
and returns a clear 503 when `GEMINI_API_KEY`/`GROQ_API_KEY` aren't set — real keys haven't been
provisioned yet. Premium mode is now wired end-to-end: the API key UI persists to the browser's
`localStorage`, and when a key is set the app sends it with the request so the route calls
Claude or OpenAI directly instead of Gemini/Groq (verified in the browser with a placeholder key —
the request reaches the right provider and a rejected key surfaces as a 502, not a real key yet).
Equipment selection also persists to `localStorage` now, so it survives a page reload like the
profile and API key do.
Recipes can be starred as favorites (`FavoriteButton`), stored locally the same way until Firebase
is wired up. Free-mode usage is now capped at `FREE_USAGE_LIMIT` (5) requests — once reached, the
submit button disables and the user is pointed to the profile page to add a premium key. The warm
color palette decided in `DESIGN.md` is now applied across the home page and all shared components
(NavBar, selectors, ApiKeyInput, HelpSection) instead of neutral zinc tones (dark mode still uses
the previous zinc classes for now).

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Localization

The app UI will support multiple languages (Turkish included); English is used for the codebase,
repo, and this README since the project may be shared publicly.
