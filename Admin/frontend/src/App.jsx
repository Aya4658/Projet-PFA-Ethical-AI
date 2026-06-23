import { useState, useEffect } from "react";
import "./App.css";

import Login from "./components/Login/Login.jsx";
import { ToastContainer, ProfileModal, useToast } from "./components/shared.jsx";
import Home              from "./components/Home/Home.jsx";
import GererFournisseurs from "./components/GererFournisseurs/GererFournisseurs.jsx";
import Produits          from "./components/Produits/Produits.jsx";
import GererUsers        from "./components/GererUsers/GererUsers.jsx";
import Signalements      from "./components/Signalements/Signalements.jsx";
import Statistiques      from "./components/Statistiques/Statistiques.jsx";

const INIT = {
  fournisseurs: [],
  produits: [],
  utilisateurs: [],
  signalements: [],
};

const NAV = [
  { id: "fournisseurs", label: "Fournisseurs", icon: "🏭", section: "fournisseur" },
  { id: "produits",     label: "Produits",     icon: "📦", section: "fournisseur" },
  { id: "utilisateurs", label: "Utilisateurs", icon: "👥", section: "user" },
  { id: "signalements", label: "Signalements", icon: "🚨", section: "user" },
  { id: "statistiques", label: "Statistiques", icon: "📊", section: "user" },
];

const TITLES = {
  home:           "Accueil",
  fournisseurs:   "Gérer comptes fournisseurs",
  produits:       "Gérer produits",
  utilisateurs:   "Gérer utilisateurs",
  signalements:   "Traiter signalements",
  statistiques:   "Statistiques globales",
};

export default function App() {
  const [token,      setToken]      = useState(() => localStorage.getItem("adminToken"));
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem("adminEmail") || "");
  const [adminInfo,  setAdminInfo]  = useState(null);

  const [page, setPage]               = useState("home");
  const [tab,  setTab]                = useState("fournisseur");
  const [showProfile, setShowProfile] = useState(false);

  const [fournisseurs, setFournisseurs] = useState(INIT.fournisseurs);
  const [produits,     setProduits]     = useState(INIT.produits);
  const [utilisateurs, setUtilisateurs] = useState(INIT.utilisateurs);
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
    fetch("http://localhost:5000/api/reports")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSignalements(data); })
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
            category:    p.category || "—",
            fournisseur: p.producer_id != null ? String(p.producer_id) : "—",
            price:       p.price != null ? `${p.price} ${p.currency || "EUR"}` : "—",
          })));
        }
      })
      .catch(() => {});
  }, [token]);

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

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const navigate = (id, section) => { setPage(id); setTab(section || "fournisseur"); };
  const cur = NAV.find(n => n.id === page);

  function PageContent() {
    const p = { showToast };
    switch (page) {
      case "home":           return <Home onNavigate={navigate} />;
      case "fournisseurs":   return <GererFournisseurs data={fournisseurs} setData={setFournisseurs} {...p} />;
      case "produits":       return <Produits          data={produits}     setData={setProduits}     {...p} />;
      case "utilisateurs":   return <GererUsers        data={utilisateurs} setData={setUtilisateurs} {...p} />;
      case "signalements":   return <Signalements       data={signalements} setData={setSignalements} {...p} />;
      case "statistiques":   return <Statistiques                                                     {...p} />;
      default: return null;
    }
  }

  return (
    <div className="app-layout">

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div className="sidebar-logo-title">EthicChain Admin</div>
          <div className="sidebar-logo-sub">Commerce équitable &amp; éthique</div>
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
