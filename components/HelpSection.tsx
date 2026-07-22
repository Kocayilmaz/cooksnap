"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Fotoğraf çekmek zorunda mıyım?",
    answer:
      "Hayır. Ana sayfada fotoğraf yerine elindeki malzemeleri yazabilirsin, ya da ikisini birlikte de kullanabilirsin.",
  },
  {
    question: "Verilerim nerede saklanıyor?",
    answer:
      "Profil bilgilerin (ad, dil, ülke) ve premium API anahtarın sadece bu tarayıcıda (localStorage) saklanır; sunucuya kalıcı olarak gönderilmez.",
  },
  {
    question: "Premium mod ne işe yarar?",
    answer:
      "Kendi Claude veya OpenAI anahtarını girersen ücretsiz moddaki kullanım limiti kalkar. Bu anahtar da yalnızca tarayıcında tutulur.",
  },
  {
    question: "Tarif videosu her zaman geliyor mu?",
    answer:
      "Hayır, video önerisi en iyi çaba (best-effort) ile eklenir; bulunamazsa tarif yine de gösterilir, sadece video bölümü olmaz.",
  },
];

export default function HelpSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-left text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
      >
        Need help? {open ? "▲" : "▼"}
      </button>

      {open && (
        <dl className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {item.question}
              </dt>
              <dd className="text-xs text-zinc-500 dark:text-zinc-400">{item.answer}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
