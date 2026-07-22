import { NextResponse } from "next/server";
import type { ApiErrorResponse, RecipeRequest, RecipeResponse } from "@/lib/types/recipe";
import { EQUIPMENT_KEYS } from "@/lib/redux/equipmentSlice";
import { RECIPE_MODE_KEYS, type RecipeMode } from "@/lib/redux/recipeModeSlice";
import {
  generateRecipes,
  ProviderNotConfiguredError,
  ProviderRequestError,
  recognizeFoodItem,
} from "@/lib/ai/providers";

const MIN_PEOPLE = 1;
const MAX_PEOPLE = 12;

function validateRequest(body: unknown): body is RecipeRequest {
  if (typeof body !== "object" || body === null) return false;
  const { photoDataUrl, personCount, equipment, mode } = body as Partial<RecipeRequest>;

  if (typeof photoDataUrl !== "string" || !photoDataUrl.startsWith("data:")) return false;
  if (typeof personCount !== "number" || personCount < MIN_PEOPLE || personCount > MAX_PEOPLE) {
    return false;
  }
  if (!Array.isArray(equipment) || equipment.length === 0) return false;
  if (!equipment.every((item) => EQUIPMENT_KEYS.includes(item))) return false;
  if (!RECIPE_MODE_KEYS.includes(mode as RecipeMode)) return false;

  return true;
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
      { error: "photoDataUrl, personCount (1-12) ve en az bir equipment gerekli." },
      { status: 400 },
    );
  }

  try {
    const recognizedItem = await recognizeFoodItem(body.photoDataUrl);
    const recipes = await generateRecipes(recognizedItem, body.personCount, body.equipment, body.mode);
    return NextResponse.json<RecipeResponse>({ recipes });
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
