"use client";

import type { ReactNode } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import IngredientFilteredMeals from "@/components/IngredientFilteredMeals";

/** Kategori satırları sunucu tarafında hazır geliyor (bkz. app/page.tsx),
 * bu bileşen sadece malzeme seçimine göre onları mı yoksa malzeme
 * filtresini mi göstereceğine karar veriyor. */
export default function HomeCategoryGate({ children }: { children: ReactNode }) {
  const hasSelection = useAppSelector((state) => state.selectedIngredients.length > 0);
  return hasSelection ? <IngredientFilteredMeals /> : <>{children}</>;
}
