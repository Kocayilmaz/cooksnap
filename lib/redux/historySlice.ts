import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Equipment } from "./equipmentSlice";
import type { RecipeMode } from "./recipeModeSlice";

export interface HistoryEntry {
  id: string;
  /** Kullanıcının yazdığı malzeme metni, girilmediyse tanımsız. */
  ingredientsText?: string;
  /** Aramada fotoğraf da kullanıldı mı (fotoğrafın kendisi saklanmaz, sadece bu bayrak). */
  hadPhoto: boolean;
  personCount: number;
  equipment: Equipment[];
  mode: RecipeMode;
  /** Dönen tariflerin başlıkları, geçmiş listesinde kısa önizleme için. */
  recipeTitles: string[];
  createdAt: number;
  /** Kullanıcı bu sohbeti favoriledi mi (bkz. ChatSidebar) — favorilenen kayıtlar
   * MAX_HISTORY_ENTRIES kırpmasından muaf tutulur. */
  isFavorite: boolean;
}

/** Geçmişte tutulan en fazla arama sayısı; localStorage'ın şişmesini önler. */
export const MAX_HISTORY_ENTRIES = 20;

export type HistoryState = HistoryEntry[];

const initialState: HistoryState = [];

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addHistoryEntry(
      state,
      action: PayloadAction<Omit<HistoryEntry, "id" | "createdAt" | "isFavorite">>,
    ) {
      const entry: HistoryEntry = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        isFavorite: false,
      };
      state.unshift(entry);

      // Favorilenen kayıtlar kırpmadan muaf — sadece favorisiz kayıtlar
      // MAX_HISTORY_ENTRIES'e indirilir, favoriler ne kadar eski olursa olsun kalır.
      let keptNonFavorite = 0;
      const trimmed = state.filter((item) => {
        if (item.isFavorite) return true;
        keptNonFavorite += 1;
        return keptNonFavorite <= MAX_HISTORY_ENTRIES;
      });
      if (trimmed.length !== state.length) {
        state.length = 0;
        state.push(...trimmed);
      }
    },
    toggleHistoryFavorite(state, action: PayloadAction<string>) {
      const entry = state.find((item) => item.id === action.payload);
      if (entry) entry.isFavorite = !entry.isFavorite;
    },
    setHistory(_state, action: PayloadAction<HistoryState>) {
      return action.payload;
    },
    clearHistory() {
      return [];
    },
  },
});

export const { addHistoryEntry, toggleHistoryFavorite, setHistory, clearHistory } =
  historySlice.actions;
export default historySlice.reducer;
