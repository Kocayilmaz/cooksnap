"use client";

import { useState } from "react";
import { buildRecipeText } from "@/lib/formatRecipeText";

interface CopyRecipeButtonProps {
  title: string;
  steps: string[];
}

/** Tarif başlığı + adımlarını panoya kopyalar, kısa süreliğine "Kopyalandı" geri bildirimi gösterir. */
export default function CopyRecipeButton({ title, steps }: CopyRecipeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildRecipeText(title, steps);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Panoya erişim reddedilmiş olabilir (izin, http olmayan bağlam vb.);
      // sessizce yut, asıl tarif akışını etkilemez.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Tarifi kopyala"
      className="shrink-0 text-xs font-medium text-surface-text-muted transition-colors hover:text-brand-orange dark:text-zinc-500"
    >
      {copied ? "Kopyalandı ✓" : "Kopyala"}
    </button>
  );
}
