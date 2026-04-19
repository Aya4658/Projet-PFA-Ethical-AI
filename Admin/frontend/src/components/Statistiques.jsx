import { useState } from "react";
import "./Statistiques.css";

const CATEGORIES = [
  { label: "Alimentation", pct: 82, color: "#22c55e" },
  { label: "Artisanat",    pct: 65, color: "#4ade80" },
  { label: "Cosmétiques",  pct: 48, color: "#86efac" },
  { label: "Textile",      pct: 35, color: "#bbf7d0" },
  { label: "Santé",        pct: 28, color: "#d1fae5" },
];

export default function Statistiques() {
  const [periode, setPeriode] = useState("Cette année");

  return (
    <div className="st-page">
      <div className="stat-grid-4">
        <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>5 421</div><div className="stat-label">Utilisateurs</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#60a5fa" }}>183</div><div className="stat-label">Fournisseurs</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>8 934</div><div className="stat-label">Commandes</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#fbbf24" }}>4.7★</div><div className="stat-label">Note moyenne</div></div>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Période</span>
        <div className="row">
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Afficher :</span>
          <select className="select" value={periode} onChange={e => setPeriode(e.target.value)}>
            <option>Ce mois</option>
            <option>3 derniers mois</option>
            <option>Cette année</option>
          </select>
        </div>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Activité par catégorie</span>
        {CATEGORIES.map((c, i) => (
          <div className="bar-row" key={i}>
            <span className="bar-label">{c.label}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
            </div>
            <span className="bar-val">{c.pct}%</span>
          </div>
        ))}
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Export</span>
        <div className="action-row">
          <button className="btn btn-default">Exporter Excel</button>
          <button className="btn btn-primary">Imprimer rapport</button>
        </div>
        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 10 }}>
          Données du 01/01/2026 au 18/04/2026 · Mis à jour : 18/04/2026
        </p>
      </div>
    </div>
  );
}
