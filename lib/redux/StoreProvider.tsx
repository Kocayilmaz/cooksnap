"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { readStoredApiKey, writeStoredApiKey } from "./localApiKeyStorage";
import { readStoredUserProfile, writeStoredUserProfile } from "./localUserProfileStorage";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => {
    const storedApiKey = readStoredApiKey();
    const storedUserProfile = readStoredUserProfile();
    return makeStore({
      ...(storedApiKey ? { apiKey: storedApiKey } : {}),
      ...(storedUserProfile ? { userProfile: storedUserProfile } : {}),
    });
  });

  useEffect(() => {
    let previous = store.getState().apiKey;
    return store.subscribe(() => {
      const current = store.getState().apiKey;
      if (current !== previous) {
        writeStoredApiKey(current);
        previous = current;
      }
    });
  }, [store]);

  useEffect(() => {
    let previous = store.getState().userProfile;
    return store.subscribe(() => {
      const current = store.getState().userProfile;
      if (current !== previous) {
        writeStoredUserProfile(current);
        previous = current;
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
