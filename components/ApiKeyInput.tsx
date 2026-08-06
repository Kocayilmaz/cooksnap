"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearApiKey, setKey, setProvider, type PremiumProvider } from "@/lib/redux/apiKeySlice";

const PROVIDER_LABELS: Record<PremiumProvider, string> = {
  claude: "Claude",
  openai: "OpenAI",
};

export default function ApiKeyInput() {
  const [open, setOpen] = useState(false);
  const { provider, key } = useAppSelector((state) => state.apiKey);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-2 border-t border-surface-border pt-4 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-left text-sm font-medium text-foreground hover:text-brand-orange dark:text-zinc-300 dark:hover:text-zinc-50"
      >
        Premium mod (kendi API anahtarın) {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-surface-text-muted dark:text-zinc-400">
            Kendi Claude veya OpenAI anahtarını girersen ücretsiz mod limiti kalkar. Anahtar
            yalnızca bu tarayıcıda saklanır, sunucuya kalıcı olarak kaydedilmez.
          </p>

          <div role="group" aria-label="API sağlayıcısı" className="flex gap-2">
            {(Object.keys(PROVIDER_LABELS) as PremiumProvider[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => dispatch(setProvider(option))}
                aria-pressed={provider === option}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  provider === option
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-surface-border text-foreground hover:bg-surface-warm dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {PROVIDER_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(event) => dispatch(setKey(event.target.value))}
              placeholder={`${PROVIDER_LABELS[provider]} API anahtarı`}
              aria-label={`${PROVIDER_LABELS[provider]} API anahtarı`}
              autoComplete="off"
              className="w-full rounded-lg border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-orange dark:border-zinc-700"
            />
            {key && (
              <button
                type="button"
                onClick={() => dispatch(clearApiKey())}
                className="shrink-0 rounded-lg border border-surface-border px-3 py-2 text-sm text-surface-text-muted hover:bg-surface-warm dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Temizle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
