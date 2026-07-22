import type { Equipment } from "@/lib/redux/equipmentSlice";
import type { RecipeRequest } from "@/lib/types/recipe";

const EQUIPMENT_NAMES: Record<Equipment, string> = {
  oven: "oven",
  pan: "pan",
  pot: "pot",
};

/**
 * Kullanıcının kişi sayısı ve seçtiği ekipmanlara göre AI modeline
 * gönderilecek metin istemini (prompt) oluşturur. Fotoğrafın kendisi
 * ayrı bir görsel-tanıma adımında değerlendirilir; bu fonksiyon sadece
 * metin tarafını üretir.
 */
export function buildRecipePrompt(
  request: Pick<RecipeRequest, "personCount" | "equipment">,
  recognizedItem: string,
): string {
  const equipmentList = request.equipment.map((item) => EQUIPMENT_NAMES[item]);

  return [
    `The photographed item is: ${recognizedItem}.`,
    `Suggest a recipe for ${request.personCount} ${request.personCount === 1 ? "person" : "people"}.`,
    `Available cooking equipment: ${equipmentList.join(", ")}.`,
    "For each piece of equipment, return a short recipe title and a numbered list of steps scaled to the serving size.",
  ].join(" ");
}
