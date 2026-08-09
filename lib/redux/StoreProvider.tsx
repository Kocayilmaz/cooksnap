"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { readStoredApiKey, writeStoredApiKey } from "./localApiKeyStorage";
import { readStoredUserProfile, writeStoredUserProfile } from "./localUserProfileStorage";
import { readStoredEquipment, writeStoredEquipment } from "./localEquipmentStorage";
import { readStoredFavorites, writeStoredFavorites } from "./localFavoritesStorage";
import { readStoredUsage, writeStoredUsage } from "./localUsageStorage";
import { readStoredHistory, writeStoredHistory } from "./localHistoryStorage";
import { setKey, setProvider } from "./apiKeySlice";
import { setName, setLanguage, setCountry } from "./userProfileSlice";
import { setEquipment } from "./equipmentSlice";
import { setFavorites } from "./favoritesSlice";
import { setUsage, USAGE_RESET_INTERVAL_MS } from "./usageCounterSlice";
import { setHistory } from "./historySlice";
import { pullFavoritesFromFirestore, pushFavoritesToFirestore } from "@/lib/firebase/favoritesSync";
import { setAuthenticatedUser, setUnauthenticated } from "./authSlice";
import { subscribeToAuthState } from "@/lib/firebase/auth";
import { readStoredGuestMode, writeStoredGuestMode } from "./localGuestModeStorage";
import { setGuestMode } from "./guestModeSlice";

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

    const storedUsage = readStoredUsage();
    if (storedUsage !== null) {
      // 24 saatlik pencere dolduysa ücretsiz mod sayacını sıfırla (bkz. usageCounterSlice).
      const expired = Date.now() - storedUsage.lastResetAt >= USAGE_RESET_INTERVAL_MS;
      store.dispatch(
        setUsage(expired ? { count: 0, lastResetAt: Date.now() } : storedUsage),
      );
    }

    const storedHistory = readStoredHistory();
    if (storedHistory) {
      store.dispatch(setHistory(storedHistory));
    }

    if (readStoredGuestMode()) {
      store.dispatch(setGuestMode(true));
    }

    // Firebase yapılandırılmamışsa subscribeToAuthState hiç dinlemeye başlamadan
    // hemen no-op unsubscribe döner; bu durumda status "loading"de takılı
    // kalmaması için burada elle "unauthenticated"e çekiyoruz.
    const unsubscribeAuth = subscribeToAuthState((user) => {
      if (user) {
        store.dispatch(setAuthenticatedUser({ uid: user.uid, email: user.email }));

        // Firestore senkronu sadece gercek girisle, kullanicinin kendi uid'si
        // altinda calisir (bkz. lib/firebase/favoritesSync.ts + firestore.rules).
        // Bu cihazda hic favori yoksa Firestore'daki son durumu ceker; varsa
        // (Firestore henuz bu cihazin verisini gormemis olabilir) yerel
        // favorileri Firestore'a yazar.
        pullFavoritesFromFirestore(user.uid).then((remoteFavorites) => {
          const localFavorites = store.getState().favorites;
          const hasLocalFavorites = Object.keys(localFavorites).length > 0;
          if (remoteFavorites && !hasLocalFavorites) {
            store.dispatch(setFavorites(remoteFavorites));
          } else if (hasLocalFavorites) {
            void pushFavoritesToFirestore(user.uid, localFavorites);
          }
        });
      } else {
        store.dispatch(setUnauthenticated());
      }
    });

    return () => unsubscribeAuth();
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
        const authState = store.getState().auth;
        if (authState.status === "authenticated" && authState.uid) {
          void pushFavoritesToFirestore(authState.uid, current);
        }
        previous = current;
      }
    });
  }, [store]);

  useEffect(() => {
    let previous = store.getState().usageCounter;
    return store.subscribe(() => {
      const current = store.getState().usageCounter;
      if (current !== previous) {
        writeStoredUsage(current);
        previous = current;
      }
    });
  }, [store]);

  useEffect(() => {
    let previous = store.getState().history;
    return store.subscribe(() => {
      const current = store.getState().history;
      if (current !== previous) {
        writeStoredHistory(current);
        previous = current;
      }
    });
  }, [store]);

  useEffect(() => {
    let previous = store.getState().guestMode;
    return store.subscribe(() => {
      const current = store.getState().guestMode;
      if (current !== previous) {
        writeStoredGuestMode(current.isGuest);
        previous = current;
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
