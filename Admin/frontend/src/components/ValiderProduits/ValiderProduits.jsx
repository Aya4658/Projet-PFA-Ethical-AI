import { useState } from "react";
import "./ValiderProduits.css";

const INIT_DATA = [
  { id: 1, nom: "Tisane Sauvage Aurès",  fournisseur: "Herboristerie",      categorie: "Santé",       statut: "Attente"  },
  { id: 2, nom: "Écharpe Laine Berbère", fournisseur: "Artisanes Ghardaïa", categorie: "Textile",     statut: "En revue" },
  { id: 3, nom: "Savon Argan Naturel",   fournisseur: "Coop. Tafraout",     categorie: "Cosmétiques", statut: "Attente"  },
];

function badgeClass(statut) {
  if (statut === "Attente")  return "badge badge-warn";
  if (statut === "En revue") return "badge badge-info";
  if (statut === "Publié")   return "badge badge-ok";
  return "badge badge-err";
}

export default function ValiderProduits({ toast }) {
  const [data, setData]         = useState(INIT_DATA);
  const [sel, setSel]           = useState(null);
  const [commentaire, setComm]  = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ nom: "", fournisseur: "", categorie: "Santé" });

  const valider = () => {
    if (!sel) return;
    setData(d => d.filter(p => p.id !== sel.id));
    setSel(null); setComm("");
    toast("Produit validé et publié !");
  };

  const refuser = () => {
    if (!sel) return;
    setData(d => d.filter(p => p.id !== sel.id));
    setSel(null); setComm("");
    toast("Produit refusé.");
  };

  const supprimer = (id) => {
    setData(d => d.filter(p => p.id !== id));
    if (sel?.id === id) setSel(null);
    toast("Produit supprimé.");
  };

  const ajouter = () => {
    if (!form.nom.trim()) return;
    setData(d => [...d, { id: Date.now(), nom: form.nom, fournisseur: form.fournisseur || "—", categorie: form.categorie, statut: "Attente" }]);
    setForm({ nom: "", fournisseur: "", categorie: "Santé" });
    setShowModal(false);
    toast("Produit ajouté !");
  };

  return (
    <div className="vp-page">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Ajouter un produit</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <input className="input" placeholder="Nom du produit *" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
              <input className="input" placeholder="Fournisseur" value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} />
              <select className="select" value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                <option>Santé</option><option>Textile</option>
                <option>Cosmétiques</option><option>Alimentation</option><option>Artisanat</option>
              </select>
              <div className="action-row" style={{ marginTop: 8 }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={ajouter}>Ajouter</button>
                <button className="btn btn-default" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row-end">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Ajouter produit</button>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Produits en attente de validation</span>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Produit</th><th>Fournisseur</th><th>Catégorie</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={5} className="table-empty">Aucun produit en attente</td></tr>}
              {data.map(p => (
                <tr key={p.id} className={sel?.id === p.id ? "selected" : ""} onClick={() => setSel(p)}>
                  <td style={{ fontWeight: sel?.id === p.id ? 700 : 400, color: sel?.id === p.id ? "#4ade80" : "#fff" }}>{p.nom}</td>
                  <td>{p.fournisseur}</td>
                  <td>{p.categorie}</td>
                  <td><span className={badgeClass(p.statut)}>{p.statut}</span></td>
                  <td><span className="td-del" onClick={e => { e.stopPropagation(); supprimer(p.id); }}>✕</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <div className="groupbox">
          <span className="groupbox-title">Décision — {sel.nom}</span>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Commentaire (optionnel)…"
            value={commentaire}
            onChange={e => setComm(e.target.value)}
          />
          <div className="action-row">
            <button className="btn btn-success" onClick={valider}>✓ Valider & Publier</button>
            <button className="btn btn-danger"  onClick={refuser}>✕ Refuser</button>
            <button className="btn btn-default" onClick={() => setSel(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
