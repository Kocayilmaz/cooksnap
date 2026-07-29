import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type PremiumProvider = "claude" | "openai";

export const PREMIUM_PROVIDER_KEYS: PremiumProvider[] = ["claude", "openai"];

interface ApiKeyState {
  provider: PremiumProvider;
  key: string;
}

const initialState: ApiKeyState = {
  provider: "claude",
  key: "",
};

const apiKeySlice = createSlice({
  name: "apiKey",
  initialState,
  reducers: {
    setProvider(state, action: PayloadAction<PremiumProvider>) {
      state.provider = action.payload;
    },
    setKey(state, action: PayloadAction<string>) {
      state.key = action.payload;
    },
    clearApiKey(state) {
      state.key = "";
    },
  },
});

export const { setProvider, setKey, clearApiKey } = apiKeySlice.actions;
export default apiKeySlice.reducer;
