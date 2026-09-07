"use client";

import { useRef } from "react";
import { ArrowUp, ChefHat, Mic, Plus, X } from "lucide-react";
import type { RecipeMode } from "@/lib/redux/recipeModeSlice";

const MODE_LABELS: Record<RecipeMode, string> = {
  student: "Öğrenci",
  home: "Ev yemeği",
  chef: "Aşçı",
};

interface ChatMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  mode: RecipeMode;
  onCycleMode: () => void;
  photoDataUrl: string | null;
  onAttachPhoto: (dataUrl: string | null) => void;
}

/** /chat sayfasının alt kısmındaki, sohbete devam etmek için kalıcı mesaj
 * kutusu — tek seferlik formun aksine, ilk tarif alındıktan sonra takip
 * mesajları göndermek için kullanılır (bkz. app/chat/page.tsx). */
export default function ChatMessageInput({
  value,
  onChange,
  onSend,
  disabled,
  mode,
  onCycleMode,
  photoDataUrl,
  onAttachPhoto,
}: ChatMessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = !disabled && (value.trim().length > 0 || Boolean(photoDataUrl));

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onAttachPhoto(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      {photoDataUrl && (
        <div className="flex w-fit items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-2 py-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL onizleme, next/image gerektirmiyor */}
          <img src={photoDataUrl} alt="Eklenen fotoğraf" className="h-10 w-10 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onAttachPhoto(null)}
            aria-label="Fotoğrafı kaldır"
            className="text-surface-text-muted hover:text-brand-orange"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-card px-2 py-2 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Fotoğraf ekle"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange"
        >
          <Plus size={18} aria-hidden="true" />
        </button>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ek bir şey sor ya da malzeme ekle…"
          rows={1}
          disabled={disabled}
          className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-surface-text-muted"
        />

        <button
          type="button"
          onClick={onCycleMode}
          disabled={disabled}
          title="Tarif modunu değiştir"
          className="hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange sm:flex"
        >
          <ChefHat size={14} aria-hidden="true" />
          {MODE_LABELS[mode]}
        </button>

        <button
          type="button"
          disabled
          title="Sesli giriş yakında"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-surface-text-muted opacity-50"
        >
          <Mic size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Gönder"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-surface-text-muted"
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="text-center text-[11px] text-surface-text-muted sm:hidden">Mod: {MODE_LABELS[mode]}</p>
    </div>
  );
}
