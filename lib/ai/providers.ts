import type { Equipment } from "@/lib/redux/equipmentSlice";
import type { RecipeSuggestion } from "@/lib/types/recipe";
import { buildRecipePrompt } from "@/lib/ai/buildRecipePrompt";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export class ProviderNotConfiguredError extends Error {}
export class ProviderRequestError extends Error {}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new ProviderRequestError("Fotoğraf verisi geçersiz bir data URL formatında.");
  }
  return { mimeType: match[1], base64: match[2] };
}

/** Gemini ile fotoğraftaki yemek/ürünü kısa bir metin olarak tanır. */
export async function recognizeFoodItem(photoDataUrl: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError("GEMINI_API_KEY tanımlı değil.");
  }

  const { mimeType, base64 } = parseDataUrl(photoDataUrl);

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

/** Groq ile tanınan ürün + kişi sayısı + ekipmana göre tarif(ler) üretir. */
export async function generateRecipes(
  recognizedItem: string,
  personCount: number,
  equipment: Equipment[],
): Promise<RecipeSuggestion[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ProviderNotConfiguredError("GROQ_API_KEY tanımlı değil.");
  }

  const prompt = buildRecipePrompt({ personCount, equipment }, recognizedItem);

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
