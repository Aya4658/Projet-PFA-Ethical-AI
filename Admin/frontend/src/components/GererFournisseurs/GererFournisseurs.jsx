import { useState } from "react";
import { Badge, useCRUD, EditModal, ConfirmDialog } from "../shared.jsx";
import "./GererFournisseurs.css";

const API = "http://localhost:5000/api/producers";

const FIELDS = [
  { key: "nom",      label: "Nom du fournisseur" },
  { key: "type",     label: "Type", type: "select", options: ["PME", "Grande entreprise", "Coopérative", "Artisan"] },
  { key: "location", label: "Pays / Localisation" },
  { key: "email",    label: "Email de contact" },
  { key: "statut",   label: "Statut", type: "select", options: ["Actif", "Attente", "Suspendu"] },
];

export default function GererFournisseurs({ data, setData, showToast }) {
  const [recherche, setRecherche]     = useState("");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const crud = useCRUD(data, setData, showToast, f => f.nom);

  const filtered = data.filter(f =>
    f.nom.toLowerCase().includes(recherche.toLowerCase()) &&
    (filtreStatut === "Tous" || f.statut === filtreStatut)
  );

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
          name:              crud.editVals.nom,
          type:              crud.editVals.type,
          location:          crud.editVals.location,
          contact_email:     crud.editVals.email,
          statut:            crud.editVals.statut,
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

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span>🏭 Gérer comptes fournisseurs</span>
          <div className="ph-btns">
            <div className="ph-btn">_</div>
            <div className="ph-btn">□</div>
            <div className="ph-btn">✕</div>
          </div>
        </div>
        <div className="panel-body">

          <div className="groupbox">
            <span className="groupbox-legend">Rechercher fournisseur</span>
            <div className="form-row" style={{ marginTop: 8 }}>
              <span className="form-label">Nom :</span>
              <input
                className="form-input"
                placeholder="ex: Himalaya Organics"
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
              />
              <select
                className="form-select"
                value={filtreStatut}
                onChange={e => setFiltreStatut(e.target.value)}
              >
                <option>Tous</option>
                <option>Actif</option>
                <option>Attente</option>
                <option>Suspendu</option>
              </select>
            </div>
          </div>

          <div className="groupbox">
            <span className="groupbox-legend">Liste fournisseurs</span>
            <div className="stat-grid" style={{ marginTop: 8 }}>
              <div className="stat-box">
                <div className="stat-num">{data.length}</div>
                <div className="stat-lbl">Total</div>
              </div>
              <div className="stat-box">
                <div className="stat-num orange">{data.filter(f => f.statut === "Attente").length}</div>
                <div className="stat-lbl">En attente</div>
              </div>
              <div className="stat-box">
                <div className="stat-num red">{data.filter(f => f.statut === "Suspendu").length}</div>
                <div className="stat-lbl">Suspendus</div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                Aucun fournisseur trouvé
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Nom</th><th>Type</th><th>Localisation</th><th>Email</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr
                      key={f.id}
                      className={crud.selected === f.id ? "selected" : ""}
                      onClick={() => crud.setSelected(f.id)}
                    >
                      <td>{f.nom}</td>
                      <td>{f.type || "—"}</td>
                      <td>{f.location || "—"}</td>
                      <td>{f.email || "—"}</td>
                      <td><Badge s={f.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="btn-row">
              <button className="btn btn-success"   disabled={!crud.sel} onClick={() => handleStatut("Actif",    `${crud.sel.nom} approuvé`)}>✅ Approuver</button>
              <button className="btn btn-warning"   disabled={!crud.sel} onClick={() => handleStatut("Suspendu", `${crud.sel.nom} suspendu`)}>⛔ Suspendre</button>
              <button className="btn btn-secondary" disabled={!crud.sel} onClick={() => crud.openEdit(crud.sel)}>✏️ Modifier</button>
              <button className="btn btn-danger"    disabled={!crud.sel} onClick={() => crud.openConfirm(crud.sel.id)}>🗑️ Supprimer</button>
            </div>
          </div>

          <div className="statusbar">
            <span>{filtered.length} fournisseur(s) affiché(s)</span>
            {crud.sel
              ? <span>Sélection : {crud.sel.nom} — {crud.sel.location}</span>
              : <span style={{ color: "var(--warning)" }}>⚠ Cliquez sur une ligne</span>}
          </div>
        </div>
      </div>

      {crud.editItem && (
        <EditModal
          title={`Modifier — ${crud.editItem.nom}`}
          fields={FIELDS}
          values={crud.editVals}
          onChange={crud.onChange}
          onSave={handleSaveEdit}
          onCancel={crud.closeEdit}
        />
      )}
      {crud.confirmId && (
        <ConfirmDialog
          itemName={crud.confirmItem?.nom}
          onConfirm={handleDelete}
          onCancel={crud.closeConfirm}
        />
      )}
    </>
  );
}
