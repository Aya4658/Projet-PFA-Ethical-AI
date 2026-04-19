import "./HomePage.css";

const stats = [
  { num: "183",   label: "Fournisseurs",  color: "#16a34a", icon: "🏭" },
  { num: "5 421", label: "Utilisateurs",  color: "#2563eb", icon: "👥" },
  { num: "8 934", label: "Commandes",     color: "#d97706", icon: "📦" },
  { num: "48",    label: "Avis à modérer",color: "#dc2626", icon: "⚠️" },
  { num: "13",    label: "Signalements urgents", color: "#dc2626", icon: "🚨" },
  { num: "4.7★",  label: "Note moyenne",  color: "#d97706", icon: "⭐" },
];

const quickLinks = [
  { id: "gerer-comptes-fournisseurs", label: "Gérer fournisseurs",   icon: "🏭", color: "#dcfce7", border: "#86efac" },
  { id: "valider-produits",           label: "Valider produits",     icon: "✅", color: "#dbeafe", border: "#93c5fd" },
  { id: "valider-certifications",     label: "Certifications",       icon: "📜", color: "#fef9c3", border: "#fde047" },
  { id: "verifier-blockchain",        label: "Blockchain",           icon: "⛓️", color: "#f3e8ff", border: "#d8b4fe" },
  { id: "gerer-comptes-users",        label: "Gérer utilisateurs",   icon: "👥", color: "#dbeafe", border: "#93c5fd" },
  { id: "moderer-avis",               label: "Modérer avis",         icon: "💬", color: "#fef9c3", border: "#fde047" },
  { id: "traiter-signalements",       label: "Signalements",         icon: "🚨", color: "#fee2e2", border: "#fca5a5" },
  { id: "statistiques-globales",      label: "Statistiques",         icon: "📊", color: "#dcfce7", border: "#86efac" },
];

const recentActivity = [
  { time: "09:14", action: "Ferme Azul approuvé",           type: "ok"   },
  { time: "09:02", action: "Avis signalé — Câble HDMI",    type: "warn" },
  { time: "08:47", action: "Certification AB Bio validée", type: "ok"   },
  { time: "08:31", action: "Karim Benali bloqué",          type: "err"  },
  { time: "08:10", action: "Nouveau fournisseur en attente", type: "info"},
];

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Welcome banner */}
      <div className="home-banner">
        <div className="home-banner-left">
          <div className="home-banner-title">Bonjour, Super Admin 👋</div>
          <div className="home-banner-sub">
            Bienvenue sur le tableau de bord EthiTrace ·{" "}
            {new Date().toLocaleDateString("fr-DZ", { dateStyle: "long" })}
          </div>
        </div>
        <div className="home-banner-badge">🌿 EthiTrace Admin</div>
      </div>

      {/* Stats grid */}
      <div className="home-stats-grid">
        {stats.map((s, i) => (
          <div className="home-stat-card" key={i}>
            <div className="home-stat-icon">{s.icon}</div>
            <div className="home-stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="home-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="home-bottom">
        {/* Quick access */}
        <div className="home-card">
          <div className="home-card-title">
            <span className="card-title-bar" />
            Accès rapide
          </div>
          <div className="home-quick-grid">
            {quickLinks.map((l) => (
              <div
                key={l.id}
                className="home-quick-item"
                style={{ background: l.color, borderColor: l.border }}
              >
                <span className="home-quick-icon">{l.icon}</span>
                <span className="home-quick-label">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="home-card">
          <div className="home-card-title">
            <span className="card-title-bar" />
            Activité récente
          </div>
          <div className="home-activity">
            {recentActivity.map((a, i) => (
              <div className="home-activity-row" key={i}>
                <span className="home-activity-time">{a.time}</span>
                <span className={`home-activity-dot dot--${a.type}`} />
                <span className="home-activity-text">{a.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}