import type { RecipeRequest, RecipeSuggestion } from "@/lib/types/recipe";
import { buildRecipePrompt } from "@/lib/ai/buildRecipePrompt";
import { InvalidDataUrlError, parseDataUrl } from "@/lib/ai/parseDataUrl";
import { ProviderRequestError } from "@/lib/ai/providers";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

const RECIPE_JSON_INSTRUCTION =
  'Respond with strict JSON only, matching {"recipes":[{"equipment":"oven|pan|pot","title":"string","steps":["string"]}]}. No prose outside the JSON, no markdown code fences.';

/** Kullanıcının kendi Gemini anahtarıyla fotoğraftaki yemek/ürünü kısa bir metin olarak tanır. */
export async function recognizeFoodItemWithGemini(
  photoDataUrl: string,
  apiKey: string,
): Promise<string> {
  let mimeType: string;
  let base64: string;
  try {
    ({ mimeType, base64 } = parseDataUrl(photoDataUrl));
  } catch (error) {
    if (error instanceof InvalidDataUrlError) {
      throw new ProviderRequestError(error.message);
    }
    throw error;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Identify the food item or packaged product in this photo. Reply with only its name, in a few words, no punctuation.",
              },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new ProviderRequestError(`Gemini isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new ProviderRequestError("Gemini yanıtından ürün adı okunamadı.");
  }

  return text.trim();
}

/** Kullanıcının kendi Gemini anahtarıyla malzeme/ürün tanımına göre tarif(ler) üretir. */
export async function generateRecipesWithGemini(
  ingredientsDescription: string,
  request: Pick<RecipeRequest, "personCount" | "equipment" | "mode" | "language" | "country">,
  apiKey: string,
): Promise<RecipeSuggestion[]> {
  const prompt = buildRecipePrompt(request, ingredientsDescription);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: RECIPE_JSON_INSTRUCTION }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" },
      }),
    },
  );

  if (!response.ok) {
    throw new ProviderRequestError(`Gemini isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== "string") {
    throw new ProviderRequestError("Gemini yanıtından tarif metni okunamadı.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ProviderRequestError("Gemini yanıtı geçerli JSON değil.");
  }

  const recipes = (parsed as { recipes?: unknown })?.recipes;
  if (!Array.isArray(recipes)) {
    throw new ProviderRequestError("Gemini yanıtı beklenen tarif yapısında değil.");
  }

  return recipes as RecipeSuggestion[];
}
