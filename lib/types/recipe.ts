import type { Equipment } from "@/lib/redux/equipmentSlice";
import type { RecipeMode } from "@/lib/redux/recipeModeSlice";

export interface RecipeRequest {
  /** Yüklenen fotoğrafın data URL'i (base64). */
  photoDataUrl: string;
  personCount: number;
  /** Kullanıcının işaretlediği ekipmanlar arasından seçili (true) olanlar. */
  equipment: Equipment[];
  mode: RecipeMode;
}

export interface RecipeSuggestion {
  equipment: Equipment;
  title: string;
  steps: string[];
}

export interface RecipeResponse {
  recipes: RecipeSuggestion[];
}

export interface ApiErrorResponse {
  error: string;
}
