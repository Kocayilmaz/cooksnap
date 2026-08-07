"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  onPhotoSelected?: (dataUrl: string | null) => void;
}

/** Base64 data URL'e çevrilip isteğe eklendiği için makul bir üst sınır konuldu. */
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export default function PhotoUpload({ onPhotoSelected }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Sadece resim dosyaları yüklenebilir (jpg, png, webp vb.).");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Dosya çok büyük. En fazla 8 MB yükleyebilirsin.");
      event.target.value = "";
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onPhotoSelected?.(dataUrl);
    };
    reader.onerror = () => {
      setError("Fotoğraf okunamadı, tekrar dener misin?");
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview(null);
    setError(null);
    onPhotoSelected?.(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground dark:text-zinc-300">
        Yemek fotoğrafı
      </span>
      <div className="relative h-40 w-full">
        <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-surface-border text-sm text-surface-text-muted hover:bg-surface-warm dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900">
          {preview ? (
            <Image
              src={preview}
              alt="Yüklenen fotoğraf önizlemesi"
              width={400}
              height={160}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span>Fotoğraf yüklemek için tıkla</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Fotoğrafı kaldır"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white hover:bg-black/80"
          >
            ×
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-state-error dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
