"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MessageCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addMealSearchHistoryEntry, clearMealSearchHistory } from "@/lib/redux/mealSearchHistorySlice";
import type { MealSearchResult } from "@/lib/types/meal";
import type { MealSearchResponse } from "@/app/api/meals/search/route";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

// TheMealDB tamamen İngilizce ama sonuçsuz aramalar otomatik çeviriyle tekrar
// deneniyor (bkz. app/api/meals/search/route.ts), bu yüzden Türkçe terimler
// burada da işe yarıyor.
const POPULAR_SEARCHES = ["Tavuk", "Makarna", "Çorba", "Kek", "Balık", "Pilav", "Salata", "Dana"];

function MealResultLink({ meal, onSelect }: { meal: MealSearchResult; onSelect: () => void }) {
  return (
    <Link
      href={`/meal/${meal.id}`}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-warm"
    >
      <Image
        src={`${meal.thumbnail}/preview`}
        alt=""
        width={40}
        height={40}
        className="rounded-lg object-cover"
      />
      <div className="flex flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-foreground">{meal.name}</span>
        <span className="truncate text-xs text-surface-text-muted">
          {[meal.category, meal.area].filter(Boolean).join(" · ")}
        </span>
      </div>
    </Link>
  );
}

export default function MealSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MealSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const searchHistory = useAppSelector((state) => state.mealSearchHistory);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/meals/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as MealSearchResponse;
        setResults(data.meals ?? []);
        setStatus("idle");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectMeal(meal: MealSearchResult) {
    setIsOpen(false);
    // Geçmiş aramalar API'ye tekrar istek atmadan hafızadan (localStorage)
    // gösterilir — bkz. lib/redux/mealSearchHistorySlice.ts (max kayıt aşılınca
    // en eski arama unutulur).
    dispatch(addMealSearchHistoryEntry(meal));
  }

  const trimmedQuery = query.trim();
  const isBrowsing = trimmedQuery.length < MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative mx-4 w-full max-w-md flex-1">
      <form role="search" onSubmit={(event) => event.preventDefault()} className="w-full">
        <div className="relative w-full">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Tarif, malzeme ara"
            aria-label="Tarif, malzeme ara"
            className="w-full rounded-full border border-surface-border bg-surface-warm py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-orange"
          />
        </div>
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-96 overflow-y-auto rounded-xl border border-surface-border bg-surface-card p-1.5 shadow-md">
          {isBrowsing ? (
            <>
              {searchHistory.length > 0 && (
                <div className="mb-1 border-b border-surface-border pb-1">
                  <div className="flex items-center justify-between px-3 pt-1">
                    <span className="text-xs font-semibold text-surface-text-muted">
                      Geçmiş aramalar
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(clearMealSearchHistory())}
                      className="text-xs text-surface-text-muted hover:text-brand-orange"
                    >
                      Temizle
                    </button>
                  </div>
                  {searchHistory.map((meal) => (
                    <MealResultLink key={meal.id} meal={meal} onSelect={() => handleSelectMeal(meal)} />
                  ))}
                </div>
              )}

              <div>
                <span className="block px-3 pt-1 text-xs font-semibold text-surface-text-muted">
                  Popüler aramalar
                </span>
                <div className="flex flex-wrap gap-2 px-3 py-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-surface-border px-3 py-1 text-xs text-foreground transition-colors hover:border-brand-orange hover:text-brand-orange"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/chat"
                onClick={() => setIsOpen(false)}
                className="mt-1 flex items-center justify-center gap-2 rounded-lg border-t border-surface-border px-3 py-2.5 text-sm font-medium text-brand-orange transition-colors hover:bg-surface-warm"
              >
                <MessageCircle size={16} aria-hidden="true" />
                AI&apos;dan tarif iste
              </Link>
            </>
          ) : (
            <>
              {status === "loading" && (
                <p className="px-3 py-2 text-sm text-surface-text-muted">Aranıyor…</p>
              )}
              {status === "error" && (
                <p className="px-3 py-2 text-sm text-state-error">Arama şu an kullanılamıyor.</p>
              )}
              {status === "idle" && results.length === 0 && (
                <div className="flex flex-col gap-1 px-3 py-2 text-sm">
                  <p className="text-surface-text-muted">
                    &quot;{trimmedQuery}&quot; için sonuç bulunamadı.
                  </p>
                  <Link
                    href="/chat"
                    onClick={() => setIsOpen(false)}
                    className="font-medium text-brand-orange hover:underline"
                  >
                    Chat&apos;te AI&apos;dan bu tarifi iste →
                  </Link>
                </div>
              )}
              {status === "idle" &&
                results.map((meal) => (
                  <MealResultLink key={meal.id} meal={meal} onSelect={() => handleSelectMeal(meal)} />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
