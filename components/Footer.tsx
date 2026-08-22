import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-card px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <Image src="/logo.png" alt="CookSnap" width={120} height={36} />
          <p className="text-xs text-surface-text-muted">
            Fotoğraf çek ya da malzemeleri yaz, AI ile tarifini al.
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 text-xs text-surface-text-muted sm:items-end">
          <span>Tarif verileri TheMealDB tarafından sağlanmaktadır.</span>
          <span>© {new Date().getFullYear()} CookSnap</span>
        </div>
      </div>
    </footer>
  );
}
