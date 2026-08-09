import { afterEach, describe, expect, it, vi } from "vitest";
import type { FavoritesState } from "@/lib/redux/favoritesSlice";

const { getDoc, setDoc, doc } = vi.hoisted(() => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(() => "doc-ref"),
}));

vi.mock("firebase/firestore", () => ({ doc, getDoc, setDoc }));

const { getFirestoreDb } = vi.hoisted(() => ({ getFirestoreDb: vi.fn() }));
vi.mock("./config", () => ({ getFirestoreDb }));

const SAMPLE_FAVORITES: FavoritesState = {
  "oven::Fırında tavuk": {
    id: "oven::Fırında tavuk",
    title: "Fırında tavuk",
    equipment: "oven",
    steps: ["Fırını ısıt", "Pişir"],
    savedAt: 1234,
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("pushFavoritesToFirestore", () => {
  it("Firebase yapilandirilmamissa (db null) hicbir sey yapmaz", async () => {
    getFirestoreDb.mockReturnValue(null);
    const { pushFavoritesToFirestore } = await import("./favoritesSync");

    await pushFavoritesToFirestore("user-1", SAMPLE_FAVORITES);

    expect(setDoc).not.toHaveBeenCalled();
  });

  it("yapilandirilmissa favorileri Firestore'a yazar", async () => {
    getFirestoreDb.mockReturnValue({});
    const { pushFavoritesToFirestore } = await import("./favoritesSync");

    await pushFavoritesToFirestore("user-1", SAMPLE_FAVORITES);

    expect(setDoc).toHaveBeenCalledWith(
      "doc-ref",
      expect.objectContaining({ favorites: SAMPLE_FAVORITES }),
    );
  });

  it("yazma hatasi (ag/izin) sessizce yutulur, disari firlamaz", async () => {
    getFirestoreDb.mockReturnValue({});
    setDoc.mockRejectedValue(new Error("network error"));
    const { pushFavoritesToFirestore } = await import("./favoritesSync");

    await expect(pushFavoritesToFirestore("user-1", SAMPLE_FAVORITES)).resolves.toBeUndefined();
  });
});

describe("pullFavoritesFromFirestore", () => {
  it("Firebase yapilandirilmamissa (db null) null doner", async () => {
    getFirestoreDb.mockReturnValue(null);
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore("user-1")).resolves.toBeNull();
  });

  it("kayit yoksa null doner", async () => {
    getFirestoreDb.mockReturnValue({});
    getDoc.mockResolvedValue({ exists: () => false });
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore("user-1")).resolves.toBeNull();
  });

  it("kayitli favorileri doner", async () => {
    getFirestoreDb.mockReturnValue({});
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ favorites: SAMPLE_FAVORITES }),
    });
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore("user-1")).resolves.toEqual(SAMPLE_FAVORITES);
  });

  it("okuma hatasi (ag/izin) sessizce yutulup null doner", async () => {
    getFirestoreDb.mockReturnValue({});
    getDoc.mockRejectedValue(new Error("network error"));
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore("user-1")).resolves.toBeNull();
  });
});
