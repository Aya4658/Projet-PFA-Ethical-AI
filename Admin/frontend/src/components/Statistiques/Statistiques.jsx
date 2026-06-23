import { useState, useEffect } from "react";
import "./Statistiques.css";

const API = "http://localhost:5000/api/statistics";

function ProgressBars({ items, total }) {
  const max = Math.max(...items.map(([, c]) => c), 1);
  return items.map(([label, count]) => {
    const pct = Math.round((count / max) * 100);
    return (
      <div className="progress-row" key={label}>
        <span className="progress-label">{label}</span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-val">{count}</span>
      </div>
    );
  });
}

function formatNum(n) {
  return n?.toLocaleString("fr-FR") ?? "0";
}

export default function Statistiques({ showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadStats = () => {
    setLoading(true);
    setError(false);
    fetch(API)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-body">
          <div className="empty-state"><div className="empty-state-icon">⏳</div>Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="panel">
        <div className="panel-body">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            Impossible de charger les statistiques
            <div className="btn-row" style={{ marginTop: 12, justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={loadStats}>Réessayer</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryItems = Object.entries(stats.products.byCategory).sort((a, b) => b[1] - a[1]);
  const reportReasonItems = Object.entries(stats.reports.byReason).sort((a, b) => b[1] - a[1]);
  const countryItems = Object.entries(stats.usersByCountry).sort((a, b) => b[1] - a[1]);
  const reportStatusItems = Object.entries(stats.reports.byStatus).sort((a, b) => b[1] - a[1]);
  const generatedDate = new Date(stats.generatedAt).toLocaleDateString("fr-FR");

  return (
    <div className="panel">
      <div className="panel-header">
        <span>📊 Consulter statistiques globales</span>
        <div className="ph-btns">
          <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
        </div>
      </div>
      <div className="panel-body">

        <div className="groupbox">
          <span className="groupbox-legend">Vue d'ensemble</span>
          <div className="stats-kpi-grid" style={{ marginTop: 8 }}>
            <div className="stat-box"><div className="stat-num">{formatNum(stats.users.total)}</div><div className="stat-lbl">Utilisateurs</div></div>
            <div className="stat-box"><div className="stat-num">{formatNum(stats.producers.total)}</div><div className="stat-lbl">Fournisseurs</div></div>
            <div className="stat-box"><div className="stat-num">{formatNum(stats.products.total)}</div><div className="stat-lbl">Produits</div></div>
            <div className="stat-box"><div className="stat-num">{formatNum(stats.reports.total)}</div><div className="stat-lbl">Signalements</div></div>
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Utilisateurs par statut</span>
          <div className="stats-kpi-grid" style={{ marginTop: 8 }}>
            <div className="stat-box"><div className="stat-num blue">{formatNum(stats.users.byStatus.Actif || 0)}</div><div className="stat-lbl">Actifs</div></div>
            <div className="stat-box"><div className="stat-num red">{formatNum(stats.users.byStatus.Bloqué || 0)}</div><div className="stat-lbl">Bloqués</div></div>
            <div className="stat-box"><div className="stat-num orange">{formatNum(stats.users.byStatus.Banni || 0)}</div><div className="stat-lbl">Bannis</div></div>
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Activité utilisateurs</span>
          <div className="stats-kpi-grid" style={{ marginTop: 8 }}>
            <div className="stat-box"><div className="stat-num">{formatNum(stats.activity.totalScans)}</div><div className="stat-lbl">Scans totaux</div></div>
            <div className="stat-box"><div className="stat-num">{formatNum(stats.activity.totalPurchases)}</div><div className="stat-lbl">Achats totaux</div></div>
            <div className="stat-box"><div className="stat-num">{stats.activity.avgEthicalScore}/100</div><div className="stat-lbl">Score éthique moyen</div></div>
            <div className="stat-box"><div className="stat-num">{formatNum(stats.activity.totalCo2Saved)} kg</div><div className="stat-lbl">CO₂ économisé</div></div>
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Produits</span>
          <div className="stats-kpi-grid" style={{ marginTop: 8, marginBottom: 12 }}>
            <div className="stat-box"><div className="stat-num">{stats.products.avgRating} ★</div><div className="stat-lbl">Note moyenne</div></div>
          </div>
          <ProgressBars items={categoryItems} total={stats.products.total} />
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Signalements par statut</span>
          <div style={{ marginTop: 8 }}>
            <ProgressBars items={reportStatusItems} />
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Signalements par motif</span>
          <div style={{ marginTop: 8 }}>
            <ProgressBars items={reportReasonItems} />
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Utilisateurs par pays</span>
          <div style={{ marginTop: 8 }}>
            <ProgressBars items={countryItems} />
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => { loadStats(); showToast("success", "📊", "Statistiques actualisées"); }}>🔄 Actualiser</button>
        </div>

        <div className="statusbar">
          <span>Données issues de la base MongoDB</span>
          <span>Mis à jour : {generatedDate}</span>
        </div>
      </div>
    </div>
  );
}
