import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";

/**
 * Tarif başlığına göre YouTube'da en alakalı tarif videosunu arar ve
 * videoId'sini döner. Video özelliği tarifin çekirdek işlevi değil, bu
 * yüzden çağıran taraf hataları best-effort olarak yutup videosuz devam
 * edebilir — bkz. app/api/recipe/route.ts.
 */
export async function findRecipeVideoId(recipeTitle: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError("YOUTUBE_API_KEY tanımlı değil.");
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "id",
    type: "video",
    maxResults: "1",
    q: `${recipeTitle} tarifi`,
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);

  if (!response.ok) {
    throw new ProviderRequestError(`YouTube isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const videoId = data?.items?.[0]?.id?.videoId;
  return typeof videoId === "string" ? videoId : null;
}
