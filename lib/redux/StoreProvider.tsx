"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { readStoredApiKey, writeStoredApiKey } from "./localApiKeyStorage";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => {
    const storedApiKey = readStoredApiKey();
    return makeStore(storedApiKey ? { apiKey: storedApiKey } : undefined);
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

  return <Provider store={store}>{children}</Provider>;
}
