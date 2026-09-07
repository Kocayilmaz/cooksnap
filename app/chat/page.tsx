"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import NewChatForm from "@/components/NewChatForm";
import ChatSidebar from "@/components/ChatSidebar";
import CookingTimer from "@/components/CookingTimer";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { EQUIPMENT_KEYS, setEquipment, type Equipment } from "@/lib/redux/equipmentSlice";
import { FREE_USAGE_LIMIT, incrementUsage } from "@/lib/redux/usageCounterSlice";
import { addHistoryEntry, type HistoryEntry } from "@/lib/redux/historySlice";
import { setPersonCount } from "@/lib/redux/personCountSlice";
import { setRecipeMode } from "@/lib/redux/recipeModeSlice";
import type { ApiErrorResponse, RecipeResponse, RecipeSuggestion } from "@/lib/types/recipe";

function buildEquipmentState(selected: Equipment[]): Record<Equipment, boolean> {
  const state = {} as Record<Equipment, boolean>;
  for (const key of EQUIPMENT_KEYS) state[key] = selected.includes(key);
  return state;
}

type Status = "idle" | "loading" | "error" | "success";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [photo, setPhoto] = useState<string | null>(null);
  // Anasayfadaki malzeme seçici /chat?ingredients=... ile buraya yönlendiriyor
  // (bkz. components/IngredientPicker.tsx) — varsa metin kutusunu onunla doldur.
  const [ingredientsText, setIngredientsText] = useState(() => searchParams.get("ingredients") ?? "");
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
      dispatch(
        addHistoryEntry({
          ingredientsText: hasIngredientsText ? ingredientsText.trim() : undefined,
          hadPhoto: Boolean(photo),
          personCount,
          equipment,
          mode: recipeMode,
          recipeTitles: data.recipes.map((recipe) => recipe.title),
        }),
      );
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
    }
  }

  function handleNewChat() {
    setPhoto(null);
    setIngredientsText("");
    setStatus("idle");
    setError(null);
    setRecipes([]);
  }

  function handleSelectEntry(entry: HistoryEntry) {
    setIngredientsText(entry.ingredientsText ?? "");
    dispatch(setPersonCount(entry.personCount));
    dispatch(setEquipment(buildEquipmentState(entry.equipment)));
    dispatch(setRecipeMode(entry.mode));
  }

  return (
    <div className="flex flex-1 justify-center gap-6 bg-surface-warm px-4 py-12">
      <ChatSidebar onNewChat={handleNewChat} onSelectEntry={handleSelectEntry} />

      <NewChatForm
        ingredientsText={ingredientsText}
        onIngredientsChange={setIngredientsText}
        onPhotoSelected={setPhoto}
        onSubmit={handleSubmit}
        canSubmit={Boolean(photo) || hasIngredientsText}
        isLoading={status === "loading"}
        limitReached={limitReached}
        isFreeMode={isFreeMode}
        usageCount={usageCount}
        freeUsageLimit={FREE_USAGE_LIMIT}
        error={status === "error" ? error : null}
      />

      <CookingTimer />
    </div>
  );
}
