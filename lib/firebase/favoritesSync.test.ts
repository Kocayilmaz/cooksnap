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

const { getAnonymousId } = vi.hoisted(() => ({ getAnonymousId: vi.fn() }));
vi.mock("./anonymousId", () => ({ getAnonymousId }));

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
    getAnonymousId.mockReturnValue("anon-1");
    const { pushFavoritesToFirestore } = await import("./favoritesSync");

    await pushFavoritesToFirestore(SAMPLE_FAVORITES);

    expect(setDoc).not.toHaveBeenCalled();
  });

  it("anonim id yoksa hicbir sey yapmaz", async () => {
    getFirestoreDb.mockReturnValue({});
    getAnonymousId.mockReturnValue(null);
    const { pushFavoritesToFirestore } = await import("./favoritesSync");

    await pushFavoritesToFirestore(SAMPLE_FAVORITES);

    expect(setDoc).not.toHaveBeenCalled();
  });

  it("yapilandirilmissa favorileri Firestore'a yazar", async () => {
    getFirestoreDb.mockReturnValue({});
    getAnonymousId.mockReturnValue("anon-1");
    const { pushFavoritesToFirestore } = await import("./favoritesSync");

    await pushFavoritesToFirestore(SAMPLE_FAVORITES);

    expect(setDoc).toHaveBeenCalledWith(
      "doc-ref",
      expect.objectContaining({ favorites: SAMPLE_FAVORITES }),
    );
  });

  it("yazma hatasi (ag/izin) sessizce yutulur, disari firlamaz", async () => {
    getFirestoreDb.mockReturnValue({});
    getAnonymousId.mockReturnValue("anon-1");
    setDoc.mockRejectedValue(new Error("network error"));
    const { pushFavoritesToFirestore } = await import("./favoritesSync");

    await expect(pushFavoritesToFirestore(SAMPLE_FAVORITES)).resolves.toBeUndefined();
  });
});

describe("pullFavoritesFromFirestore", () => {
  it("Firebase yapilandirilmamissa (db null) null doner", async () => {
    getFirestoreDb.mockReturnValue(null);
    getAnonymousId.mockReturnValue("anon-1");
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore()).resolves.toBeNull();
  });

  it("kayit yoksa null doner", async () => {
    getFirestoreDb.mockReturnValue({});
    getAnonymousId.mockReturnValue("anon-1");
    getDoc.mockResolvedValue({ exists: () => false });
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore()).resolves.toBeNull();
  });

  it("kayitli favorileri doner", async () => {
    getFirestoreDb.mockReturnValue({});
    getAnonymousId.mockReturnValue("anon-1");
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ favorites: SAMPLE_FAVORITES }),
    });
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore()).resolves.toEqual(SAMPLE_FAVORITES);
  });

  it("okuma hatasi (ag/izin) sessizce yutulup null doner", async () => {
    getFirestoreDb.mockReturnValue({});
    getAnonymousId.mockReturnValue("anon-1");
    getDoc.mockRejectedValue(new Error("network error"));
    const { pullFavoritesFromFirestore } = await import("./favoritesSync");

    await expect(pullFavoritesFromFirestore()).resolves.toBeNull();
  });
});
