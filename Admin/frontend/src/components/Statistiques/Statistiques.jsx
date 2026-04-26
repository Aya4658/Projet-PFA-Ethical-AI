import { useState } from "react";
import "./Statistiques.css";

const CATEGORIES = [
  { nom: "Électronique", pct: 82 },
  { nom: "Mobilier",     pct: 54 },
  { nom: "Santé",        pct: 38 },
  { nom: "Alimentation", pct: 25 },
];

export default function Statistiques({ showToast }) {
  const [periode, setPeriode] = useState("Ce mois");

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
          <span className="groupbox-legend">Période</span>
          <div className="form-row" style={{ marginTop: 8 }}>
            <span className="form-label">Afficher :</span>
            <select className="form-select" value={periode} onChange={e => setPeriode(e.target.value)}>
              <option>Ce mois</option><option>3 derniers mois</option><option>Cette année</option>
            </select>
            <button className="btn btn-primary" onClick={() => showToast("success", "📊", `Stats : ${periode}`)}>Valider</button>
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Indicateurs clés</span>
          <div className="stats-kpi-grid" style={{ marginTop: 8 }}>
            <div className="stat-box"><div className="stat-num">5 421</div><div className="stat-lbl">Utilisateurs actifs</div></div>
            <div className="stat-box"><div className="stat-num">142</div><div className="stat-lbl">Fournisseurs</div></div>
            <div className="stat-box"><div className="stat-num">8 934</div><div className="stat-lbl">Commandes/mois</div></div>
            <div className="stat-box"><div className="stat-num">4.2 ★</div><div className="stat-lbl">Note moyenne</div></div>
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Activité par catégorie</span>
          <div style={{ marginTop: 8 }}>
            {CATEGORIES.map(c => (
              <div className="progress-row" key={c.nom}>
                <span className="progress-label">{c.nom}</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="progress-val">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-success"   onClick={() => showToast("success", "📊", "Export Excel en cours...")}>📊 Exporter Excel</button>
          <button className="btn btn-secondary" onClick={() => showToast("success", "🖨️", "Rapport envoyé à l'imprimante")}>🖨️ Imprimer rapport</button>
        </div>

        <div className="statusbar">
          <span>Données du 01/04/2026</span>
          <span>Mis à jour : 15/04/2026</span>
        </div>
      </div>
    </div>
  );
}
