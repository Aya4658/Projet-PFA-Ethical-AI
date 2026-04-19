import { useState } from "react";
import "./App.css";
import Home from "./components/Home";
import GererFournisseurs from "./components/GererFournisseurs";
import ValiderProduits from "./components/ValiderProduits";
import ValiderCertifications from "./components/ValiderCertifications";
import GererLitiges from "./components/GererLitiges";
import GererUsers from "./components/GererUsers";
import ModererAvis from "./components/ModererAvis";
import TraiterSignalements from "./components/TraiterSignalements";
import Statistiques from "./components/Statistiques";

const NAV_ITEMS = [
  { id: "home",                   icon: "🏠", label: "Tableau de bord" },
  null,
  { id: "gerer-fournisseurs",     icon: "👥", label: "Gérer comptes fournisseurs" },
  { id: "valider-produits",       icon: "✅", label: "Valider produits" },
  { id: "valider-certifications", icon: "🏅", label: "Valider certifications" },
  { id: "gerer-litiges",          icon: "⚖️", label: "Gérer litiges" },
  null,
  { id: "gerer-users",            icon: "🧑‍💼", label: "Gérer comptes utilisateurs" },
  { id: "moderer-avis",           icon: "💬", label: "Modérer avis" },
  { id: "traiter-signalements",   icon: "🚨", label: "Traiter signalements" },
  { id: "statistiques",           icon: "📊", label: "Statistiques globales" },
];

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">✓ {msg}</div>;
}

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [toastMsg, setToastMsg]     = useState("");

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":                   return <Home setPage={setActivePage} />;
      case "gerer-fournisseurs":     return <GererFournisseurs toast={toast} />;
      case "valider-produits":       return <ValiderProduits toast={toast} />;
      case "valider-certifications": return <ValiderCertifications toast={toast} />;
      case "gerer-litiges":          return <GererLitiges toast={toast} />;
      case "gerer-users":            return <GererUsers toast={toast} />;
      case "moderer-avis":           return <ModererAvis toast={toast} />;
      case "traiter-signalements":   return <TraiterSignalements toast={toast} />;
      case "statistiques":           return <Statistiques />;
      default:                       return <Home setPage={setActivePage} />;
    }
  };

  const currentItem = NAV_ITEMS.filter(Boolean).find(i => i.id === activePage);

  return (
    <div className="app-layout">
      {/* TOP BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-dot" />
          <span className="topbar-brand">EthiTrace</span>
          <span className="topbar-sub">/ Admin</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-date">18 Avr 2026</span>
          <div className="topbar-user">
            <div className="topbar-avatar">A</div>
            <span>Super Admin</span>
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item, idx) => {
              if (!item) return <div key={idx} className="sidebar-divider" />;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => setActivePage(item.id)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="sidebar-footer">EthiTrace v2.1.0 · 2026</div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          {activePage !== "home" && (
            <div className="page-header">
              <div className="page-header-bar">
                <div className="page-header-accent" />
                <h1 className="page-title">{currentItem?.label}</h1>
              </div>
              <div className="page-header-line" />
            </div>
          )}
          <div className="page-body">{renderPage()}</div>
        </main>
      </div>

      <Toast msg={toastMsg} />
    </div>
  );
}
