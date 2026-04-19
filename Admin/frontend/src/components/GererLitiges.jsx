import { useState } from "react";
import "./GererLitiges.css";

const INIT_DATA = [
  { id: 1, ref: "LTG-2026-001", acheteur: "Leila M.",  fournisseur: "TechGamma",  motif: "Non conforme", statut: "Ouvert"   },
  { id: 2, ref: "LTG-2026-002", acheteur: "Karim B.",  fournisseur: "Bio Sahara", motif: "Non livré",    statut: "En cours" },
  { id: 3, ref: "LTG-2026-003", acheteur: "Amira S.",  fournisseur: "Ferme Azul", motif: "Qualité",      statut: "Résolu"   },
];

function badgeClass(statut) {
  if (statut === "Résolu")   return "badge badge-ok";
  if (statut === "En cours") return "badge badge-warn";
  if (statut === "Ouvert")   return "badge badge-err";
  return "badge badge-info";
}

export default function GererLitiges({ toast }) {
  const [data, setData] = useState(INIT_DATA);
  const [sel, setSel]   = useState(null);

  const cloturer = () => {
    if (!sel) return;
    setData(d => d.map(l => l.id === sel.id ? { ...l, statut: "Résolu" } : l));
    setSel(s => ({ ...s, statut: "Résolu" }));
    toast("Litige clôturé !");
  };

  const supprimer = (id) => {
    setData(d => d.filter(l => l.id !== id));
    if (sel?.id === id) setSel(null);
    toast("Litige supprimé.");
  };

  return (
    <div className="gl-page">
      <div className="stat-grid-3">
        <div className="stat-box"><div className="stat-value" style={{ color: "#f87171" }}>{data.filter(l => l.statut === "Ouvert").length}</div><div className="stat-label">Ouverts</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#fbbf24" }}>{data.filter(l => l.statut === "En cours").length}</div><div className="stat-label">En cours</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>{data.filter(l => l.statut === "Résolu").length}</div><div className="stat-label">Résolus</div></div>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Litiges</span>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Référence</th><th>Acheteur</th><th>Fournisseur</th><th>Motif</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={6} className="table-empty">Aucun litige</td></tr>}
              {data.map(l => (
                <tr key={l.id} className={sel?.id === l.id ? "selected" : ""} onClick={() => setSel(l)}>
                  <td style={{ fontWeight: sel?.id === l.id ? 700 : 400, color: sel?.id === l.id ? "#4ade80" : "#fff" }}>{l.ref}</td>
                  <td>{l.acheteur}</td>
                  <td>{l.fournisseur}</td>
                  <td>{l.motif}</td>
                  <td><span className={badgeClass(l.statut)}>{l.statut}</span></td>
                  <td><span className="td-del" onClick={e => { e.stopPropagation(); supprimer(l.id); }}>✕</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sel && <div className="selection-info">Sélectionné : <strong>{sel.ref}</strong> — {sel.acheteur} / {sel.fournisseur}</div>}

        <div className="action-row">
          <button className="btn btn-success" onClick={cloturer}>✓ Clôturer</button>
          <button className="btn btn-danger"  onClick={() => sel && supprimer(sel.id)}>✕ Supprimer</button>
          <button className="btn btn-default" onClick={() => setSel(null)}>Annuler sélection</button>
        </div>
        {!sel && <p className="hint">↑ Cliquez sur une ligne pour sélectionner</p>}
      </div>
    </div>
  );
}
