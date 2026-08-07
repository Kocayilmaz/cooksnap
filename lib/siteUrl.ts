/** Deployed origin, used for metadata (robots, sitemap, Open Graph). Override via env once a
 * production domain is live; falls back to the default Vercel project URL. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cooksnap.vercel.app";
