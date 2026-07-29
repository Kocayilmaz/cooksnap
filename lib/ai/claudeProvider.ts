import type { RecipeRequest, RecipeSuggestion } from "@/lib/types/recipe";
import { buildRecipePrompt } from "@/lib/ai/buildRecipePrompt";
import { InvalidDataUrlError, parseDataUrl } from "@/lib/ai/parseDataUrl";
import { ProviderRequestError } from "@/lib/ai/providers";

const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";
const ANTHROPIC_VERSION = "2023-06-01";

const RECIPE_JSON_INSTRUCTION =
  'Respond with strict JSON only, matching {"recipes":[{"equipment":"oven|pan|pot","title":"string","steps":["string"]}]}. No prose outside the JSON, no markdown code fences.';

/** Kullanıcının kendi Claude anahtarıyla fotoğraftaki yemek/ürünü kısa bir metin olarak tanır. */
export async function recognizeFoodItemWithClaude(
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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 64,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify the food item or packaged product in this photo. Reply with only its name, in a few words, no punctuation.",
            },
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: base64 },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new ProviderRequestError(`Claude isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new ProviderRequestError("Claude yanıtından ürün adı okunamadı.");
  }

  return text.trim();
}

/** Kullanıcının kendi Claude anahtarıyla malzeme/ürün tanımına göre tarif(ler) üretir. */
export async function generateRecipesWithClaude(
  ingredientsDescription: string,
  request: Pick<RecipeRequest, "personCount" | "equipment" | "mode" | "language" | "country">,
  apiKey: string,
): Promise<RecipeSuggestion[]> {
  const prompt = buildRecipePrompt(request, ingredientsDescription);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: RECIPE_JSON_INSTRUCTION,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new ProviderRequestError(`Claude isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== "string") {
    throw new ProviderRequestError("Claude yanıtından tarif metni okunamadı.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ProviderRequestError("Claude yanıtı geçerli JSON değil.");
  }

  const recipes = (parsed as { recipes?: unknown })?.recipes;
  if (!Array.isArray(recipes)) {
    throw new ProviderRequestError("Claude yanıtı beklenen tarif yapısında değil.");
  }

  return recipes as RecipeSuggestion[];
}
