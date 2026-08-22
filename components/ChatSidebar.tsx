"use client";

import { Plus, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setHistory, toggleHistoryFavorite, type HistoryEntry } from "@/lib/redux/historySlice";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
}

function summarize(entry: HistoryEntry): string {
  return `${entry.equipment.map((key) => EQUIPMENT_LABELS[key]).join(", ")} · ${entry.personCount} kişilik`;
}

function HistoryRow({
  entry,
  onSelectEntry,
}: {
  entry: HistoryEntry;
  onSelectEntry: (entry: HistoryEntry) => void;
}) {
  const dispatch = useAppDispatch();

  return (
    <li className="flex items-start gap-1 rounded-lg border border-surface-border px-3 py-2 text-xs text-surface-text-muted">
      <button type="button" onClick={() => onSelectEntry(entry)} className="min-w-0 flex-1 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate">{summarize(entry)}</span>
          <span className="shrink-0">{DATE_FORMATTER.format(entry.createdAt)}</span>
        </div>
        {entry.recipeTitles.length > 0 && (
          <p className="mt-1 truncate text-foreground">{entry.recipeTitles.join(", ")}</p>
        )}
      </button>
      <button
        type="button"
        onClick={() => dispatch(toggleHistoryFavorite(entry.id))}
        aria-label={entry.isFavorite ? "Favoriden çıkar" : "Favorilere ekle"}
        aria-pressed={entry.isFavorite}
        className="shrink-0 text-surface-text-muted hover:text-brand-orange"
      >
        <Star
          size={16}
          aria-hidden="true"
          fill={entry.isFavorite ? "currentColor" : "none"}
          className={entry.isFavorite ? "text-brand-orange" : undefined}
        />
      </button>
    </li>
  );
}

/** Chat sayfasının solundaki gezinme alanı: yeni sohbet başlatma + geçmiş
 * istekleri (bkz. historySlice) favori/eski olarak iki grupta listeler. */
export default function ChatSidebar({ onNewChat, onSelectEntry }: ChatSidebarProps) {
  const history = useAppSelector((state) => state.history);
  const dispatch = useAppDispatch();
  const favorites = history.filter((entry) => entry.isFavorite);
  const others = history.filter((entry) => !entry.isFavorite);

  function handleClearOthers() {
    if (window.confirm("Favorilenmeyen tüm sohbet geçmişini silmek istediğine emin misin?")) {
      dispatch(setHistory(favorites));
    }
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-5 self-start rounded-2xl bg-surface-card p-4 shadow-sm lg:flex">
      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark"
      >
        <Plus size={16} aria-hidden="true" />
        Yeni sohbet
      </button>

      {favorites.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Favori sohbetler</span>
          <ul className="flex flex-col gap-2">
            {favorites.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} onSelectEntry={onSelectEntry} />
            ))}
          </ul>
        </div>
      )}

      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Eski sohbetler</span>
            <button
              type="button"
              onClick={handleClearOthers}
              className="text-xs text-surface-text-muted hover:text-brand-orange"
            >
              Temizle
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {others.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} onSelectEntry={onSelectEntry} />
            ))}
          </ul>
        </div>
      )}

      {favorites.length === 0 && others.length === 0 && (
        <p className="text-xs text-surface-text-muted">Henüz bir sohbet geçmişin yok.</p>
      )}
    </aside>
  );
}
