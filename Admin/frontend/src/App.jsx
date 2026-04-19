import { useState } from "react";
import "./App.css";

import HomePage from "./components/HomePage";
import GererFournisseurs from "./components/GererFournisseurs";
import ValiderProduits from "./components/ValiderProduits";
import ValiderCertifications from "./components/ValiderCertifications";


// ─── Sidebar config ───────────────────────────────────────────────────────────
const SIDEBAR_SECTIONS = [
  {
    id: "fournisseur",
    tasks: [
      { id: "home",                       label: "🏠 Accueil"                   },
      { id: "gerer-comptes-fournisseurs", label: "Gérer comptes fournisseurs"   },
      { id: "valider-produits",           label: "Valider produits"             },
      { id: "valider-certifications",     label: "Valider certifications"       },
      { id: "verifier-blockchain",        label: "Vérifier Blockchain"          },
    ],
  },
  {
    id: "user",
    tasks: [
      { id: "gerer-comptes-users",   label: "Gérer comptes utilisateurs" },
      { id: "moderer-avis",          label: "Modérer avis"               },
      { id: "traiter-signalements",  label: "Traiter signalements"       },
      { id: "statistiques-globales", label: "Statistiques globales"      },
    ],
  },
];

// ─── Page map ─────────────────────────────────────────────────────────────────
const PAGES = {
  "home":                       <HomePage />,
  "gerer-comptes-fournisseurs": <GererFournisseurs />,
  "valider-produits":           <ValiderProduits />,
  "valider-certifications":     <ValiderCertifications />,
  "verifier-blockchain":        <VerifierBlockchain />,
  "gerer-comptes-users":        <GererUsers />,
  "moderer-avis":               <ModererAvis />,
  "traiter-signalements":       <TraiterSignalements />,
  "statistiques-globales":      <StatistiquesGlobales />,
};

export default function App() {
  const [activeTask, setActiveTask] = useState("home");

  const activeLabel =
    SIDEBAR_SECTIONS.flatMap((s) => s.tasks).find((t) => t.id === activeTask)
      ?.label || "";

  return (
    <div className="app-wrapper">
      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">
        {/* Title */}
        <div className="sidebar-header">
          <div className="sidebar-title">ADMIN</div>
          <div className="sidebar-subtitle">EthiTrace · Tableau de bord</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {SIDEBAR_SECTIONS.map((section, si) => (
            <div key={section.id}>
              {si > 0 && <div className="sidebar-divider" />}
              {section.tasks.map((task) => {
                const isActive = activeTask === task.id;
                return (
                  <button
                    key={task.id}
                    className={`sidebar-btn ${isActive ? "sidebar-btn--active" : ""}`}
                    onClick={() => setActiveTask(task.id)}
                  >
                    {task.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-avatar">👤</div>
          <div>
            <div className="sidebar-user">Super Admin</div>
            <div className="sidebar-email">admin@ethitrace.dz</div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <div>
            <div className="main-title">{activeLabel}</div>
            <div className="main-date">
              {new Date().toLocaleDateString("fr-DZ", { dateStyle: "long" })}
            </div>
          </div>
          <div className="status-indicator">
            <span className="status-dot" />
            <span className="status-text">Système opérationnel</span>
          </div>
        </header>

        {/* Page panel */}
        <div className="main-panel">{PAGES[activeTask]}</div>
      </main>
    </div>
  );
}