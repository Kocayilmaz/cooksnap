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
}

/** Geçmişte tutulan en fazla arama sayısı; localStorage'ın şişmesini önler. */
export const MAX_HISTORY_ENTRIES = 20;

export type HistoryState = HistoryEntry[];

const initialState: HistoryState = [];

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addHistoryEntry(state, action: PayloadAction<Omit<HistoryEntry, "id" | "createdAt">>) {
      const entry: HistoryEntry = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      state.unshift(entry);
      state.length = Math.min(state.length, MAX_HISTORY_ENTRIES);
    },
    setHistory(_state, action: PayloadAction<HistoryState>) {
      return action.payload;
    },
    clearHistory() {
      return [];
    },
  },
});

export const { addHistoryEntry, setHistory, clearHistory } = historySlice.actions;
export default historySlice.reducer;
