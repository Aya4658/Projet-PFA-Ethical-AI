import { useState } from "react";
import "./App.css";
import HomePage from "./HomePage.jsx";
import ComptesFournisseur from "./ComptesFournisseur.jsx";
import Certifications from "./Certifications.jsx";

const NAV_LINKS = [
  { key: "home", label: "Accueil", icon: "🏠" },
  { key: "accounts", label: "Comptes fournisseurs", icon: "🏭" },
  { key: "certifs", label: "Certifications", icon: "🏅" },
];

const PageMap = {
  home: HomePage,
  accounts: ComptesFournisseur,
  certifs: Certifications,
};

const Toast = ({ msg, onClose }) =>
  msg ? (
    <div className="toast">
      ✓ {msg}
      <button onClick={onClose}>×</button>
    </div>
  ) : null;

function App() {
  const [activePage, setActivePage] = useState("home");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const Page = PageMap[activePage];

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon">🌿</div>
          <div>
            <div>EthiChain</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Admin Fournisseur</div>
          </div>
        </div>
        <div className="topbar-user">A</div>
      </div>
      <div className="app-frame">
        <aside className="sidebar">
          <div className="sidebar-title">Navigation</div>
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              type="button"
              className={`nav-button${activePage === link.key ? " active" : ""}`}
              onClick={() => setActivePage(link.key)}
            >
              <span>{link.icon}</span>
              {link.label}
            </button>
          ))}
          <div className="sidebar-footer">
            <div style={{ fontWeight: 700, color: "var(--text)" }}>Admin Fournisseur</div>
            <div>Connecté · Session active</div>
          </div>
        </aside>
        <main className="content-area">
          <Page onToast={showToast} />
        </main>
      </div>
      <Toast msg={toast} onClose={() => setToast("")} />
    </div>
  );
}

export default App;
