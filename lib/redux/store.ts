import { combineReducers, configureStore } from "@reduxjs/toolkit";
import personCountReducer from "./personCountSlice";
import equipmentReducer from "./equipmentSlice";
import apiKeyReducer from "./apiKeySlice";
import recipeModeReducer from "./recipeModeSlice";

const rootReducer = combineReducers({
  personCount: personCountReducer,
  equipment: equipmentReducer,
  apiKey: apiKeyReducer,
  recipeMode: recipeModeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
