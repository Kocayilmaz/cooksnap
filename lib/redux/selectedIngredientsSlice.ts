import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Anasayfadaki malzeme seçicide (IngredientPicker) işaretlenen malzemeler
 * (TheMealDB İngilizce adlarıyla) — kategori bölümündeki tarif filtresi
 * (bkz. IngredientFilteredMeals) bu seçime göre çalışır. Kalıcı tutulmuyor,
 * sayfa yenilenince sıfırlanır (arama kutusu gibi geçici tarama durumu). */
export type SelectedIngredientsState = string[];

const initialState: SelectedIngredientsState = [];

const selectedIngredientsSlice = createSlice({
  name: "selectedIngredients",
  initialState,
  reducers: {
    toggleSelectedIngredient(state, action: PayloadAction<string>) {
      const index = state.indexOf(action.payload);
      if (index === -1) {
        state.push(action.payload);
      } else {
        state.splice(index, 1);
      }
    },
    clearSelectedIngredients() {
      return [];
    },
  },
});

export const { toggleSelectedIngredient, clearSelectedIngredients } = selectedIngredientsSlice.actions;
export default selectedIngredientsSlice.reducer;
