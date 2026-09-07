import PhotoUpload from "@/components/PhotoUpload";
import IngredientTextInput from "@/components/IngredientTextInput";
import PersonCountSelector from "@/components/PersonCountSelector";
import EquipmentSelector from "@/components/EquipmentSelector";
import RecipeModeSelector from "@/components/RecipeModeSelector";
import LoadingSpinner from "@/components/LoadingSpinner";

interface NewChatFormProps {
  ingredientsText: string;
  onIngredientsChange: (value: string) => void;
  onPhotoSelected: (dataUrl: string | null) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isLoading: boolean;
  limitReached: boolean;
  isFreeMode: boolean;
  usageCount: number;
  freeUsageLimit: number;
  error: string | null;
}

/** /chat sayfasının ilk (henüz hiç mesaj gönderilmemiş) hali — fotoğraf/
 * malzeme/kişi sayısı/ekipman/mod formu. İlk istek gönderildikten sonra
 * app/chat/page.tsx bunun yerine sohbet akışını (ChatMessageBubble) gösterir. */
export default function NewChatForm({
  ingredientsText,
  onIngredientsChange,
  onPhotoSelected,
  onSubmit,
  canSubmit,
  isLoading,
  limitReached,
  isFreeMode,
  usageCount,
  freeUsageLimit,
  error,
}: NewChatFormProps) {
  return (
    <main className="flex w-full max-w-md flex-col gap-8 rounded-2xl bg-surface-card p-8 shadow-sm">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-red">CookSnap</h1>
        <p className="text-sm text-surface-text-muted">
          Fotoğraf çek ya da malzemeleri yaz, elindekilere göre tarifini al.
        </p>
      </div>

      <PhotoUpload onPhotoSelected={onPhotoSelected} />
      <IngredientTextInput value={ingredientsText} onChange={onIngredientsChange} />
      <PersonCountSelector />
      <EquipmentSelector />
      <RecipeModeSelector />

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || isLoading || limitReached}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {isLoading && <LoadingSpinner size={16} />}
        {isLoading ? "Tarif hazırlanıyor…" : "Tarifi getir"}
      </button>

      {isFreeMode && limitReached && (
        <p className="text-center text-xs text-state-error">
          Ücretsiz mod limitine ulaştın ({usageCount}/{freeUsageLimit}). Devam etmek için Profil
          sayfasından kendi Claude/OpenAI anahtarını girebilirsin.
        </p>
      )}

      {isFreeMode && !limitReached && (
        <p className="text-center text-xs text-surface-text-muted">
          Ücretsiz modda kullanılan istek: {usageCount}/{freeUsageLimit}
        </p>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-state-error">
          {error}
        </p>
      )}
    </main>
  );
}
