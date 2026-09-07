"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import NewChatForm from "@/components/NewChatForm";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessageBubble from "@/components/ChatMessageBubble";
import CookingTimer from "@/components/CookingTimer";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { EQUIPMENT_KEYS, setEquipment, type Equipment } from "@/lib/redux/equipmentSlice";
import { FREE_USAGE_LIMIT, incrementUsage } from "@/lib/redux/usageCounterSlice";
import { addHistoryEntry, type HistoryEntry } from "@/lib/redux/historySlice";
import { setPersonCount } from "@/lib/redux/personCountSlice";
import { setRecipeMode } from "@/lib/redux/recipeModeSlice";
import type { ApiErrorResponse, RecipeResponse } from "@/lib/types/recipe";
import type { ChatMessage } from "@/lib/types/chat";

function buildEquipmentState(selected: Equipment[]): Record<Equipment, boolean> {
  const state = {} as Record<Equipment, boolean>;
  for (const key of EQUIPMENT_KEYS) state[key] = selected.includes(key);
  return state;
}

function makeMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  // Sohbet başladıktan (ilk istek gönderildikten) sonra akış mesaj balonlarıyla
  // gösterilir — bkz. ChatMessageBubble. Boşsa NewChatForm gösteriliyor.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
  const hasStartedChat = messages.length > 0;

  async function requestRecipes(ingredientsDescription: string, photoDataUrl?: string) {
    const equipment = EQUIPMENT_KEYS.filter((key) => equipmentState[key]);
    if (equipment.length === 0) {
      throw new Error("En az bir ekipman seçmelisin.");
    }

    const response = await fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoDataUrl,
        ingredientsText: ingredientsDescription || undefined,
        personCount,
        equipment,
        mode: recipeMode,
        language: userProfile.language,
        country: userProfile.country.trim() || undefined,
        ...(isFreeMode ? {} : { premiumProvider: apiKey.provider, premiumApiKey: apiKey.key.trim() }),
      }),
    });

    const data = (await response.json()) as RecipeResponse | ApiErrorResponse;
    if (!response.ok || !("recipes" in data)) {
      throw new Error("error" in data ? data.error : "Tarif alınamadı.");
    }

    if (isFreeMode) dispatch(incrementUsage());
    return data.recipes;
  }

  async function handleSubmit() {
    if (!photo && !hasIngredientsText) return;
    if (limitReached) return;

    setStatus("loading");
    setError(null);

    const userMessageText = hasIngredientsText
      ? ingredientsText.trim()
      : "Fotoğrafımdaki malzemelerle ne yapabilirim?";

    try {
      const recipes = await requestRecipes(hasIngredientsText ? ingredientsText.trim() : "", photo ?? undefined);

      setMessages([
        { id: makeMessageId(), role: "user", text: userMessageText, createdAt: Date.now() },
        { id: makeMessageId(), role: "assistant", recipes, createdAt: Date.now() },
      ]);
      setStatus("success");

      dispatch(
        addHistoryEntry({
          ingredientsText: hasIngredientsText ? ingredientsText.trim() : undefined,
          hadPhoto: Boolean(photo),
          personCount,
          equipment: EQUIPMENT_KEYS.filter((key) => equipmentState[key]),
          mode: recipeMode,
          recipeTitles: recipes.map((recipe) => recipe.title),
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
    setMessages([]);
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

      {hasStartedChat ? (
        <div className="flex w-full max-w-2xl flex-col gap-4">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
        </div>
      ) : (
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
      )}

      <CookingTimer />
    </div>
  );
}
