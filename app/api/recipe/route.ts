import { NextResponse } from "next/server";
import type {
  ApiErrorResponse,
  RecipeRequest,
  RecipeResponse,
  RecipeSuggestion,
} from "@/lib/types/recipe";
import { EQUIPMENT_KEYS } from "@/lib/redux/equipmentSlice";
import { RECIPE_MODE_KEYS, type RecipeMode } from "@/lib/redux/recipeModeSlice";
import { PREMIUM_PROVIDER_KEYS, type PremiumProvider } from "@/lib/redux/apiKeySlice";
import {
  generateRecipes,
  ProviderNotConfiguredError,
  ProviderRequestError,
  recognizeFoodItem,
} from "@/lib/ai/providers";
import { generateRecipesWithClaude, recognizeFoodItemWithClaude } from "@/lib/ai/claudeProvider";
import { generateRecipesWithOpenAI, recognizeFoodItemWithOpenAI } from "@/lib/ai/openaiProvider";
import { generateRecipesWithGemini, recognizeFoodItemWithGemini } from "@/lib/ai/geminiProvider";
import { generateRecipesWithGroq } from "@/lib/ai/groqProvider";
import { findRecipeVideoId } from "@/lib/ai/youtube";

type RecognizeFn = (photoDataUrl: string, apiKey: string) => Promise<string>;
type GenerateFn = (
  ingredientsDescription: string,
  request: Pick<RecipeRequest, "personCount" | "equipment" | "mode" | "language" | "country">,
  apiKey: string,
) => Promise<RecipeSuggestion[]>;

/** Groq metin tabanlı bir model - fotoğraf tanıma (vision) desteklemiyor. */
const RECOGNIZE_BY_PROVIDER: Partial<Record<PremiumProvider, RecognizeFn>> = {
  claude: recognizeFoodItemWithClaude,
  openai: recognizeFoodItemWithOpenAI,
  gemini: recognizeFoodItemWithGemini,
};

const GENERATE_BY_PROVIDER: Record<PremiumProvider, GenerateFn> = {
  claude: generateRecipesWithClaude,
  openai: generateRecipesWithOpenAI,
  gemini: generateRecipesWithGemini,
  groq: generateRecipesWithGroq,
};

const MIN_PEOPLE = 1;
const MAX_PEOPLE = 12;

function validateRequest(body: unknown): body is RecipeRequest {
  if (typeof body !== "object" || body === null) return false;
  const {
    photoDataUrl,
    ingredientsText,
    personCount,
    equipment,
    mode,
    language,
    country,
    premiumProvider,
    premiumApiKey,
  } = body as Partial<RecipeRequest>;

  const hasPhoto = typeof photoDataUrl === "string" && photoDataUrl.startsWith("data:");
  const hasText = typeof ingredientsText === "string" && ingredientsText.trim().length > 0;
  if (!hasPhoto && !hasText) return false;
  if (photoDataUrl !== undefined && !hasPhoto) return false;

  if (typeof personCount !== "number" || personCount < MIN_PEOPLE || personCount > MAX_PEOPLE) {
    return false;
  }
  if (!Array.isArray(equipment) || equipment.length === 0) return false;
  if (!equipment.every((item) => EQUIPMENT_KEYS.includes(item))) return false;
  if (!RECIPE_MODE_KEYS.includes(mode as RecipeMode)) return false;
  if (language !== undefined && language !== "tr" && language !== "en") return false;
  if (country !== undefined && typeof country !== "string") return false;

  const hasPremiumProvider = premiumProvider !== undefined;
  const hasPremiumApiKey = typeof premiumApiKey === "string" && premiumApiKey.trim().length > 0;
  if (hasPremiumProvider !== hasPremiumApiKey) return false;
  if (hasPremiumProvider && !PREMIUM_PROVIDER_KEYS.includes(premiumProvider as PremiumProvider)) {
    return false;
  }

  return true;
}

/**
 * Her tarife best-effort bir YouTube videosu ekler. Video özelliği
 * çekirdek işlev değil (YOUTUBE_API_KEY yapılandırılmamış olabilir), bu
 * yüzden hata durumunda videoId null bırakılır ve asıl tarif yanıtı
 * etkilenmez.
 */
async function attachVideos(recipes: RecipeSuggestion[]): Promise<RecipeSuggestion[]> {
  return Promise.all(
    recipes.map(async (recipe) => {
      try {
        const videoId = await findRecipeVideoId(recipe.title);
        return { ...recipe, videoId };
      } catch {
        return { ...recipe, videoId: null };
      }
    }),
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorResponse>({ error: "İstek gövdesi geçerli JSON değil." }, { status: 400 });
  }

  if (!validateRequest(body)) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error:
          "photoDataUrl veya ingredientsText'ten en az biri, personCount (1-12) ve en az bir equipment gerekli.",
      },
      { status: 400 },
    );
  }

  try {
    const { premiumProvider, premiumApiKey } = body;
    const recipeContext = {
      personCount: body.personCount,
      equipment: body.equipment,
      mode: body.mode,
      language: body.language,
      country: body.country,
    };

    let ingredientsDescription = body.ingredientsText ?? "";
    let recipes: RecipeSuggestion[];

    if (premiumProvider && premiumApiKey) {
      const recognize = RECOGNIZE_BY_PROVIDER[premiumProvider];
      if (body.photoDataUrl) {
        if (!recognize) {
          return NextResponse.json<ApiErrorResponse>(
            {
              error:
                "Groq fotoğraf tanımayı desteklemiyor. Groq seçiliyken lütfen malzemelerini yazarak devam et.",
            },
            { status: 400 },
          );
        }
        const recognizedItem = await recognize(body.photoDataUrl, premiumApiKey);
        ingredientsDescription = ingredientsDescription
          ? `${recognizedItem}; additionally: ${ingredientsDescription}`
          : recognizedItem;
      }
      recipes = await GENERATE_BY_PROVIDER[premiumProvider](
        ingredientsDescription,
        recipeContext,
        premiumApiKey,
      );
    } else {
      if (body.photoDataUrl) {
        const recognizedItem = await recognizeFoodItem(body.photoDataUrl);
        ingredientsDescription = ingredientsDescription
          ? `${recognizedItem}; additionally: ${ingredientsDescription}`
          : recognizedItem;
      }
      recipes = await generateRecipes(ingredientsDescription, recipeContext);
    }

    const recipesWithVideos = await attachVideos(recipes);
    return NextResponse.json<RecipeResponse>({ recipes: recipesWithVideos });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json<ApiErrorResponse>({ error: error.message }, { status: 503 });
    }
    if (error instanceof ProviderRequestError) {
      return NextResponse.json<ApiErrorResponse>({ error: error.message }, { status: 502 });
    }
    return NextResponse.json<ApiErrorResponse>({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
