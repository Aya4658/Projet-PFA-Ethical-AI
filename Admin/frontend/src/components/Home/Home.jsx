import "./Home.css";

export default function Home({ onNavigate }) {
  const cards = [
    { icon: "🏭", label: "Fournisseurs",  desc: "Gérer et approuver les comptes",   page: "fournisseurs",   section: "fournisseur" },
    { icon: "📦", label: "Produits",       desc: "Valider avant publication",         page: "produits",       section: "fournisseur" },
    { icon: "🏅", label: "Certifications", desc: "Contrôler les certifications",      page: "certifications", section: "fournisseur" },
    { icon: "⛓️", label: "Blockchain",     desc: "Vérifier la cohérence des blocs",   page: "blockchain",     section: "fournisseur" },
    { icon: "👥", label: "Utilisateurs",   desc: "Gérer les comptes utilisateurs",    page: "utilisateurs",   section: "user" },
    { icon: "💬", label: "Avis",           desc: "Modérer les avis clients",          page: "avis",           section: "user" },
    { icon: "🚨", label: "Signalements",   desc: "Traiter les signalements urgents",  page: "signalements",   section: "user" },
    { icon: "📊", label: "Statistiques",   desc: "Consulter les indicateurs globaux", page: "statistiques",   section: "user" },
  ];

  return (
    <div className="home-wrapper">
      <div className="home-hero">
        <div className="home-hero-icon">🌿</div>
        <h1 className="home-hero-title">Bienvenue sur EthicChain Admin</h1>
        <p className="home-hero-sub">Plateforme de commerce équitable &amp; blockchain — Tableau de bord principal</p>
      </div>

      <div className="home-grid">
        {cards.map(c => (
          <div key={c.page} className="home-card" onClick={() => onNavigate(c.page, c.section)}>
            <div className="home-card-icon">{c.icon}</div>
            <div className="home-card-label">{c.label}</div>
            <div className="home-card-desc">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
