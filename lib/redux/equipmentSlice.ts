import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Equipment = "oven" | "pan" | "pot";

type EquipmentState = Record<Equipment, boolean>;

const initialState: EquipmentState = {
  oven: true,
  pan: true,
  pot: false,
};

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    toggleEquipment(state, action: PayloadAction<Equipment>) {
      state[action.payload] = !state[action.payload];
    },
  },
});

export const { toggleEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
