interface LoadingSpinnerProps {
  /** Piksel cinsinden kare boyut; varsayılan buton içi kullanım için küçük tutuldu. */
  size?: number;
  className?: string;
}

/**
 * Yeniden kullanılabilir yükleniyor göstergesi. Renk `currentColor`'a bağlı,
 * bu yüzden metinle aynı renkte görünmesi için üst elemanın text rengini
 * kullanır (bkz. app/page.tsx'teki "Tarif hazırlanıyor…" kullanımı).
 */
export default function LoadingSpinner({ size = 16, className = "" }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Yükleniyor"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
