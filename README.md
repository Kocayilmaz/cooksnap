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
Recipes can be starred as favorites (`FavoriteButton`) and browsed on a dedicated `/favorites`
page; they're stored locally and, best-effort, synced to Firestore if `NEXT_PUBLIC_FIREBASE_*`
env vars are configured (falls back to local-only otherwise, same "skip silently" pattern as the
Gemini/Groq/YouTube integrations — no real Firebase project wired up yet). Free-mode usage is
capped at `FREE_USAGE_LIMIT` (5) requests and now resets automatically every 24 hours; once the
limit is reached, the submit button disables and the user is pointed to the profile page to add a
premium key. Every successful request is also saved to a local search history, summarized on the
home page and clearable. The warm color palette decided in `DESIGN.md` is now applied across the
entire app, including the profile page (dark mode still uses the previous zinc classes for now).
Recipe cards have a copy-to-clipboard button, and `PhotoUpload` validates file type/size before
accepting an upload. Pure functions and Redux reducers now have unit tests (Vitest, run via
`npm run test:unit`) alongside the existing Playwright e2e suite — every reducer under `lib/redux/`,
every `localStorage` helper, the AI provider calls (`recognizeFoodItem`, `generateRecipes`,
`findRecipeVideoId`), and the Firestore best-effort sync layer now have their own test file
(106 unit tests across 20 files, `fetch`/`firebase/firestore` mocked). There's a custom 404 page
and a top-level error boundary, favorites can be filtered by title, and clearing recipe history now
asks for confirmation first. A few accessibility gaps were closed: the ingredient textarea and the
API key field are properly labeled for screen readers, the active nav link exposes
`aria-current="page"`, and the recipe result/error area is wrapped in an `aria-live` region so a
finished request gets announced automatically. Unit test coverage now also includes the AI
provider calls, the YouTube lookup, and the Firestore best-effort sync layer (109 tests, 21 files).
The app now ships `robots.txt`, `sitemap.xml`, a web app manifest, a code-generated favicon, and
richer Open Graph/Twitter metadata, so a shared link renders a proper title/description/card. A
photo you've uploaded can be removed with an on-preview button instead of only being replaceable.

## Development

```bash
cp .env.example .env.local  # fill in the keys you have
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Localization

The app UI will support multiple languages (Turkish included); English is used for the codebase,
repo, and this README since the project may be shared publicly.
