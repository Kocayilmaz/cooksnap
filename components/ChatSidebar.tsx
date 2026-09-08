"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Ellipsis, MessageCircle, PanelLeft, PencilLine, Pin, PinOff, Search, SquarePen, Star, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  deleteHistoryEntry,
  renameHistoryEntry,
  setHistory,
  toggleHistoryFavorite,
  type HistoryEntry,
} from "@/lib/redux/historySlice";
import { EQUIPMENT_LABELS } from "@/lib/redux/equipmentSlice";
import SidebarCookingTimer from "@/components/SidebarCookingTimer";

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

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

/** Kullanıcı yeniden adlandırmadıysa tarif başlıklarından, o da yoksa
 * ekipman/kişi sayısı özetinden bir görünen başlık türetir. */
function displayTitle(entry: HistoryEntry): string {
  if (entry.customTitle) return entry.customTitle;
  if (entry.recipeTitles.length > 0) return entry.recipeTitles.join(", ");
  return summarize(entry);
}

/** Daraltılmış (ikon şeridi) haldeyken native `title` tooltip'i yerine
 * özel, stillendirilebilir bir etiket gösterir (yuvarlak köşeler, turuncu
 * yazı, ikon hover'ıyla aynı arka plan). Genişkenken sarmalama yapmadan
 * çocukları doğrudan döner — o zaman zaten görünür bir metin etiketi var. */
function IconWithTooltip({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}) {
  if (!collapsed) return <>{children}</>;
  return (
    <div className="group relative mx-auto">
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-surface-warm px-2.5 py-1.5 text-xs font-medium text-brand-orange-dark opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function HistoryRow({
  entry,
  onSelectEntry,
  disabled,
}: {
  entry: HistoryEntry;
  onSelectEntry: (entry: HistoryEntry) => void;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(() => displayTitle(entry));
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  function startRenaming() {
    setMenuOpen(false);
    setDraftTitle(displayTitle(entry));
    setIsRenaming(true);
  }

  function commitRename() {
    dispatch(renameHistoryEntry({ id: entry.id, title: draftTitle }));
    setIsRenaming(false);
  }

  function cancelRename() {
    setDraftTitle(displayTitle(entry));
    setIsRenaming(false);
  }

  function handleDelete() {
    setMenuOpen(false);
    if (window.confirm("Bu sohbeti silmek istediğine emin misin?")) {
      dispatch(deleteHistoryEntry(entry.id));
    }
  }

  return (
    <li className="group relative flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-warm">
      {isRenaming ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitRename();
            } else if (event.key === "Escape") {
              event.preventDefault();
              cancelRename();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-brand-orange bg-surface-card px-1.5 py-1 text-xs text-foreground outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => onSelectEntry(entry)}
          disabled={disabled}
          title={`${summarize(entry)} · ${DATE_FORMATTER.format(entry.createdAt)}`}
          className="min-w-0 flex-1 truncate text-left font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {displayTitle(entry)}
        </button>
      )}

      {!isRenaming && (
        <div
          ref={actionsRef}
          className={`relative flex shrink-0 items-center gap-0.5 ${
            menuOpen ? "visible" : "invisible group-hover:visible"
          }`}
        >
          <button
            type="button"
            onClick={() => dispatch(toggleHistoryFavorite(entry.id))}
            aria-label={entry.isFavorite ? "Sohbeti sabitlemeyi kaldır" : "Sohbeti sabitle"}
            aria-pressed={entry.isFavorite}
            className="flex h-6 w-6 items-center justify-center rounded-md text-surface-text-muted hover:bg-surface-border hover:text-brand-orange-dark"
          >
            {entry.isFavorite ? (
              <PinOff size={13} aria-hidden="true" />
            ) : (
              <Pin size={13} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Sohbet seçenekleri"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-6 w-6 items-center justify-center rounded-md text-surface-text-muted hover:bg-surface-border hover:text-brand-orange-dark"
          >
            <Ellipsis size={14} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-7 z-10 w-44 overflow-hidden rounded-lg border border-surface-border bg-surface-card py-1 shadow-md"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  dispatch(toggleHistoryFavorite(entry.id));
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-surface-warm"
              >
                {entry.isFavorite ? (
                  <PinOff size={13} aria-hidden="true" />
                ) : (
                  <Pin size={13} aria-hidden="true" />
                )}
                {entry.isFavorite ? "Sabitlemeyi kaldır" : "Sohbeti sabitle"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={startRenaming}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-surface-warm"
              >
                <PencilLine size={13} aria-hidden="true" />
                Yeniden adlandır
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-state-error hover:bg-surface-warm"
              >
                <Trash2 size={13} aria-hidden="true" />
                Sil
              </button>
            </div>
          )}
        </div>
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
  // Arama, ChatGPT'deki gibi varsayılan olarak sadece bir ikon — tıklanınca
  // gerçek arama kutusuna dönüşür, boşken odak kaybedince tekrar ikona döner.
  const [searchOpen, setSearchOpen] = useState(false);

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
    // top/h, NavBar'in gercek yuksekligiyle (~76px, bkz. NavBar.tsx py-3 +
    // logo 50px) eslesecek sekilde ayarlandi: sabit yukseklik (max-h degil)
    // kullanildigi icin gecmis az/bos olsa bile sidebar viewport'un ayni
    // dilimini kaplar ve alttaki zamanlayici gercekten ekranin altina
    // yaslanir; gecmis coksa da ayni alan icinde kendi icinde kaydirilir.
    // Ayrica kutu/kart görünümü yok — ana içerikten sadece sağdaki tek
    // çizgiyle (border-r) ayrılıyor, arka planı sayfanınkiyle aynı.
    <aside
      className={`sticky top-[4.75rem] hidden h-[calc(100vh-11rem)] shrink-0 flex-col border-r border-surface-border p-3 transition-[width] lg:flex ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Başlık (kapatma/arama/yeni sohbet) tek kaydırma alanının İÇİNDE,
       * sticky top-0 ile — böylece kaydırma çubuğu görsel olarak sidebar'ın
       * en tepesinden başlar, ama işlev aynı: bu kısım kayarken yerinde
       * sabit kalır. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="sticky top-0 z-10 flex flex-col gap-1 bg-surface-warm pb-3">
          <div className={`flex items-center gap-1 ${collapsed ? "justify-center" : "justify-between"}`}>
            {!collapsed &&
              (searchOpen ? (
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-text-muted"
                  />
                  <input
                    autoFocus
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onBlur={() => {
                      if (!searchTerm.trim()) setSearchOpen(false);
                    }}
                    placeholder="Sohbetlerde ara"
                    className="w-full rounded-full border border-surface-border bg-surface-card py-2 pl-8 pr-3 text-xs text-foreground outline-none placeholder:text-surface-text-muted focus:border-brand-orange"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  title="Ara"
                  aria-label="Ara"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange-dark"
                >
                  <Search size={16} aria-hidden="true" />
                </button>
              ))}

            <IconWithTooltip label={collapsed ? "Kenar çubuğunu aç" : "Kenar çubuğunu kapat"} collapsed={collapsed}>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "Kenar çubuğunu aç" : "Kenar çubuğunu kapat"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange-dark"
              >
                <PanelLeft size={16} aria-hidden="true" />
              </button>
            </IconWithTooltip>
          </div>

          <IconWithTooltip label="Yeni sohbet" collapsed={collapsed}>
            <button
              type="button"
              onClick={onNewChat}
              disabled={disabled}
              title={collapsed ? undefined : "Yeni sohbet"}
              aria-label="Yeni sohbet"
              className={
                collapsed
                  ? "flex h-9 w-9 items-center justify-center rounded-lg text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
                  : "flex items-center justify-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
              }
            >
              <SquarePen size={16} aria-hidden="true" />
              {!collapsed && "Yeni sohbet"}
            </button>
          </IconWithTooltip>

          {collapsed && (
            <>
              <IconWithTooltip label="Ara" collapsed={collapsed}>
                <button
                  type="button"
                  onClick={() => {
                    setCollapsed(false);
                    setSearchOpen(true);
                  }}
                  aria-label="Ara"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange-dark"
                >
                  <Search size={16} aria-hidden="true" />
                </button>
              </IconWithTooltip>
              <IconWithTooltip label="Son sohbetler" collapsed={collapsed}>
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  aria-label="Son sohbetler"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-text-muted transition-colors hover:bg-surface-warm hover:text-brand-orange-dark"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                </button>
              </IconWithTooltip>
            </>
          )}
        </div>

        {/* Daraltılmış (ikon şeridi) haldeyken tek tek sohbet geçmişi
         * gösterilmiyor — sadece yeni sohbet/arama/zamanlayıcı ile sınırlı
         * kalıyor. */}
        {!collapsed && (
          <div className="flex flex-col gap-4 pt-3">
            {favorites.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-surface-text-muted">
                  <Star size={12} aria-hidden="true" />
                  Favoriler
                </span>
                <ul className="flex flex-col gap-0.5">
                  {favorites.map((entry) => (
                    <HistoryRow key={entry.id} entry={entry} onSelectEntry={onSelectEntry} disabled={disabled} />
                  ))}
                </ul>
              </div>
            )}

            {others.length > 0 && (
              <div className="flex flex-col gap-2">
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
                <ul className="flex flex-col gap-0.5">
                  {others.map((entry) => (
                    <HistoryRow key={entry.id} entry={entry} onSelectEntry={onSelectEntry} disabled={disabled} />
                  ))}
                </ul>
              </div>
            )}

            {favorites.length === 0 && others.length === 0 && (
              <p className="px-1 text-xs text-surface-text-muted">
                {term ? "Eşleşen bir sohbet bulunamadı." : "Henüz bir sohbet geçmişin yok."}
              </p>
            )}
          </div>
        )}
      </div>

      <SidebarCookingTimer collapsed={collapsed} />
    </aside>
  );
}
