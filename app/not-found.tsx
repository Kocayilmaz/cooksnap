import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface-warm px-4 py-12">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-surface-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-red">
          Sayfa bulunamadı
        </h1>
        <p className="text-sm text-surface-text-muted">
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange-dark"
        >
          Ana sayfaya dön
        </Link>
      </main>
    </div>
  );
}
