import { useState, useEffect } from "react";
import "./App.css";

import Login from "./components/Login/Login.jsx";
import { ToastContainer, ProfileModal, useToast } from "./components/shared.jsx";
import Home              from "./components/Home/Home.jsx";
import GererFournisseurs from "./components/GererFournisseurs/GererFournisseurs.jsx";
import Produits          from "./components/Produits/Produits.jsx";
import Certifications    from "./components/Certifications/Certifications.jsx";
import Blockchain        from "./components/Blockchain/Blockchain.jsx";
import GererUsers        from "./components/GererUsers/GererUsers.jsx";
import ModererAvis       from "./components/ModererAvis/ModererAvis.jsx";
import Signalements      from "./components/Signalements/Signalements.jsx";
import Statistiques      from "./components/Statistiques/Statistiques.jsx";

// ─── INITIAL DATA ─────────────────────────────────────────────────
const INIT = {
  fournisseurs: [],
  produits: [],
  certifs: [
    { id: 1, nom: "ISO 9001",    fournisseur: "Sté Alpha",  statut: "Attente" },
    { id: 2, nom: "CE Marquage", fournisseur: "MediaBeta",  statut: "Expiré"  },
    { id: 3, nom: "HACCP",       fournisseur: "TechGamma",  statut: "Valide"  },
  ],
  utilisateurs: [],
  avis: [
    { id: 1, utilisateur: "Leila M.", avis: "Produit non conforme à la description, très déçue du service client.", note: "2★", produit: "Câble HDMI",    statut: "Attente" },
    { id: 2, utilisateur: "Karim B.", avis: "Arnaque totale ! Ne commandez pas ce produit.",                        note: "1★", produit: "Supplément X", statut: "Signalé" },
  ],
  signalements: [
    { id: 1, produit: "Câble HDMI 4K",      motif: "Trompeur",     statut: "Urgent"   },
    { id: 2, produit: "Supplément X-Boost", motif: "Non conforme", statut: "En cours" },
  ],
};

// ─── NAV CONFIG ───────────────────────────────────────────────────
const NAV = [
  { id: "fournisseurs",   label: "Fournisseurs",  icon: "🏭", section: "fournisseur" },
  { id: "produits",       label: "Produits",       icon: "📦", section: "fournisseur" },
  { id: "certifications", label: "Certifications", icon: "🏅", section: "fournisseur" },
  { id: "blockchain",     label: "Blockchain",     icon: "⛓️", section: "fournisseur" },
  { id: "utilisateurs",   label: "Utilisateurs",   icon: "👥", section: "user" },
  { id: "avis",           label: "Modérer avis",   icon: "💬", section: "user" },
  { id: "signalements",   label: "Signalements",   icon: "🚨", section: "user" },
  { id: "statistiques",   label: "Statistiques",   icon: "📊", section: "user" },
];

const TITLES = {
  home:           "Accueil",
  fournisseurs:   "Gérer comptes fournisseurs",
  produits:       "Valider produits",
  certifications: "Valider certifications",
  blockchain:     "Vérifier Blockchain",
  utilisateurs:   "Gérer utilisateurs",
  avis:           "Modérer avis",
  signalements:   "Traiter signalements",
  statistiques:   "Statistiques globales",
};

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  // ── tous les hooks en premier, AVANT tout return conditionnel ──
  const [token,      setToken]      = useState(() => localStorage.getItem("adminToken"));
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem("adminEmail") || "");
  const [adminInfo,  setAdminInfo]  = useState(null);

  const [page, setPage]               = useState("home");
  const [tab,  setTab]                = useState("fournisseur");
  const [showProfile, setShowProfile] = useState(false);

  const [fournisseurs, setFournisseurs] = useState(INIT.fournisseurs);
  const [produits,     setProduits]     = useState(INIT.produits);
  const [certifs,      setCertifs]      = useState(INIT.certifs);
  const [utilisateurs, setUtilisateurs] = useState(INIT.utilisateurs);
  const [avis,         setAvis]         = useState(INIT.avis);
  const [signalements, setSignalements] = useState(INIT.signalements);

  const { toasts, showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data._id) setAdminInfo(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/users")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUtilisateurs(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/producers")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFournisseurs(data.map(f => ({
            id:       f._id,
            nom:      f.name || "Sans nom",
            type:     f.type || "",
            location: f.location || "",
            email:    f.contact_email || "",
            score:    f.sustainability_score ?? "",
            workers:  f.workers_count ?? "",
            statut:   f.statut || "Actif",
            date:     f.date || "",
          })));
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/products")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProduits(data.map(p => ({
            id:          p._id,
            nom:         p.name || p.nom || "Sans nom",
            fournisseur: p.producer_id ? String(p.producer_id) : "—",
            statut:      p.statut || "Attente",
          })));
        }
      })
      .catch(() => {});
  }, [token]);

  // ── fonctions auth ──
  function handleLogin(tok, email) {
    setToken(tok);
    setAdminEmail(email);
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setToken(null);
    setAdminEmail("");
  }

  // ── return conditionnel APRÈS tous les hooks ──
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // ── helpers dashboard ──
  const navigate = (id, section) => { setPage(id); setTab(section || "fournisseur"); };
  const cur = NAV.find(n => n.id === page);

  function PageContent() {
    const p = { showToast };
    switch (page) {
      case "home":           return <Home onNavigate={navigate} />;
      case "fournisseurs":   return <GererFournisseurs data={fournisseurs} setData={setFournisseurs} {...p} />;
      case "produits":       return <Produits          data={produits}     setData={setProduits}     {...p} />;
      case "certifications": return <Certifications    data={certifs}      setData={setCertifs}      {...p} />;
      case "blockchain":     return <Blockchain                                                       {...p} />;
      case "utilisateurs":   return <GererUsers        data={utilisateurs} setData={setUtilisateurs} {...p} />;
      case "avis":           return <ModererAvis        data={avis}         setData={setAvis}         {...p} />;
      case "signalements":   return <Signalements       data={signalements} setData={setSignalements} {...p} />;
      case "statistiques":   return <Statistiques                                                     {...p} />;
      default: return null;
    }
  }

  return (
    <div className="app-layout">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div className="sidebar-logo-title">EthicChain Admin</div>
          <div className="sidebar-logo-sub">Commerce équitable &amp; blockchain</div>
        </div>

        <div
          className={`sidebar-item ${page === "home" ? "active" : ""}`}
          onClick={() => navigate("home")}
        >
          <span className="sidebar-item-icon">🏠</span>Accueil
        </div>

        <div className="sidebar-sec-title">Admin Fournisseur</div>
        {NAV.filter(n => n.section === "fournisseur").map(n => (
          <div
            key={n.id}
            className={`sidebar-item ${page === n.id ? "active" : ""}`}
            onClick={() => navigate(n.id, "fournisseur")}
          >
            <span className="sidebar-item-icon">{n.icon}</span>{n.label}
          </div>
        ))}

        <div className="sidebar-sec-title">Admin User</div>
        {NAV.filter(n => n.section === "user").map(n => (
          <div
            key={n.id}
            className={`sidebar-item ${page === n.id ? "active" : ""}`}
            onClick={() => navigate(n.id, "user")}
          >
            <span className="sidebar-item-icon">{n.icon}</span>{n.label}
          </div>
        ))}

        <div className="sidebar-profile" onClick={() => setShowProfile(true)}>
          <div className="s-avatar">{adminEmail ? adminEmail[0].toUpperCase() : "A"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-profile-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {adminEmail || "Admin"}
            </div>
            <div className="sidebar-profile-role">Super Admin · voir profil →</div>
          </div>
        </div>

        <div
          className="sidebar-item"
          style={{ color: "#ef9a9a", borderTop: "1px solid rgba(255,255,255,0.08)" }}
          onClick={handleLogout}
        >
          <span className="sidebar-item-icon">🚪</span>Déconnexion
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">{cur?.icon} {TITLES[page]}</div>
            <div className="topbar-breadcrumb">
              EthicChain ›{" "}
              {tab === "fournisseur" ? "Admin Fournisseur" : page === "home" ? "Accueil" : "Admin User"}
              {page !== "home" && ` › ${TITLES[page]}`}
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-btn" onClick={() => setShowProfile(true)}>
              <div className="s-avatar" style={{ width: 26, height: 26, fontSize: 11, flexShrink: 0 }}>
                {adminEmail ? adminEmail[0].toUpperCase() : "A"}
              </div>
              Mon compte
            </div>
          </div>
        </header>

        {page !== "home" && (
          <div style={{ padding: "16px 24px 0" }}>
            <div className="page-tabs">
              <div
                className={`page-tab ${tab === "fournisseur" ? "active" : ""}`}
                onClick={() => navigate("fournisseurs", "fournisseur")}
              >🏭 Admin Fournisseur</div>
              <div
                className={`page-tab ${tab === "user" ? "active" : ""}`}
                onClick={() => navigate("utilisateurs", "user")}
              >👥 Admin User</div>
            </div>
          </div>
        )}

        <div className="content-area">
          {page !== "home" && (
            <div className="section-label">
              ▶ {tab === "fournisseur" ? "Admin Fournisseur" : "Admin User"} — {TITLES[page]}
            </div>
          )}
          <PageContent />
        </div>
      </div>

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          adminInfo={adminInfo}
          onProfileUpdated={updated => setAdminInfo(updated)}
        />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
