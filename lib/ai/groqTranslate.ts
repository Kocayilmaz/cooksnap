import { ProviderNotConfiguredError, ProviderRequestError } from "@/lib/ai/providers";
import type { MealDetail, MealIngredient } from "@/lib/types/meal";

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

async function callGroq(messages: { role: "system" | "user"; content: string }[], jsonMode: boolean) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError("GROQ_API_KEY tanımlı değil.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages,
    }),
  });

  if (!response.ok) {
    throw new ProviderRequestError(`Groq isteği başarısız oldu (${response.status}).`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new ProviderRequestError("Groq yanıtından metin okunamadı.");
  }
  return content;
}

/** Türkçe yemek/malzeme arama terimini İngilizce'ye çevirir — TheMealDB
 * tamamen İngilizce olduğu için Türkçe aramalar sonuçsuz kalabiliyor, bu
 * fonksiyon sonuç bulunamayınca yeniden denemek için kullanılır. */
export async function translateFoodQueryToEnglish(query: string): Promise<string> {
  const content = await callGroq(
    [
      {
        role: "system",
        content:
          "Translate the given Turkish food, ingredient, or dish search term to English. Reply with ONLY the translated term, no punctuation, no quotes, no explanation.",
      },
      { role: "user", content: query },
    ],
    false,
  );
  return content.trim();
}

/** TheMealDB'den gelen İngilizce tarifi Groq ile Türkçe'ye çevirir — yaşlı ve
 * Türkçe konuşan kullanıcılar için tarif detay ekranının tamamı Türkçe olmalı. */
export async function translateMealToTurkish(meal: MealDetail): Promise<MealDetail> {
  const payload = {
    title: meal.name,
    category: meal.category,
    area: meal.area,
    instructions: meal.instructions,
    ingredients: meal.ingredients,
  };

  const content = await callGroq(
    [
      {
        role: "system",
        content:
          'Sen bir yemek tarifi çevirmenisin. Verilen JSON içindeki İngilizce tarifi doğal ve akıcı Türkçeye çevir, yapıyı birebir koru. Ölçüleri (measure) anlamlı bir Türkçe karşılığa çevir, tam çeviremiyorsan orijinal haliyle bırak. Sadece şu JSON şemasıyla yanıt ver, başka hiçbir şey yazma: {"title":"string","category":"string","area":"string","instructions":"string","ingredients":[{"name":"string","measure":"string"}]}',
      },
      { role: "user", content: JSON.stringify(payload) },
    ],
    true,
  );

  let parsed: {
    title?: string;
    category?: string;
    area?: string;
    instructions?: string;
    ingredients?: MealIngredient[];
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ProviderRequestError("Groq yanıtı geçerli JSON değil.");
  }

  return {
    ...meal,
    name: parsed.title ?? meal.name,
    category: parsed.category ?? meal.category,
    area: parsed.area ?? meal.area,
    instructions: parsed.instructions ?? meal.instructions,
    ingredients:
      Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0
        ? parsed.ingredients
        : meal.ingredients,
  };
}
