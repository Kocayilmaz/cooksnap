"use client";

import { useState } from "react";
import { MessageCircle, PanelLeft, Plus, Search, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setHistory, toggleHistoryFavorite, type HistoryEntry } from "@/lib/redux/historySlice";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";
import SidebarCookingTimer from "@/components/SidebarCookingTimer";

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Gerçek veride tarife özel bir görsel/emoji tutulmuyor (bkz. historySlice) —
 * her sohbete id'sinden türetilen sabit (render'lar arası değişmeyen) bir
 * yemek emojisi atanır, salt görsel çeşitlilik için. */
const ROW_EMOJIS = ["🍢", "🍲", "🍆", "🍳", "🍝", "🥗", "🍰", "🐟", "🍗", "🥘", "🍜", "🍛"];

function pickEmoji(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ROW_EMOJIS[hash % ROW_EMOJIS.length];
}

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
  /** Bir takip mesajı gönderiliyorken true — yarı yolda sohbet değiştirilip
   * yanıtın kaybolmaması için "Yeni sohbet" ve geçmiş seçimi geçici olarak
   * kapatılır (bkz. app/chat/page.tsx isSendingFollowUp). */
  disabled?: boolean;
}

function summarize(entry: HistoryEntry): string {
  return `${entry.equipment.map((key) => EQUIPMENT_LABELS[key]).join(", ")} · ${entry.personCount} kişilik`;
}

function HistoryRow({
  entry,
  onSelectEntry,
  disabled,
  collapsed,
}: {
  entry: HistoryEntry;
  onSelectEntry: (entry: HistoryEntry) => void;
  disabled?: boolean;
  collapsed: boolean;
}) {
  const dispatch = useAppDispatch();

  return (
    <li
      className={`group relative flex items-center gap-2 rounded-lg border border-surface-border px-2 py-2 text-xs text-surface-text-muted ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onSelectEntry(entry)}
        disabled={disabled}
        title={collapsed ? summarize(entry) : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-surface-border bg-surface-warm text-sm">
          {pickEmoji(entry.id)}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold text-foreground">{summarize(entry)}</span>
              <span className="shrink-0">{DATE_FORMATTER.format(entry.createdAt)}</span>
            </span>
            {entry.recipeTitles.length > 0 && (
              <span className="mt-0.5 block truncate">{entry.recipeTitles.join(", ")}</span>
            )}
          </span>
        )}
      </button>
      {!collapsed && (
        <button
          type="button"
          onClick={() => dispatch(toggleHistoryFavorite(entry.id))}
          aria-label={entry.isFavorite ? "Sohbeti sabitlemeyi kaldır" : "Sohbeti sabitle"}
          aria-pressed={entry.isFavorite}
          className={`shrink-0 text-surface-text-muted hover:text-brand-orange ${
            entry.isFavorite ? "" : "invisible group-hover:visible"
          }`}
        >
          <Star
            size={14}
            aria-hidden="true"
            fill={entry.isFavorite ? "currentColor" : "none"}
            className={entry.isFavorite ? "text-brand-orange" : undefined}
          />
        </button>
      )}
    </li>
  );
}

/** Chat sayfasının solundaki gezinme alanı: yeni sohbet başlatma, arama,
 * geçmiş istekleri (bkz. historySlice) favori/eski olarak iki grupta
 * listeleme, ikon şeridine daraltma ve gömülü mutfak zamanlayıcısı. */
export default function ChatSidebar({ onNewChat, onSelectEntry, disabled }: ChatSidebarProps) {
  const history = useAppSelector((state) => state.history);
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const term = searchTerm.trim().toLowerCase();
  const visible = term
    ? history.filter(
        (entry) =>
          entry.recipeTitles.some((title) => title.toLowerCase().includes(term)) ||
          summarize(entry).toLowerCase().includes(term),
      )
    : history;
  const favorites = visible.filter((entry) => entry.isFavorite);
  const others = visible.filter((entry) => !entry.isFavorite);

  function handleClearOthers() {
    const allOthers = history.filter((entry) => !entry.isFavorite);
    if (allOthers.length === 0) return;
    if (window.confirm("Favorilenmeyen tüm sohbet geçmişini silmek istediğine emin misin?")) {
      dispatch(setHistory(history.filter((entry) => entry.isFavorite)));
    }
  }

  return (
    // top/max-h, NavBar'in gercek yuksekligiyle (~76px, bkz. NavBar.tsx py-3 +
    // logo 50px) eslesecek sekilde ayarlandi: sohbet gecmisi ne kadar uzun
    // olursa olsun sidebar sayfa scroll'una ihtiyac duymadan viewport'a sigar,
    // alttaki zamanlayici her zaman gorunur kalir (sadece gecmis listesi kendi
    // icinde kaydırılır).
    <aside
      className={`sticky top-[4.75rem] hidden max-h-[calc(100vh-11rem)] shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-3 shadow-sm transition-[width] lg:flex ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col gap-3 border-b border-surface-border pb-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <span className="flex items-center gap-1.5 text-sm font-extrabold text-brand-red">
              <MessageCircle size={16} aria-hidden="true" className="text-brand-orange" />
              CookSnap
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange-dark ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            <PanelLeft size={16} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          disabled={disabled}
          title="Yeni sohbet"
          className={`flex items-center justify-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60 ${
            collapsed ? "h-9 w-9 px-0" : ""
          }`}
        >
          <Plus size={16} aria-hidden="true" />
          {!collapsed && "Yeni sohbet"}
        </button>

        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Sohbetlerde ara"
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange-dark"
          >
            <Search size={16} aria-hidden="true" />
          </button>
        ) : (
          <div className="relative">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-text-muted"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Sohbetlerde ara"
              className="w-full rounded-full border border-surface-border bg-surface-warm py-2 pl-8 pr-3 text-xs text-foreground outline-none placeholder:text-surface-text-muted focus:border-brand-orange"
            />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        {favorites.length > 0 && (
          <div className="flex flex-col gap-2">
            {!collapsed && (
              <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-surface-text-muted">
                <Star size={12} aria-hidden="true" />
                Favoriler
              </span>
            )}
            <ul className="flex flex-col gap-2">
              {favorites.map((entry) => (
                <HistoryRow
                  key={entry.id}
                  entry={entry}
                  onSelectEntry={onSelectEntry}
                  disabled={disabled}
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        )}

        {others.length > 0 && (
          <div className="flex flex-col gap-2">
            {!collapsed && (
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-surface-text-muted">
                  <MessageCircle size={12} aria-hidden="true" />
                  Sohbetler
                </span>
                <button
                  type="button"
                  onClick={handleClearOthers}
                  className="text-[11px] text-surface-text-muted hover:text-brand-orange"
                >
                  Temizle
                </button>
              </div>
            )}
            <ul className="flex flex-col gap-2">
              {others.map((entry) => (
                <HistoryRow
                  key={entry.id}
                  entry={entry}
                  onSelectEntry={onSelectEntry}
                  disabled={disabled}
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        )}

        {favorites.length === 0 && others.length === 0 && !collapsed && (
          <p className="px-1 text-xs text-surface-text-muted">
            {term ? "Eşleşen bir sohbet bulunamadı." : "Henüz bir sohbet geçmişin yok."}
          </p>
        )}
      </div>

      <SidebarCookingTimer collapsed={collapsed} />
    </aside>
  );
}
