import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn bileşenlerinin (components/ui) beklediği sınıf birleştirme yardımcısı. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
