"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { signInWithEmail, signUpWithEmail, getFirebaseAuth } from "@/lib/firebase/auth";

type Mode = "signIn" | "signUp";

export default function LoginPage() {
  const router = useRouter();
  const authStatus = useAppSelector((state) => state.auth.status);
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const firebaseConfigured = getFirebaseAuth() !== null;

  if (authStatus === "authenticated") {
    router.replace("/profile");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    const result = mode === "signIn" ? await signInWithEmail(email, password) : await signUpWithEmail(email, password);

    setSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.errorMessage ?? "Bir şeyler ters gitti, tekrar dene.");
      return;
    }

    router.push("/profile");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-warm px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface-card p-8 shadow-sm dark:bg-zinc-950">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-red">
            {mode === "signIn" ? "Giriş yap" : "Hesap oluştur"}
          </h1>
          <p className="text-sm text-surface-text-muted dark:text-zinc-400">
            Farklı bir cihazdan giriş yaptığında premium API anahtarını tekrar girmen gerekmez.
          </p>
        </div>

        {!firebaseConfigured && (
          <p role="alert" className="rounded-xl border border-state-error/30 bg-state-error/10 px-3 py-2 text-sm text-state-error">
            Giriş sistemi henüz yapılandırılmadı. Bu ekran, Firebase projesi bağlanınca aktif olacak.
          </p>
        )}

        <div role="group" aria-label="Giriş modu" className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("signIn")}
            aria-pressed={mode === "signIn"}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signIn"
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-surface-border text-foreground hover:bg-surface-warm dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            Giriş yap
          </button>
          <button
            type="button"
            onClick={() => setMode("signUp")}
            aria-pressed={mode === "signUp"}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signUp"
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-surface-border text-foreground hover:bg-surface-warm dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            Hesap oluştur
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground dark:text-zinc-300">E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ornek@eposta.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-orange dark:border-zinc-700"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground dark:text-zinc-300">Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="En az 6 karakter"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              minLength={6}
              required
              className="w-full rounded-xl border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-orange dark:border-zinc-700"
            />
          </label>

          {errorMessage && (
            <p role="alert" className="text-sm text-state-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !firebaseConfigured}
            className="w-full rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Gönderiliyor…" : mode === "signIn" ? "Giriş yap" : "Hesap oluştur"}
          </button>
        </form>
      </main>
    </div>
  );
}
