"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  onPhotoSelected?: (dataUrl: string) => void;
}

export default function PhotoUpload({ onPhotoSelected }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onPhotoSelected?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground dark:text-zinc-300">
        Yemek fotoğrafı
      </span>
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
    </div>
  );
}
