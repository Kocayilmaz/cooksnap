import type { ReactNode } from "react";
import Image from "next/image";

interface FloatingFoodHeroImage {
  src: string;
  alt: string;
  /** Konum + boyut sınıfları (ör. "w-40 top-10 left-4 animate-float"). */
  className: string;
}

interface FloatingFoodHeroProps {
  title: string;
  description: string;
  images: FloatingFoodHeroImage[];
  children?: ReactNode;
}

export function FloatingFoodHero({ title, description, images, children }: FloatingFoodHeroProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-brand-orange to-brand-red px-6 py-20 text-center shadow-sm sm:py-24">
      {images.map((image) => (
        <div
          key={image.src + image.className}
          className={`pointer-events-none absolute aspect-square overflow-hidden rounded-full shadow-lg ring-4 ring-white/25 ${image.className}`}
        >
          {/* scale-125: kaynak fotoğrafların çoğunun kenarlarında ince bir
              stüdyo arka planı var, hafif yakınlaştırma dairesel maskenin
              sınırına o arka planı sızdırmadan sadece yemeği gösteriyor. */}
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="200px"
            priority
            className="scale-125 object-cover"
          />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex max-w-xs flex-col items-center gap-4 lg:max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="text-sm text-white/85 sm:text-base">{description}</p>
        {children}
      </div>
    </div>
  );
}
