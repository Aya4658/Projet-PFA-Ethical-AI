import "./Home.css";

const STATS = [
  { value: "5 421", label: "Utilisateurs",  color: "#4ade80" },
  { value: "183",   label: "Fournisseurs",  color: "#60a5fa" },
  { value: "8 934", label: "Commandes",     color: "#4ade80" },
  { value: "4.7★",  label: "Note moyenne",  color: "#fbbf24" },
];

const SHORTCUTS = [
  { id: "gerer-fournisseurs",     icon: "👥", label: "Gérer comptes fournisseurs",  desc: "Approuver, suspendre ou supprimer des fournisseurs" },
  { id: "valider-produits",       icon: "✅", label: "Valider produits",            desc: "Examiner les produits en attente de publication" },
  { id: "valider-certifications", icon: "🏅", label: "Valider certifications",      desc: "Contrôler les certifications fournisseurs" },
  { id: "gerer-litiges",          icon: "⚖️", label: "Gérer litiges",               desc: "Traiter les litiges entre acheteurs et fournisseurs" },
  { id: "gerer-users",            icon: "🧑‍💼", label: "Gérer utilisateurs",          desc: "Gérer les comptes consommateurs" },
  { id: "moderer-avis",           icon: "💬", label: "Modérer avis",               desc: "Publier ou supprimer les avis clients" },
  { id: "traiter-signalements",   icon: "🚨", label: "Traiter signalements",        desc: "Prendre des décisions sur les produits signalés" },
  { id: "statistiques",           icon: "📊", label: "Statistiques globales",       desc: "Consulter les indicateurs clés de la plateforme" },
];

export default function Home({ setPage }) {
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-hero-dot" />
        <h1 className="home-title">Tableau de bord</h1>
        <p className="home-subtitle">Bienvenue dans la console d'administration EthiTrace</p>
      </div>

      <div className="stat-grid-4">
        {STATS.map((s, i) => (
          <div className="stat-box" key={i}>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="home-section-title">Accès rapide</div>
      <div className="home-grid">
        {SHORTCUTS.map(sc => (
          <button key={sc.id} className="home-card" onClick={() => setPage(sc.id)}>
            <span className="home-card-icon">{sc.icon}</span>
            <div>
              <div className="home-card-label">{sc.label}</div>
              <div className="home-card-desc">{sc.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
