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
  {
    question: "API anahtarımı nereden alabilirim?",
    answer:
      "Groq (tarif metni) ve Google Gemini (fotoğraf tanıma) tamamen ücretsizdir ve kredi kartı istemez — console.groq.com/keys ve aistudio.google.com/apikey adreslerinden birkaç dakikada alınabilir. Premium moda (sınırsız kullanım) girmek istersen kendi Claude ya da OpenAI anahtarını da profil sayfasındaki \"Premium mod\" kutusuna girebilirsin, bu ikisi genelde ücretlidir.",
    guideUrl: "/api-key-rehberi.pdf",
  },
];

export default function HelpSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 border-t border-surface-border pt-4 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-left text-sm font-medium text-foreground hover:text-brand-orange dark:text-zinc-300 dark:hover:text-zinc-50"
      >
        Need help? {open ? "▲" : "▼"}
      </button>

      {open && (
        <dl className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-medium text-foreground dark:text-zinc-200">
                {item.question}
              </dt>
              <dd className="text-xs text-surface-text-muted dark:text-zinc-400">
                {item.answer}
                {item.guideUrl && (
                  <>
                    {" "}
                    <a
                      href={item.guideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-orange underline hover:no-underline"
                    >
                      Detaylı anlatım için rehberi oku (PDF)
                    </a>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
