import { configureStore } from "@reduxjs/toolkit";
import personCountReducer from "./personCountSlice";
import equipmentReducer from "./equipmentSlice";
import apiKeyReducer from "./apiKeySlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      personCount: personCountReducer,
      equipment: equipmentReducer,
      apiKey: apiKeyReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
