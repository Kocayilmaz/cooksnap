# CookSnap

Snap a photo of a food item — a raw ingredient or a ready-made/frozen product — and get an
AI-generated recipe based on how many people you're cooking for and which equipment you have
(oven / pan / pot).

## Idea

1. Upload a photo — a raw ingredient (e.g. meatball mix) or a packaged/ready product (e.g. frozen
   lasagna).
2. Choose how many people you're cooking for.
3. Select the cooking equipment you have (oven / pan / pot).
4. The AI recognizes the item and returns recipe(s) scaled to your serving size, for each
   equipment option you selected.

## AI engine — multiple providers, free + premium

- **Free mode (default):** Gemini (image recognition) + Groq (recipe text), rate-limited per user.
- **Premium mode:** If the user provides their own Claude or OpenAI API key, the rate limit is
  lifted and output quality improves. The key is never stored on the server — only in the
  browser.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + Redux Toolkit
- **Backend:** Next.js API routes (Gemini / Groq / Claude / OpenAI calls)
- **Data:** Firebase (Firestore) — saved recipes + free-mode usage counter
- **Testing:** Playwright (e2e — upload photo → get recipe flow)
- **CI/CD:** GitHub Actions → Vercel

## Status

Still at the scaffolding stage; features are being built incrementally through small daily
commits.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Localization

The app UI will support multiple languages (Turkish included); English is used for the codebase,
repo, and this README since the project may be shared publicly.
