"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface-warm px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-surface-card p-8 text-center shadow-sm dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-state-error">
          Bir şeyler ters gitti
        </h1>
        <p className="text-sm text-surface-text-muted dark:text-zinc-400">
          Sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyebilirsin.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange-dark"
        >
          Tekrar dene
        </button>
      </main>
    </div>
  );
}
