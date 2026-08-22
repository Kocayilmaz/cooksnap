"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import type { MealSearchResult } from "@/lib/types/meal";
import type { MealSearchResponse } from "@/app/api/meals/search/route";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

export default function MealSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MealSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const showDropdown = isOpen && query.trim().length >= MIN_QUERY_LENGTH;

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

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-96 overflow-y-auto rounded-xl border border-surface-border bg-surface-card p-1.5 shadow-md">
          {status === "loading" && (
            <p className="px-3 py-2 text-sm text-surface-text-muted">Aranıyor…</p>
          )}
          {status === "error" && (
            <p className="px-3 py-2 text-sm text-state-error">Arama şu an kullanılamıyor.</p>
          )}
          {status === "idle" && results.length === 0 && (
            <div className="flex flex-col gap-1 px-3 py-2 text-sm">
              <p className="text-surface-text-muted">
                &quot;{query.trim()}&quot; için sonuç bulunamadı.
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
              <Link
                key={meal.id}
                href={`/meal/${meal.id}`}
                onClick={() => setIsOpen(false)}
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
            ))}
        </div>
      )}
    </div>
  );
}
