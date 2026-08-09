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
      "Kendi Claude, OpenAI, Gemini ya da Groq anahtarını girersen ücretsiz moddaki kullanım limiti kalkar. Bu anahtar da yalnızca tarayıcında tutulur.",
  },
  {
    question: "Tarif videosu her zaman geliyor mu?",
    answer:
      "Hayır, video önerisi en iyi çaba (best-effort) ile eklenir; bulunamazsa tarif yine de gösterilir, sadece video bölümü olmaz.",
  },
  {
    question: "API anahtarımı nereden alabilirim?",
    answer:
      "Dört sağlayıcıdan (Groq, Gemini, Claude, OpenAI) birini seçip profil sayfasındaki \"Premium mod\" kutusuna anahtarını girebilirsin. Groq ve Gemini ücretsiz katmanla başlar ve kredi kartı istemez (console.groq.com/keys, aistudio.google.com/apikey); Claude ve OpenAI genelde ücretlidir. Not: Groq fotoğraf tanıma desteklemiyor, sadece yazılı malzeme girişiyle çalışır.",
    guideUrl: "/api-key-rehberi.pdf",
  },
];

export default function HelpSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 border-t border-surface-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-left text-sm font-medium text-foreground hover:text-brand-orange"
      >
        Need help? {open ? "▲" : "▼"}
      </button>

      {open && (
        <dl className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-medium text-foreground">
                {item.question}
              </dt>
              <dd className="text-xs text-surface-text-muted">
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
