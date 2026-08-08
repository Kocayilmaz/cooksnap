import type { RecipeRequest, RecipeSuggestion } from "@/lib/types/recipe";
import { buildRecipePrompt } from "@/lib/ai/buildRecipePrompt";
import { ProviderRequestError } from "@/lib/ai/providers";

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

/**
 * Kullanıcının kendi Groq anahtarıyla malzeme/ürün tanımına göre tarif(ler) üretir.
 * Groq'ta fotoğraf tanıma (vision) desteği yok — bu yüzden yalnızca metin
 * tabanlı üretim için var, çağıran taraf (bkz. app/api/recipe/route.ts)
 * Groq seçiliyken fotoğraf gönderilmesini engeller.
 */
export async function generateRecipesWithGroq(
  ingredientsDescription: string,
  request: Pick<RecipeRequest, "personCount" | "equipment" | "mode" | "language" | "country">,
  apiKey: string,
): Promise<RecipeSuggestion[]> {
  const prompt = buildRecipePrompt(request, ingredientsDescription);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
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
    throw new ProviderRequestError(`Groq isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new ProviderRequestError("Groq yanıtından tarif metni okunamadı.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ProviderRequestError("Groq yanıtı geçerli JSON değil.");
  }

  const recipes = (parsed as { recipes?: unknown })?.recipes;
  if (!Array.isArray(recipes)) {
    throw new ProviderRequestError("Groq yanıtı beklenen tarif yapısında değil.");
  }

  return recipes as RecipeSuggestion[];
}
