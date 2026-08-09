import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  uid: string | null;
  email: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  uid: null,
  email: null,
  status: "loading",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedUser(state, action: PayloadAction<{ uid: string; email: string | null }>) {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.status = "authenticated";
    },
    setUnauthenticated(state) {
      state.uid = null;
      state.email = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setAuthenticatedUser, setUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
