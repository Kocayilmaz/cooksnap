"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearHistory } from "@/lib/redux/historySlice";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Ana sayfada, kullanıcının önceki aramalarını kısaca özetleyen liste (bkz. historySlice). */
export default function RecipeHistoryList() {
  const history = useAppSelector((state) => state.history);
  const dispatch = useAppDispatch();

  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-surface-border pt-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground dark:text-zinc-300">
          Son aramalar
        </span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Tüm arama geçmişini silmek istediğine emin misin?")) {
              dispatch(clearHistory());
            }
          }}
          className="text-xs text-surface-text-muted hover:text-brand-orange dark:text-zinc-500"
        >
          Geçmişi temizle
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {history.map((entry) => (
          <li
            key={entry.id}
            className="rounded-lg border border-surface-border px-3 py-2 text-xs text-surface-text-muted dark:border-zinc-800 dark:text-zinc-400"
          >
            <div className="flex items-center justify-between gap-2">
              <span>
                {entry.equipment.map((key) => EQUIPMENT_LABELS[key]).join(", ")} ·{" "}
                {entry.personCount} kişilik
              </span>
              <span>{DATE_FORMATTER.format(entry.createdAt)}</span>
            </div>
            {entry.recipeTitles.length > 0 && (
              <p className="mt-1 text-foreground dark:text-zinc-300">
                {entry.recipeTitles.join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
