import { useState } from "react";
import "./TraiterSignalements.css";

const INIT_DATA = [
  { id: 1, produit: "Câble HDMI 4K",      fournisseur: "TechGamma", motif: "Trompeur",     nb: 27, priorite: "Urgent"   },
  { id: 2, produit: "Supplément X-Boost", fournisseur: "MediaBeta", motif: "Non conforme", nb: 9,  priorite: "En cours" },
  { id: 3, produit: "Chargeur Rapide X",  fournisseur: "Sté Alpha", motif: "Dangereux",    nb: 5,  priorite: "Urgent"   },
];

function badgeClass(p) {
  if (p === "Urgent")   return "badge badge-err";
  if (p === "En cours") return "badge badge-info";
  return "badge badge-warn";
}

export default function TraiterSignalements({ toast }) {
  const [data, setData]   = useState(INIT_DATA);
  const [sel, setSel]     = useState(null);
  const [action, setAction] = useState("— Choisir —");

  const appliquer = () => {
    if (!sel || action === "— Choisir —") { toast("Choisissez une action d'abord."); return; }
    setData(d => d.filter(s => s.id !== sel.id));
    setSel(null);
    toast(`Action "${action}" appliquée !`);
  };

  const supprimer = (id) => {
    setData(d => d.filter(s => s.id !== id));
    if (sel?.id === id) setSel(null);
    toast("Signalement supprimé.");
  };

  return (
    <div className="ts-page">
      <div className="stat-grid-3">
        <div className="stat-box"><div className="stat-value" style={{ color: "#f87171" }}>{data.filter(s => s.priorite === "Urgent").length}</div><div className="stat-label">Urgent</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#60a5fa" }}>{data.filter(s => s.priorite === "En cours").length}</div><div className="stat-label">En cours</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>204</div><div className="stat-label">Résolus</div></div>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Signalements actifs</span>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Produit</th><th>Fournisseur</th><th>Motif</th><th>Nb signalements</th><th>Priorité</th><th></th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={6} className="table-empty">Aucun signalement actif</td></tr>}
              {data.map(s => (
                <tr key={s.id} className={sel?.id === s.id ? "selected" : ""} onClick={() => setSel(s)}>
                  <td style={{ fontWeight: sel?.id === s.id ? 700 : 400, color: sel?.id === s.id ? "#4ade80" : "#fff" }}>{s.produit}</td>
                  <td>{s.fournisseur}</td>
                  <td>{s.motif}</td>
                  <td>{s.nb}</td>
                  <td><span className={badgeClass(s.priorite)}>{s.priorite}</span></td>
                  <td><span className="td-del" onClick={e => { e.stopPropagation(); supprimer(s.id); }}>✕</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <div className="groupbox">
          <span className="groupbox-title">Décision — {sel.produit}</span>
          <div className="row" style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Action :</span>
            <select className="select input-grow" value={action} onChange={e => setAction(e.target.value)}>
              <option>— Choisir —</option>
              <option>Retirer le produit</option>
              <option>Avertir fournisseur</option>
              <option>Demander correction</option>
              <option>Classer sans suite</option>
            </select>
          </div>
          <div className="action-row">
            <button className="btn btn-primary" onClick={appliquer}>✓ Appliquer</button>
            <button className="btn btn-default" onClick={() => setSel(null)}>Annuler</button>
          </div>
        </div>
      )}
      {!sel && <p className="hint">↑ Cliquez sur une ligne pour sélectionner et prendre une décision</p>}
    </div>
  );
}
