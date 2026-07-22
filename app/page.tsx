"use client";

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import PersonCountSelector from "@/components/PersonCountSelector";
import EquipmentSelector from "@/components/EquipmentSelector";
import ApiKeyInput from "@/components/ApiKeyInput";

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            CookSnap
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Fotoğrafını çek, elindekilere göre tarifini al.
          </p>
        </div>

        <PhotoUpload onPhotoSelected={setPhoto} />
        <PersonCountSelector />
        <EquipmentSelector />
        <ApiKeyInput />

        <button
          type="button"
          disabled={!photo}
          className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
        >
          Tarifi getir
        </button>
      </main>
    </div>
  );
}
