import { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success"|"error", text }

  const resetToken = new URLSearchParams(window.location.search).get("reset");

  // Si un token reset est présent dans l'URL, afficher le formulaire de réinitialisation
  const activeView = resetToken ? "reset" : view;

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion");
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminEmail", data.email);
      onLogin(data.token, data.email);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessage({ type: "success", text: "Un email de réinitialisation a été envoyé à " + email });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessage({ type: "success", text: "Mot de passe mis à jour. Vous pouvez maintenant vous connecter." });
      // Nettoyer le token de l'URL
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => setView("login"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🌿</div>
          <div className="login-logo-title">EthicChain Admin</div>
          <div className="login-logo-sub">Commerce équitable &amp; blockchain</div>
        </div>

        {/* ── FORMULAIRE CONNEXION ── */}
        {activeView === "login" && (
          <>
            <h2 className="login-heading">Connexion</h2>
            <p className="login-desc">Accès réservé aux administrateurs</p>

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label>Adresse email</label>
                <input
                  type="email"
                  placeholder="admin@ethicchain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="login-field">
                <label>Mot de passe</label>
                <div className="login-pwd-wrap">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-pwd-toggle"
                    onClick={() => setShowPwd(v => !v)}
                    tabIndex={-1}
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="login-forgot">
                <button type="button" onClick={() => { setView("forgot"); setMessage(null); }}>
                  Mot de passe oublié ?
                </button>
              </div>

              {message && (
                <div className={`login-msg ${message.type}`}>{message.text}</div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Connexion en cours…" : "Se connecter"}
              </button>
            </form>
          </>
        )}

        {/* ── FORMULAIRE MOT DE PASSE OUBLIÉ ── */}
        {activeView === "forgot" && (
          <>
            <h2 className="login-heading">Mot de passe oublié</h2>
            <p className="login-desc">Entrez votre email pour recevoir un lien de réinitialisation</p>

            <form onSubmit={handleForgot} className="login-form">
              <div className="login-field">
                <label>Adresse email</label>
                <input
                  type="email"
                  placeholder="admin@ethicchain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {message && (
                <div className={`login-msg ${message.type}`}>{message.text}</div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Envoi en cours…" : "Envoyer le lien"}
              </button>

              <button
                type="button"
                className="login-back"
                onClick={() => { setView("login"); setMessage(null); }}
              >
                ← Retour à la connexion
              </button>
            </form>
          </>
        )}

        {/* ── FORMULAIRE RESET MOT DE PASSE ── */}
        {activeView === "reset" && (
          <>
            <h2 className="login-heading">Nouveau mot de passe</h2>
            <p className="login-desc">Choisissez un nouveau mot de passe sécurisé</p>

            <form onSubmit={handleReset} className="login-form">
              <div className="login-field">
                <label>Nouveau mot de passe</label>
                <div className="login-pwd-wrap">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="login-pwd-toggle"
                    onClick={() => setShowPwd(v => !v)}
                    tabIndex={-1}
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label>Confirmer le mot de passe</label>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className={`login-msg ${message.type}`}>{message.text}</div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Mise à jour…" : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
