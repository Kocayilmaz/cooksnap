import type { Equipment } from "@/lib/redux/equipmentSlice";
import type { RecipeMode } from "@/lib/redux/recipeModeSlice";
import type { RecipeLanguage } from "@/lib/redux/userProfileSlice";

export interface RecipeRequest {
  /** Yüklenen fotoğrafın data URL'i (base64). Fotoğraf zorunlu değil — bkz. ingredientsText. */
  photoDataUrl?: string;
  /** Kullanıcının elindeki malzemeleri yazıyla tarif ettiği alan. photoDataUrl yerine veya onunla birlikte kullanılabilir. */
  ingredientsText?: string;
  personCount: number;
  /** Kullanıcının işaretlediği ekipmanlar arasından seçili (true) olanlar. */
  equipment: Equipment[];
  mode: RecipeMode;
  /** Profil sayfasındaki dil tercihi — belirtilmezse İngilizce üretilir. */
  language?: RecipeLanguage;
  /** Profil sayfasındaki ülke tercihi — o ülkenin mutfağına öncelik verilir, kesin kısıtlama değildir. */
  country?: string;
}

export interface RecipeSuggestion {
  equipment: Equipment;
  title: string;
  steps: string[];
  /** YouTube tarif videosu bulunabildiyse video id'si (best-effort, YOUTUBE_API_KEY yoksa null). */
  videoId?: string | null;
}

export interface RecipeResponse {
  recipes: RecipeSuggestion[];
}

export interface ApiErrorResponse {
  error: string;
}
