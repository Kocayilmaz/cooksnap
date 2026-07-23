"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { makeFavoriteId, toggleFavorite } from "@/lib/redux/favoritesSlice";
import type { Equipment } from "@/lib/redux/equipmentSlice";

interface FavoriteButtonProps {
  equipment: Equipment;
  title: string;
  steps: string[];
  videoId?: string | null;
}

export default function FavoriteButton({ equipment, title, steps, videoId }: FavoriteButtonProps) {
  const id = makeFavoriteId(equipment, title);
  const isFavorite = useAppSelector((state) => Boolean(state.favorites[id]));
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      onClick={() => dispatch(toggleFavorite({ id, equipment, title, steps, videoId }))}
      className={`shrink-0 text-lg transition-colors ${
        isFavorite ? "text-brand-orange" : "text-surface-text-muted hover:text-brand-orange dark:text-zinc-500"
      }`}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}
