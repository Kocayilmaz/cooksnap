"use client";

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import IngredientTextInput from "@/components/IngredientTextInput";
import PersonCountSelector from "@/components/PersonCountSelector";
import EquipmentSelector from "@/components/EquipmentSelector";
import RecipeModeSelector from "@/components/RecipeModeSelector";
import RecipeVideoEmbed from "@/components/RecipeVideoEmbed";
import FavoriteButton from "@/components/FavoriteButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { EQUIPMENT_KEYS } from "@/lib/redux/equipmentSlice";
import { FREE_USAGE_LIMIT, incrementUsage } from "@/lib/redux/usageCounterSlice";
import type { ApiErrorResponse, RecipeResponse, RecipeSuggestion } from "@/lib/types/recipe";

type Status = "idle" | "loading" | "error" | "success";

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [ingredientsText, setIngredientsText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);

  const equipmentState = useAppSelector((state) => state.equipment);
  const personCount = useAppSelector((state) => state.personCount.value);
  const recipeMode = useAppSelector((state) => state.recipeMode.value);
  const userProfile = useAppSelector((state) => state.userProfile);
  const apiKey = useAppSelector((state) => state.apiKey);
  const usageCount = useAppSelector((state) => state.usageCounter.count);
  const isFreeMode = apiKey.key.trim().length === 0;
  const limitReached = isFreeMode && usageCount >= FREE_USAGE_LIMIT;
  const dispatch = useAppDispatch();

  const hasIngredientsText = ingredientsText.trim().length > 0;

  async function handleSubmit() {
    if (!photo && !hasIngredientsText) return;
    if (limitReached) return;

    const equipment = EQUIPMENT_KEYS.filter((key) => equipmentState[key]);
    if (equipment.length === 0) {
      setStatus("error");
      setError("En az bir ekipman seçmelisin.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoDataUrl: photo ?? undefined,
          ingredientsText: hasIngredientsText ? ingredientsText.trim() : undefined,
          personCount,
          equipment,
          mode: recipeMode,
          language: userProfile.language,
          country: userProfile.country.trim() || undefined,
          ...(isFreeMode
            ? {}
            : { premiumProvider: apiKey.provider, premiumApiKey: apiKey.key.trim() }),
        }),
      });

      const data = (await response.json()) as RecipeResponse | ApiErrorResponse;

      if (!response.ok || !("recipes" in data)) {
        throw new Error("error" in data ? data.error : "Tarif alınamadı.");
      }

      setRecipes(data.recipes);
      setStatus("success");
      if (isFreeMode) {
        dispatch(incrementUsage());
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-warm px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-8 rounded-2xl bg-surface-card p-8 shadow-sm dark:bg-zinc-950">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-red">
            CookSnap
          </h1>
          <p className="text-sm text-surface-text-muted dark:text-zinc-400">
            Fotoğraf çek ya da malzemeleri yaz, elindekilere göre tarifini al.
          </p>
        </div>

        <PhotoUpload onPhotoSelected={setPhoto} />
        <IngredientTextInput value={ingredientsText} onChange={setIngredientsText} />
        <PersonCountSelector />
        <EquipmentSelector />
        <RecipeModeSelector />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={(!photo && !hasIngredientsText) || status === "loading" || limitReached}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
        >
          {status === "loading" && <LoadingSpinner size={16} />}
          {status === "loading" ? "Tarif hazırlanıyor…" : "Tarifi getir"}
        </button>

        {isFreeMode && limitReached && (
          <p className="text-center text-xs text-state-error dark:text-red-400">
            Ücretsiz mod limitine ulaştın ({usageCount}/{FREE_USAGE_LIMIT}). Devam etmek için
            Profil sayfasından kendi Claude/OpenAI anahtarını girebilirsin.
          </p>
        )}

        {isFreeMode && !limitReached && (
          <p className="text-center text-xs text-surface-text-muted dark:text-zinc-500">
            Ücretsiz modda kullanılan istek: {usageCount}/{FREE_USAGE_LIMIT}
          </p>
        )}

        {status === "error" && error && (
          <p role="alert" className="text-center text-sm text-state-error dark:text-red-400">
            {error}
          </p>
        )}

        {status === "success" && (
          <ul className="flex flex-col gap-4">
            {recipes.map((recipe, index) => (
              <li
                key={`${recipe.equipment}-${index}`}
                className="rounded-xl border border-surface-border p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground dark:text-zinc-50">
                    {recipe.title}
                  </p>
                  <FavoriteButton
                    equipment={recipe.equipment}
                    title={recipe.title}
                    steps={recipe.steps}
                    videoId={recipe.videoId}
                  />
                </div>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-surface-text-muted dark:text-zinc-400">
                  {recipe.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
                {recipe.videoId && (
                  <RecipeVideoEmbed videoId={recipe.videoId} title={recipe.title} />
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
