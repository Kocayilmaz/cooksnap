import type { Equipment } from "@/lib/redux/equipmentSlice";
import type { RecipeMode } from "@/lib/redux/recipeModeSlice";
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

/**
 * Kullanıcının kişi sayısı, seçtiği ekipman ve tarif moduna göre AI
 * modeline gönderilecek metin istemini (prompt) oluşturur. Fotoğrafın
 * kendisi ayrı bir görsel-tanıma adımında değerlendirilir; bu fonksiyon
 * sadece metin tarafını üretir.
 */
export function buildRecipePrompt(
  request: Pick<RecipeRequest, "personCount" | "equipment" | "mode">,
  recognizedItem: string,
): string {
  const equipmentList = request.equipment.map((item) => EQUIPMENT_NAMES[item]);

  return [
    `The photographed item is: ${recognizedItem}.`,
    `Suggest a recipe for ${request.personCount} ${request.personCount === 1 ? "person" : "people"}.`,
    `Available cooking equipment: ${equipmentList.join(", ")}.`,
    MODE_INSTRUCTIONS[request.mode],
    "For each piece of equipment, return a short recipe title and a numbered list of steps scaled to the serving size.",
  ].join(" ");
}
