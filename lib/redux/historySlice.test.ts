import { describe, expect, it } from "vitest";
import reducer, {
  addHistoryEntry,
  clearHistory,
  MAX_HISTORY_ENTRIES,
  setHistory,
  toggleHistoryFavorite,
  type HistoryEntry,
} from "./historySlice";

const baseEntry: Omit<HistoryEntry, "id" | "createdAt" | "isFavorite"> = {
  hadPhoto: true,
  personCount: 2,
  equipment: ["oven"],
  mode: "home",
  recipeTitles: ["Firinda Tavuk"],
};

describe("historySlice", () => {
  it("addHistoryEntry yeni kaydi id/createdAt ekleyerek basa ekler", () => {
    const state = reducer([], addHistoryEntry(baseEntry));

    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject(baseEntry);
    expect(typeof state[0].id).toBe("string");
    expect(typeof state[0].createdAt).toBe("number");
    expect(state[0].isFavorite).toBe(false);
  });

  it("en yeni kayit listenin basinda olur", () => {
    let state = reducer([], addHistoryEntry({ ...baseEntry, recipeTitles: ["Ilk"] }));
    state = reducer(state, addHistoryEntry({ ...baseEntry, recipeTitles: ["Ikinci"] }));

    expect(state[0].recipeTitles).toEqual(["Ikinci"]);
    expect(state[1].recipeTitles).toEqual(["Ilk"]);
  });

  it("MAX_HISTORY_ENTRIES asilinca en eski kayitlar dusurulur", () => {
    let state: ReturnType<typeof reducer> = [];
    for (let i = 0; i < MAX_HISTORY_ENTRIES + 5; i++) {
      state = reducer(state, addHistoryEntry({ ...baseEntry, recipeTitles: [`Tarif ${i}`] }));
    }

    expect(state).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(state[0].recipeTitles).toEqual([`Tarif ${MAX_HISTORY_ENTRIES + 4}`]);
  });

  it("clearHistory listeyi bosaltir", () => {
    const state = reducer([], addHistoryEntry(baseEntry));

    expect(reducer(state, clearHistory())).toEqual([]);
  });

  it("setHistory tum state'i verilen degerle degistirir", () => {
    const replacement = [{ ...baseEntry, id: "x", createdAt: 0, isFavorite: false }];

    expect(reducer([], setHistory(replacement))).toEqual(replacement);
  });

  it("toggleHistoryFavorite verilen kaydin favori durumunu ters cevirir", () => {
    let state = reducer([], addHistoryEntry(baseEntry));
    const id = state[0].id;

    state = reducer(state, toggleHistoryFavorite(id));
    expect(state[0].isFavorite).toBe(true);

    state = reducer(state, toggleHistoryFavorite(id));
    expect(state[0].isFavorite).toBe(false);
  });

  it("favorilenen kayitlar MAX_HISTORY_ENTRIES kirpmasindan muaf tutulur", () => {
    let state = reducer([], addHistoryEntry({ ...baseEntry, recipeTitles: ["Favori"] }));
    state = reducer(state, toggleHistoryFavorite(state[0].id));

    for (let i = 0; i < MAX_HISTORY_ENTRIES + 5; i++) {
      state = reducer(state, addHistoryEntry({ ...baseEntry, recipeTitles: [`Tarif ${i}`] }));
    }

    expect(state).toHaveLength(MAX_HISTORY_ENTRIES + 1);
    expect(state.some((entry) => entry.recipeTitles[0] === "Favori")).toBe(true);
  });
});
