import RecipeMessageCard from "@/components/RecipeMessageCard";
import type { ChatMessage } from "@/lib/types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

/** Sohbet akışındaki tek bir balon — kullanıcının mesajı sağa hizalı düz
 * balon, AI'ın yanıtı sola hizalı (varsa metin + tarif kart(lar)ı) olarak
 * render edilir (bkz. app/chat/page.tsx). */
export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-orange px-4 py-2.5 text-sm text-white">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {message.text && (
        <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-foreground">
          {message.text}
        </div>
      )}
      {message.recipes?.map((recipe, index) => (
        <RecipeMessageCard key={`${recipe.equipment}-${index}`} recipe={recipe} />
      ))}
    </div>
  );
}
