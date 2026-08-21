"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  getFirebaseAuth,
} from "@/lib/firebase/auth";
import { setGuestMode } from "@/lib/redux/guestModeSlice";
import styles from "./AuthSwitch.module.css";

type Mode = "signIn" | "signUp";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const firebaseConfigured = getFirebaseAuth() !== null;

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

    dispatch(setGuestMode(false));
    router.push("/");
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setSubmitting(true);

    const result = await signInWithGoogle();

    setSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.errorMessage ?? "Bir şeyler ters gitti, tekrar dene.");
      return;
    }

    dispatch(setGuestMode(false));
    router.push("/");
  }

  function handleSkip() {
    dispatch(setGuestMode(true));
    router.push("/");
  }

  return (
    <div className={`${styles.page} bg-surface-warm`}>
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

                <div className={styles.divider}>
                  <span>veya</span>
                </div>

                <div className={styles.oauthButtons}>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={submitting || !firebaseConfigured}
                    className={styles.oauthBtn}
                  >
                    <GoogleIcon /> Google ile devam et
                  </button>
                </div>

                <button type="button" onClick={handleSkip} className={styles.skipLink}>
                  Şimdilik atla
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

                <div className={styles.divider}>
                  <span>veya</span>
                </div>

                <div className={styles.oauthButtons}>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={submitting || !firebaseConfigured}
                    className={styles.oauthBtn}
                  >
                    <GoogleIcon /> Google ile devam et
                  </button>
                </div>

                <button type="button" onClick={handleSkip} className={styles.skipLink}>
                  Şimdilik atla
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

