import type { RecipeRequest, RecipeSuggestion } from "@/lib/types/recipe";
import { buildRecipePrompt } from "@/lib/ai/buildRecipePrompt";
import { ProviderRequestError } from "@/lib/ai/providers";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/** Kullanıcının kendi OpenAI anahtarıyla fotoğraftaki yemek/ürünü kısa bir metin olarak tanır. */
export async function recognizeFoodItemWithOpenAI(
  photoDataUrl: string,
  apiKey: string,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify the food item or packaged product in this photo. Reply with only its name, in a few words, no punctuation.",
            },
            { type: "image_url", image_url: { url: photoDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new ProviderRequestError(`OpenAI isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new ProviderRequestError("OpenAI yanıtından ürün adı okunamadı.");
  }

  return text.trim();
}

/** Kullanıcının kendi OpenAI anahtarıyla malzeme/ürün tanımına göre tarif(ler) üretir. */
export async function generateRecipesWithOpenAI(
  ingredientsDescription: string,
  request: Pick<RecipeRequest, "personCount" | "equipment" | "mode" | "language" | "country">,
  apiKey: string,
): Promise<RecipeSuggestion[]> {
  const prompt = buildRecipePrompt(request, ingredientsDescription);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are a recipe assistant. Respond with strict JSON only, matching {"recipes":[{"equipment":"oven|pan|pot","title":"string","steps":["string"]}]}. No prose outside the JSON.',
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new ProviderRequestError(`OpenAI isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new ProviderRequestError("OpenAI yanıtından tarif metni okunamadı.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ProviderRequestError("OpenAI yanıtı geçerli JSON değil.");
  }

  const recipes = (parsed as { recipes?: unknown })?.recipes;
  if (!Array.isArray(recipes)) {
    throw new ProviderRequestError("OpenAI yanıtı beklenen tarif yapısında değil.");
  }

  return recipes as RecipeSuggestion[];
}
