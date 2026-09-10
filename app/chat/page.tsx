"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import NewChatForm from "@/components/NewChatForm";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessageBubble from "@/components/ChatMessageBubble";
import ChatMessageInput from "@/components/ChatMessageInput";
import CookingTimer from "@/components/CookingTimer";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { EQUIPMENT_KEYS, EQUIPMENT_LABELS, setEquipment, type Equipment } from "@/lib/redux/equipmentSlice";
import { FREE_USAGE_LIMIT, incrementUsage } from "@/lib/redux/usageCounterSlice";
import { addHistoryEntry, type HistoryEntry } from "@/lib/redux/historySlice";
import { setPersonCount } from "@/lib/redux/personCountSlice";
import { RECIPE_MODE_KEYS, setRecipeMode } from "@/lib/redux/recipeModeSlice";
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
  // Sohbete devam ederken kullanılan alt mesaj kutusu (bkz. ChatMessageInput) —
  // ilk formdan bağımsız, kendi metin/fotoğraf/gönderiliyor durumunu tutar.
  const [followUpText, setFollowUpText] = useState("");
  const [followUpPhoto, setFollowUpPhoto] = useState<string | null>(null);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const history = useAppSelector((state) => state.history);
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

  const threadEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSendingFollowUp]);

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
    setFollowUpText("");
    setFollowUpPhoto(null);
    setFollowUpError(null);
  }

  async function handleFollowUpSend() {
    const trimmed = followUpText.trim();
    if ((!trimmed && !followUpPhoto) || isSendingFollowUp || limitReached) return;

    // Onceki tarif basliklarini kisa bir baglam olarak ekleyip AI'in konusmaya
    // devam ediyormus gibi yanit vermesini sagliyoruz — /api/recipe tek seferlik
    // bir uc nokta oldugu icin gercek bir sohbet gecmisi tutmuyor, baglam
    // burada metne gomuluyor (bkz. lib/ai/buildRecipePrompt.ts).
    const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
    const previousTitles = lastAssistantMessage?.recipes?.map((r) => r.title).join(", ");
    const combinedText = previousTitles
      ? `Önceki tarif(ler): ${previousTitles}. Ek istek: ${trimmed || "(fotoğrafa bak)"}`
      : trimmed;

    setIsSendingFollowUp(true);
    setFollowUpError(null);

    const userMessage: ChatMessage = {
      id: makeMessageId(),
      role: "user",
      text: trimmed || "Fotoğrafımdaki malzemelerle ne yapabilirim?",
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setFollowUpText("");
    setFollowUpPhoto(null);

    try {
      const recipes = await requestRecipes(combinedText, followUpPhoto ?? undefined);
      setMessages((prev) => [
        ...prev,
        { id: makeMessageId(), role: "assistant", recipes, createdAt: Date.now() },
      ]);
    } catch (err) {
      setFollowUpError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSendingFollowUp(false);
    }
  }

  function handleCycleMode() {
    const currentIndex = RECIPE_MODE_KEYS.indexOf(recipeMode);
    const nextMode = RECIPE_MODE_KEYS[(currentIndex + 1) % RECIPE_MODE_KEYS.length];
    dispatch(setRecipeMode(nextMode));
  }

  function handleSelectEntry(entry: HistoryEntry) {
    dispatch(setPersonCount(entry.personCount));
    dispatch(setEquipment(buildEquipmentState(entry.equipment)));
    dispatch(setRecipeMode(entry.mode));

    if (entry.messages && entry.messages.length > 0) {
      // "Test uzun sohbet" gibi tam mesaj dizisi saklanan tanıtım kayıtları
      // (bkz. historySlice.ts buildLongTestConversation) doğrudan kullanılır.
      setMessages(entry.messages);
      setStatus("idle");
      setFollowUpError(null);
      return;
    }

    // Gecmis kayitlarda normalde sadece tarif basliklari saklaniyor (fotograf/
    // tam adimlar tutulmuyor, bkz. lib/redux/historySlice.ts) — bu yuzden eski
    // bir sohbet secildiginde tam RecipeMessageCard yeniden olusturulamiyor,
    // en iyi caba (best-effort) olarak baslikları metin balonu ile gosteriyoruz.
    const equipmentLabels = entry.equipment.map((key) => EQUIPMENT_LABELS[key]).join(", ");
    setMessages([
      {
        id: makeMessageId(),
        role: "user",
        text: entry.ingredientsText || (entry.hadPhoto ? "Fotoğrafımdaki malzemelerle ne yapabilirim?" : ""),
        createdAt: entry.createdAt,
      },
      {
        id: makeMessageId(),
        role: "assistant",
        text:
          entry.recipeTitles.length > 0
            ? `${entry.recipeTitles.join(", ")} (${equipmentLabels} · ${entry.personCount} kişilik)`
            : "Bu sohbet için kayıtlı tarif bulunamadı.",
        createdAt: entry.createdAt,
      },
    ]);
    setStatus("idle");
    setFollowUpError(null);
  }

  // /favorites'teki "Sohbet Favorileri" bir kaydı ?entryId=... ile buraya
  // yönlendiriyor — history localStorage'dan asenkron rehydrate olduğu için
  // (bkz. StoreProvider.tsx) entry ilk render'da henüz bulunamayabilir, bu
  // yüzden history değişince tekrar denenir; appliedEntryId bir kez
  // uygulandıktan sonra tekrar tekrar seçilmesini engeller.
  const appliedEntryId = useRef<string | null>(null);
  useEffect(() => {
    const entryId = searchParams.get("entryId");
    if (!entryId || appliedEntryId.current === entryId) return;
    const entry = history.find((item) => item.id === entryId);
    if (!entry) return;
    appliedEntryId.current = entryId;
    queueMicrotask(() => handleSelectEntry(entry));
    // handleSelectEntry her render'da yeniden tanımlanıyor (useCallback yok);
    // deps'e eklemek yerine yukarıdaki appliedEntryId koruması tek seferlik
    // uygulanmasını garanti ediyor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, history]);

  return (
    <div className="flex flex-1 items-start gap-6 bg-surface-warm px-4 pt-12">
      <ChatSidebar onNewChat={handleNewChat} onSelectEntry={handleSelectEntry} disabled={isSendingFollowUp} />

      <div className="flex flex-1 justify-center">
        {hasStartedChat ? (
          // Sidebar'daki sabit yükseklik deseniyle aynı (bkz. ChatSidebar.tsx
          // h-[calc(100vh-5.5rem)]) — mesaj kutusu her zaman ekranın gerçek
          // altına yaslanır, mesaj listesi ise kendi içinde kayar; az mesajla
          // (kısa sohbet) da giriş kutusu sayfanın üst kısmında kalmaz.
          // İç mesaj listesi tam genişlikte (w-full) taşıyor, kaydırma
          // çubuğu bu yüzden ekranın gerçek sağına yaslanıyor; mesaj
          // baloncukları ise içteki max-w-2xl sarmalayıcıyla ortada dar
          // kalıyor — önceden overflow-y-auto doğrudan dar sütunda olduğu
          // için kaydırma çubuğu sayfanın ortasında, boşlukla çevrili
          // görünüyordu.
          <div className="sticky top-[4.75rem] -mt-12 flex h-[calc(100vh-5.5rem)] w-full flex-col gap-4 pb-3">
            <div aria-live="polite" className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto pt-6">
              <div className="flex w-full max-w-2xl flex-col gap-4">
                {messages.map((message) => (
                  <ChatMessageBubble key={message.id} message={message} />
                ))}
                {isSendingFollowUp && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-surface-text-muted">
                      Tarif hazırlanıyor…
                    </div>
                  </div>
                )}
                {followUpError && (
                  <p role="alert" className="text-center text-sm text-state-error">
                    {followUpError}
                  </p>
                )}
                <div ref={threadEndRef} />
              </div>
            </div>

            <div className="mx-auto w-full max-w-2xl">
              <ChatMessageInput
                value={followUpText}
                onChange={setFollowUpText}
                onSend={handleFollowUpSend}
                disabled={isSendingFollowUp || limitReached}
                mode={recipeMode}
                onCycleMode={handleCycleMode}
                photoDataUrl={followUpPhoto}
                onAttachPhoto={setFollowUpPhoto}
              />

              {isFreeMode && (
                <p
                  className={`mt-2 text-center text-xs ${limitReached ? "text-state-error" : "text-surface-text-muted"}`}
                >
                  {limitReached
                    ? `Ücretsiz mod limitine ulaştın (${usageCount}/${FREE_USAGE_LIMIT}).`
                    : `Ücretsiz modda kullanılan istek: ${usageCount}/${FREE_USAGE_LIMIT}`}
                </p>
              )}
            </div>
          </div>
        ) : (
          // hasStartedChat dalıyla aynı sabit yükseklik bandı — form uzun
          // olduğunda (ekipman seçenekleriyle) kendi içinde kayar, sayfanın
          // kendisi hiç kaydırılmaz. Sayfa gerçekten kaydırıldığında,
          // ChatSidebar'ın sticky+negatif margin ile sağladığı NavBar'a
          // yaslanma bir anlığına bozuluyordu (bkz. commit geçmişi) —
          // /chat'i asla page-scroll gerektirmeyecek şekilde tutmak bunu
          // kökünden ortadan kaldırıyor.
          <div className="sticky top-[4.75rem] -mt-12 flex h-[calc(100vh-5.5rem)] w-full flex-col items-center overflow-y-auto pt-6">
            <div className="w-full max-w-2xl">
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
            </div>
          </div>
        )}
      </div>

      <CookingTimer />
    </div>
  );
}
