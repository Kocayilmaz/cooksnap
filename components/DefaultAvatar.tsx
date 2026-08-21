interface DefaultAvatarProps {
  size?: number;
  className?: string;
}

/** Google fotoğrafı gibi gerçek bir profil fotoğrafı yoksa (örn. e-posta/şifre ile kayıt)
 * gösterilen, marka rengine uygun yer tutucu avatar. */
export default function DefaultAvatar({ size = 24, className }: DefaultAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`rounded-full ${className ?? ""}`}
    >
      <circle cx="12" cy="12" r="12" fill="var(--brand-orange)" />
      <circle cx="12" cy="9.5" r="3.75" fill="#fff" />
      <path d="M4.5 20.2c1.02-3.6 4.02-5.7 7.5-5.7s6.48 2.1 7.5 5.7c-2.02 1.78-4.66 2.8-7.5 2.8s-5.48-1.02-7.5-2.8z" fill="#fff" />
    </svg>
  );
}
