import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { RecipeLanguage } from "@/lib/firebase/recipesClient";
import type { MealIngredient } from "@/lib/types/meal";

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const LANGUAGE_NAMES: Record<RecipeLanguage, string> = {
  tr: "Turkish",
  en: "English",
  id: "Indonesian",
  es: "Spanish",
  pt: "Portuguese",
  ar: "Arabic",
};

export interface RecipeTextInput {
  title: string;
  ingredients: MealIngredient[];
  steps: string[];
}

/**
 * Kendi tarif veritabanımızdaki (bkz. scripts/seedRecipes.ts) tek dilde yazılmış
 * bir tarifi hedef dile çevirir. lib/ai/groqTranslate.ts'teki
 * translateMealToTurkish ile aynı Groq çağrı deseni, ama tek bir dile değil
 * RecipeLanguage parametresiyle 6 dilin herhangi birine çevirebiliyor.
 */
export async function translateRecipeToLanguage(
  recipe: RecipeTextInput,
  targetLanguage: RecipeLanguage,
): Promise<RecipeTextInput> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError("GROQ_API_KEY tanımlı değil.");
  }

  const languageName = LANGUAGE_NAMES[targetLanguage];
  const payload = { title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional recipe translator. Translate the given JSON recipe into natural, fluent ${languageName}. Keep the structure identical, translate ingredient measures to a natural local equivalent where sensible (keep the original if unsure). Respond with ONLY this JSON schema, nothing else: {"title":"string","ingredients":[{"name":"string","measure":"string"}],"steps":["string"]}`,
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!response.ok) {
    throw new ProviderRequestError(`Groq isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new ProviderRequestError("Groq yanıtından metin okunamadı.");
  }

  let parsed: { title?: string; ingredients?: MealIngredient[]; steps?: string[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ProviderRequestError("Groq yanıtı geçerli JSON değil.");
  }

  if (
    typeof parsed.title !== "string" ||
    !Array.isArray(parsed.ingredients) ||
    !Array.isArray(parsed.steps)
  ) {
    throw new ProviderRequestError("Groq yanıtı beklenen tarif yapısında değil.");
  }

  return { title: parsed.title, ingredients: parsed.ingredients, steps: parsed.steps };
}
