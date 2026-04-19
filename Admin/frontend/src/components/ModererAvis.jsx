import { useState } from "react";
import "./ModererAvis.css";

const INIT_DATA = [
  { id: 1, user: "Leila M.", texte: "Produit non conforme à la description…", note: "2 ★", produit: "Câble HDMI",   statut: "Attente" },
  { id: 2, user: "Karim B.", texte: "Arnaque totale ! Ne commandez pas…",     note: "1 ★", produit: "Supplément X", statut: "Signalé" },
  { id: 3, user: "Amira S.", texte: "Livraison rapide, produit de qualité !",  note: "5 ★", produit: "Miel BIO",     statut: "Attente" },
];

function badgeClass(statut) {
  if (statut === "Publié")  return "badge badge-ok";
  if (statut === "Attente") return "badge badge-warn";
  if (statut === "Signalé") return "badge badge-err";
  return "badge badge-info";
}

export default function ModererAvis({ toast }) {
  const [data, setData] = useState(INIT_DATA);
  const [sel, setSel]   = useState(null);

  const publier = () => {
    if (!sel) return;
    setData(d => d.map(a => a.id === sel.id ? { ...a, statut: "Publié" } : a));
    setSel(s => ({ ...s, statut: "Publié" }));
    toast("Avis publié !");
  };

  const supprimer = (id) => {
    setData(d => d.filter(a => a.id !== id));
    if (sel?.id === id) setSel(null);
    toast("Avis supprimé.");
  };

  return (
    <div className="ma-page">
      <div className="stat-grid-3">
        <div className="stat-box"><div className="stat-value" style={{ color: "#f87171" }}>{data.filter(a => a.statut === "Attente").length}</div><div className="stat-label">À modérer</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>{data.filter(a => a.statut === "Publié").length}</div><div className="stat-label">Publiés</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#fbbf24" }}>{data.filter(a => a.statut === "Signalé").length}</div><div className="stat-label">Signalés</div></div>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Avis en attente</span>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Utilisateur</th><th>Texte</th><th>Note</th><th>Produit</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={6} className="table-empty">Aucun avis</td></tr>}
              {data.map(a => (
                <tr key={a.id} className={sel?.id === a.id ? "selected" : ""} onClick={() => setSel(a)}>
                  <td style={{ fontWeight: sel?.id === a.id ? 700 : 400, color: sel?.id === a.id ? "#4ade80" : "#fff" }}>{a.user}</td>
                  <td className="td-texte">{a.texte}</td>
                  <td>{a.note}</td>
                  <td>{a.produit}</td>
                  <td><span className={badgeClass(a.statut)}>{a.statut}</span></td>
                  <td><span className="td-del" onClick={e => { e.stopPropagation(); supprimer(a.id); }}>✕</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <div className="groupbox">
          <span className="groupbox-title">Avis de {sel.user}</span>
          <div className="avis-content">{sel.texte}</div>
          <div className="avis-meta">
            <span className="badge badge-info">{sel.note}</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Produit : {sel.produit}</span>
          </div>
          <div className="action-row" style={{ marginTop: 14 }}>
            <button className="btn btn-success" onClick={publier}>✓ Publier</button>
            <button className="btn btn-danger"  onClick={() => supprimer(sel.id)}>✕ Supprimer</button>
            <button className="btn btn-default" onClick={() => setSel(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
