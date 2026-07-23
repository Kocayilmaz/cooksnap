"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { readStoredApiKey, writeStoredApiKey } from "./localApiKeyStorage";
import { readStoredUserProfile, writeStoredUserProfile } from "./localUserProfileStorage";
import { readStoredEquipment, writeStoredEquipment } from "./localEquipmentStorage";
import { readStoredFavorites, writeStoredFavorites } from "./localFavoritesStorage";
import { setKey, setProvider } from "./apiKeySlice";
import { setName, setLanguage, setCountry } from "./userProfileSlice";
import { setEquipment } from "./equipmentSlice";
import { setFavorites } from "./favoritesSlice";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => makeStore());

  // localStorage sadece client'ta var; sunucu ile ilk client render'ında farklı
  // preloadedState kullanmak (aria-pressed gibi form-dışı özniteliklerde) React'ın
  // "hydration mismatch" sonrası düzeltmediği kalıcı bir tutarsızlığa yol açıyordu.
  // Bunun yerine her zaman varsayılan state ile başlayıp saklanan değerleri mount
  // sonrası bir efektte dispatch ediyoruz — bu normal bir re-render, hydration değil.
  useEffect(() => {
    const storedApiKey = readStoredApiKey();
    if (storedApiKey) {
      store.dispatch(setProvider(storedApiKey.provider));
      store.dispatch(setKey(storedApiKey.key));
    }

    const storedUserProfile = readStoredUserProfile();
    if (storedUserProfile) {
      store.dispatch(setName(storedUserProfile.name));
      store.dispatch(setLanguage(storedUserProfile.language));
      store.dispatch(setCountry(storedUserProfile.country));
    }

    const storedEquipment = readStoredEquipment();
    if (storedEquipment) {
      store.dispatch(setEquipment(storedEquipment));
    }

    const storedFavorites = readStoredFavorites();
    if (storedFavorites) {
      store.dispatch(setFavorites(storedFavorites));
    }
  }, [store]);

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

  useEffect(() => {
    let previous = store.getState().equipment;
    return store.subscribe(() => {
      const current = store.getState().equipment;
      if (current !== previous) {
        writeStoredEquipment(current);
        previous = current;
      }
    });
  }, [store]);

  useEffect(() => {
    let previous = store.getState().favorites;
    return store.subscribe(() => {
      const current = store.getState().favorites;
      if (current !== previous) {
        writeStoredFavorites(current);
        previous = current;
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
