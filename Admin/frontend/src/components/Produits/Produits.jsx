import { useState } from "react";
import { Badge, useCRUD, EditModal, ConfirmDialog } from "../shared.jsx";
import "./Produits.css";

const API = "http://localhost:5000/api/products";

const FIELDS = [
  { key: "nom",         label: "Nom du produit" },
  { key: "fournisseur", label: "Fournisseur (ID)" },
  { key: "statut",      label: "Statut", type: "select", options: ["Attente", "En revue", "Valide", "Suspendu"] },
];

export default function Produits({ data, setData, showToast }) {
  const [recherche, setRecherche] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const crud = useCRUD(data, setData, showToast, p => p.nom);

  const filtered = data.filter(p => p.nom.toLowerCase().includes(recherche.toLowerCase()));

  const handleStatut = async (newStatut, msg) => {
    if (!crud.sel) return;
    try {
      await fetch(`${API}/${crud.sel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      crud.updateField(crud.sel.id, "statut", newStatut, msg);
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await fetch(`${API}/${crud.editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        crud.editVals.nom,
          producer_id: crud.editVals.fournisseur,
          statut:      crud.editVals.statut,
        }),
      });
      crud.saveEdit();
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleDelete = async () => {
    if (!crud.confirmId) return;
    try {
      await fetch(`${API}/${crud.confirmId}`, { method: "DELETE" });
      crud.confirmDelete();
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleAjouter = async () => {
    const body = { name: "Nouveau produit", statut: "Attente" };
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      const n = { id: created._id, nom: created.name, fournisseur: "—", statut: "Attente" };
      setData(prev => [...prev, n]);
      crud.setSelected(n.id);
      crud.openEdit(n, { nom: n.nom, fournisseur: n.fournisseur, statut: n.statut });
      showToast("success", "➕", "Nouveau produit — remplissez les champs");
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span>📦 Valider produits avant publication</span>
          <div className="ph-btns">
            <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
          </div>
        </div>
        <div className="panel-body">

          <div className="groupbox">
            <span className="groupbox-legend">Rechercher produit</span>
            <div className="form-row" style={{ marginTop: 8 }}>
              <span className="form-label">Produit :</span>
              <input
                className="form-input"
                placeholder="Nom du produit..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
              />
            </div>
          </div>

          <div className="groupbox">
            <span className="groupbox-legend">Produits en attente</span>
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📭</div>Aucun produit</div>
            ) : (
              <table className="data-table" style={{ marginTop: 8 }}>
                <thead><tr><th>Produit</th><th>Fournisseur</th><th>Statut</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className={crud.selected === p.id ? "selected" : ""} onClick={() => crud.setSelected(p.id)}>
                      <td>{p.nom}</td><td>{p.fournisseur}</td><td><Badge s={p.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="groupbox">
            <span className="groupbox-legend">Décision</span>
            <div style={{ marginTop: 8, marginBottom: 6 }}>
              <span className="form-label">Commentaire (optionnel) :</span>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Motif de refus..."
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>
            <div className="btn-row">
              <button className="btn btn-success"   disabled={!crud.sel} onClick={() => handleStatut("Valide",    `${crud.sel.nom} validé`)}>✅ Valider</button>
              <button className="btn btn-danger"    disabled={!crud.sel} onClick={() => handleStatut("Suspendu", `${crud.sel.nom} refusé`)}>❌ Refuser</button>
              <button className="btn btn-secondary" disabled={!crud.sel} onClick={() => crud.openEdit(crud.sel)}>✏️ Modifier</button>
              <button className="btn btn-danger"    disabled={!crud.sel} onClick={() => crud.openConfirm(crud.sel.id)}>🗑️ Supprimer</button>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn btn-info" style={{ flex: 1 }} onClick={handleAjouter}>➕ Ajouter produit</button>
          </div>

          <div className="statusbar">
            <span>{data.length} produit(s)</span>
            {crud.sel
              ? <span>Sélection : {crud.sel.nom}</span>
              : <span style={{ color: "var(--warning)" }}>⚠ Cliquez sur une ligne</span>}
          </div>
        </div>
      </div>

      {crud.editItem && (
        <EditModal title={`Modifier — ${crud.editItem.nom}`} fields={FIELDS} values={crud.editVals} onChange={crud.onChange} onSave={handleSaveEdit} onCancel={crud.closeEdit} />
      )}
      {crud.confirmId && (
        <ConfirmDialog itemName={crud.confirmItem?.nom} onConfirm={handleDelete} onCancel={crud.closeConfirm} />
      )}
    </>
  );
}
