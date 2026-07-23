import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UsageCounterState {
  count: number;
}

const initialState: UsageCounterState = {
  count: 0,
};

const usageCounterSlice = createSlice({
  name: "usageCounter",
  initialState,
  reducers: {
    incrementUsage(state) {
      state.count += 1;
    },
    setUsage(state, action: PayloadAction<number>) {
      state.count = action.payload;
    },
  },
});

export const { incrementUsage, setUsage } = usageCounterSlice.actions;
export default usageCounterSlice.reducer;
