"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setName, setLanguage, setCountry, type RecipeLanguage } from "@/lib/redux/userProfileSlice";

const LANGUAGE_LABELS: Record<RecipeLanguage, string> = {
  tr: "Türkçe",
  en: "English",
};

export default function ProfilePage() {
  const { name, language, country } = useAppSelector((state) => state.userProfile);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-red">Profil</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bu bilgiler tarayıcında saklanır ve tariflerini kişiselleştirmek için kullanılır.
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ad soyad</span>
          <input
            type="text"
            value={name}
            onChange={(event) => dispatch(setName(event.target.value))}
            placeholder="Adın soyadın"
            className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-orange dark:border-zinc-700"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Dil</span>
          <div className="flex gap-2">
            {(Object.keys(LANGUAGE_LABELS) as RecipeLanguage[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => dispatch(setLanguage(key))}
                aria-pressed={language === key}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  language === key
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {LANGUAGE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ülke</span>
          <input
            type="text"
            value={country}
            onChange={(event) => dispatch(setCountry(event.target.value))}
            placeholder="Örn: Türkiye"
            className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-orange dark:border-zinc-700"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Tarifler bu ülkenin mutfağına öncelik verir, ama kesin bir kısıtlama değildir.
          </span>
        </label>
      </main>
    </div>
  );
}
