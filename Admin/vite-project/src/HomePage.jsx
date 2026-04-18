export default function HomePage() {
  return (
    <div className="page page-home">
      <div className="section-title">
        <span className="section-icon">🌿</span>
        <h2>Accueil</h2>
      </div>
      <div className="panel page-hero">
        <div className="page-hero-icon">🌐</div>
        <div>
          <h3>Bienvenue sur EthiChain</h3>
          <p>Interface d'administration pour gérer les comptes fournisseurs et valider les certifications.</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Pages</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Anomalies actives</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">100%</div>
          <div className="stat-label">Intégrité</div>
        </div>
      </div>
    </div>
  );
}
