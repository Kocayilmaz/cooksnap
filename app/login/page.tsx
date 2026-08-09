"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { signInWithEmail, signUpWithEmail, getFirebaseAuth } from "@/lib/firebase/auth";
import styles from "./AuthSwitch.module.css";

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
    <div className={`${styles.page} bg-surface-warm dark:bg-black`}>
      <div className={`${styles.container} ${mode === "signUp" ? styles.signUpMode : ""}`}>
        <div className={styles.formsContainer}>
          <div className={styles.signinSignup}>
            <form
              onSubmit={handleSubmit}
              className={`${styles.form} ${styles.signInForm}`}
              aria-hidden={mode !== "signIn"}
              inert={mode !== "signIn"}
            >
              <h2 className={styles.title}>Giriş yap</h2>
              <p className={styles.subtitle}>Farklı bir cihazdan giriş yaptığında premium API anahtarını tekrar girmen gerekmez.</p>

              {!firebaseConfigured && (
                <p role="alert" className={styles.noticeText}>
                  Giriş sistemi henüz yapılandırılmadı.
                </p>
              )}

              <label className={styles.inputField}>
                <span className={styles.inputIcon}>
                  <Mail size={18} aria-hidden="true" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="E-posta"
                  aria-label="E-posta"
                  autoComplete="email"
                  required
                />
              </label>

              <label className={styles.inputField}>
                <span className={styles.inputIcon}>
                  <Lock size={18} aria-hidden="true" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Şifre"
                  aria-label="Şifre"
                  autoComplete="current-password"
                  minLength={6}
                  required
                />
              </label>

              {mode === "signIn" && errorMessage && (
                <p role="alert" className={styles.errorText}>
                  {errorMessage}
                </p>
              )}

              <button type="submit" disabled={submitting || !firebaseConfigured} className={styles.btn}>
                {submitting ? "Gönderiliyor…" : "Giriş yap"}
              </button>
            </form>

            <form
              onSubmit={handleSubmit}
              className={`${styles.form} ${styles.signUpForm}`}
              aria-hidden={mode !== "signUp"}
              inert={mode !== "signUp"}
            >
              <h2 className={styles.title}>Hesap oluştur</h2>
              <p className={styles.subtitle}>Farklı bir cihazdan giriş yaptığında premium API anahtarını tekrar girmen gerekmez.</p>

              {!firebaseConfigured && (
                <p role="alert" className={styles.noticeText}>
                  Giriş sistemi henüz yapılandırılmadı.
                </p>
              )}

              <label className={styles.inputField}>
                <span className={styles.inputIcon}>
                  <Mail size={18} aria-hidden="true" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="E-posta"
                  aria-label="E-posta"
                  autoComplete="email"
                  required
                />
              </label>

              <label className={styles.inputField}>
                <span className={styles.inputIcon}>
                  <Lock size={18} aria-hidden="true" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="En az 6 karakter"
                  aria-label="Şifre"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>

              {mode === "signUp" && errorMessage && (
                <p role="alert" className={styles.errorText}>
                  {errorMessage}
                </p>
              )}

              <button type="submit" disabled={submitting || !firebaseConfigured} className={styles.btn}>
                {submitting ? "Gönderiliyor…" : "Hesap oluştur"}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.panelsContainer}>
          <div className={`${styles.panel} ${styles.leftPanel}`}>
            <div className={styles.panelContent}>
              <h3>Yeni misin?</h3>
              <p>Bize bugün katıl, birkaç saniyede hesabını oluştur.</p>
              <button type="button" onClick={() => setMode("signUp")} className={styles.btnTransparent}>
                Hesap oluştur
              </button>
            </div>
          </div>

          <div className={`${styles.panel} ${styles.rightPanel}`}>
            <div className={styles.panelContent}>
              <h3>Zaten üye misin?</h3>
              <p>Tekrar hoş geldin! Devam etmek için giriş yap.</p>
              <button type="button" onClick={() => setMode("signIn")} className={styles.btnTransparent}>
                Giriş yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
