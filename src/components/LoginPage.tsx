import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { AuthError, useAuth } from "../contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { translations } from "../locales/translations";
import "./LoginPage.css";

type ErrorKey = "required" | "invalid" | "networkError";

export function LoginPage() {
  const { language } = useLanguage();
  const { login } = useAuth();
  const t = translations[language];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("required");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password, remember);
    } catch (err) {
      setError(err instanceof AuthError && err.reason === "invalid" ? "invalid" : "networkError");
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__lang">
        <LanguageSwitcher />
      </div>

      <div className="login-page__heading">
        <h1>{t.title}</h1>
        <h2>{t.subtitle}</h2>
      </div>

      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-card__header">
          <div className="login-card__icon">
            <ShieldCheck />
          </div>
          <h3>{t.auth.title}</h3>
          <p>{t.auth.description}</p>
        </div>

        {error && (
          <div className="login-card__error" role="alert">
            {t.auth[error]}
          </div>
        )}

        <label className="login-field">
          <span>{t.auth.username}</span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            autoFocus
            placeholder={t.auth.usernamePlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={error === "required" && !username.trim()}
            disabled={submitting}
          />
        </label>

        <label className="login-field">
          <span>{t.auth.password}</span>
          <div className="login-field__password">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error === "required" && !password}
              disabled={submitting}
            />
            <button
              type="button"
              className="login-field__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              title={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </label>

        <label className="login-card__remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={submitting}
          />
          <span>{t.auth.remember}</span>
        </label>

        <button type="submit" className="login-card__submit" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          {submitting ? t.auth.submitting : t.auth.submit}
        </button>
      </form>
    </div>
  );
}
