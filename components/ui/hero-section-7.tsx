import type { ReactNode } from "react";
import Image from "next/image";

interface FloatingFoodHeroImage {
  src: string;
  alt: string;
  /** Görselin gerçek piksel boyutları (en/boy oranını korumak için). */
  width: number;
  height: number;
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
          className={`pointer-events-none absolute ${image.className}`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="h-auto w-full drop-shadow-xl"
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
