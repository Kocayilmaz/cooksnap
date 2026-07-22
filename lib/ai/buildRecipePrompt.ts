import type { Equipment } from "@/lib/redux/equipmentSlice";
import type { RecipeMode } from "@/lib/redux/recipeModeSlice";
import type { RecipeLanguage } from "@/lib/redux/userProfileSlice";
import type { RecipeRequest } from "@/lib/types/recipe";

const EQUIPMENT_NAMES: Record<Equipment, string> = {
  oven: "oven",
  pan: "pan",
  pot: "pot",
};

const MODE_INSTRUCTIONS: Record<RecipeMode, string> = {
  student:
    "Optimize for a student: use as few dishes/pans as possible and keep it as simple and quick as possible.",
  home: "No constraint on dishes used; prefer the tastiest, well-known home-style version of the dish.",
  chef: "Aim for the tastiest, most elevated version, as a professional chef would prepare it.",
};

const LANGUAGE_INSTRUCTIONS: Record<RecipeLanguage, string> = {
  tr: "Write the recipe title and steps in Turkish.",
  en: "Write the recipe title and steps in English.",
};

/**
 * Kullanıcının kişi sayısı, seçtiği ekipman, tarif modu ve profil
 * tercihlerine (dil, ülke) göre AI modeline gönderilecek metin istemini
 * (prompt) oluşturur. `ingredientsDescription` ya fotoğrafın görsel-tanıma
 * adımından (Gemini) ya da kullanıcının yazdığı malzeme metninden gelir;
 * bu fonksiyon sadece metin tarafını üretir.
 */
export function buildRecipePrompt(
  request: Pick<RecipeRequest, "personCount" | "equipment" | "mode" | "language" | "country">,
  ingredientsDescription: string,
): string {
  const equipmentList = request.equipment.map((item) => EQUIPMENT_NAMES[item]);

  const parts = [
    `The available ingredients/item are: ${ingredientsDescription}.`,
    `Suggest a recipe for ${request.personCount} ${request.personCount === 1 ? "person" : "people"}.`,
    `Available cooking equipment: ${equipmentList.join(", ")}.`,
    MODE_INSTRUCTIONS[request.mode],
  ];

  if (request.country && request.country.trim()) {
    parts.push(
      `Prefer recipes inspired by ${request.country.trim()} cuisine, but this is a soft preference, not a strict constraint.`,
    );
  }

  parts.push(
    "For each piece of equipment, return a short recipe title and a numbered list of steps scaled to the serving size.",
  );
  parts.push(LANGUAGE_INSTRUCTIONS[request.language ?? "en"]);

  return parts.join(" ");
}
