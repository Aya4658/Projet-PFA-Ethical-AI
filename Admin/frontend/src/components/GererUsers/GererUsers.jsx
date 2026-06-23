import { useState } from "react";
import { Badge, useCRUD, EditModal, ConfirmDialog } from "../shared.jsx";
import "./GererUsers.css";

const API = "http://localhost:5000/api/users";
const STATUS_OPTIONS = ["Actif", "Bloqué", "Banni"];

const FIELDS = [
  { key: "nom",         label: "Nom complet" },
  { key: "email",       label: "Email", type: "email" },
  { key: "statut",      label: "Statut", type: "select", options: STATUS_OPTIONS },
  { key: "inscription", label: "Date inscription" },
];

export default function GererUsers({ data, setData, showToast }) {
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const crud = useCRUD(data, setData, showToast, u => u.nom);

  const handleStatut = async (statut, msg) => {
    try {
      const res = await fetch(`${API}/${crud.sel.id}/statut`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(prev => prev.map(u => u.id === updated.id ? updated : u));
      showToast("success", "✅", msg);
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API}/${crud.editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crud.editVals),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(prev => prev.map(u => u.id === updated.id ? updated : u));
      crud.closeEdit();
      showToast("success", "✅", `${updated.nom} mis à jour`);
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/${crud.confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      crud.confirmDelete();
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const filtered = data.filter(u =>
    u.nom.toLowerCase().includes(recherche.toLowerCase()) &&
    (filtreStatut === "Tous" || u.statut === filtreStatut)
  );

  const countBy = status => data.filter(u => u.statut === status).length;

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span>👥 Gérer comptes utilisateurs</span>
          <div className="ph-btns">
            <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
          </div>
        </div>
        <div className="panel-body">

          <div className="groupbox">
            <span className="groupbox-legend">Rechercher utilisateur</span>
            <div className="form-row" style={{ marginTop: 8 }}>
              <span className="form-label">Nom :</span>
              <input
                className="form-input"
                placeholder="ex: User_1"
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
              />
              <select className="form-select" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
                <option>Tous</option>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="groupbox">
            <span className="groupbox-legend">Liste utilisateurs</span>
            <div className="stat-grid" style={{ marginTop: 8 }}>
              <div className="stat-box"><div className="stat-num">{data.length}</div><div className="stat-lbl">Total</div></div>
              <div className="stat-box"><div className="stat-num blue">{countBy("Actif")}</div><div className="stat-lbl">Actifs</div></div>
              <div className="stat-box"><div className="stat-num red">{countBy("Bloqué")}</div><div className="stat-lbl">Bloqués</div></div>
              <div className="stat-box"><div className="stat-num orange">{countBy("Banni")}</div><div className="stat-lbl">Bannis</div></div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🔍</div>Aucun utilisateur trouvé</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Nom</th><th>Email</th><th>Statut</th><th>Inscription</th></tr></thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className={crud.selected === u.id ? "selected" : ""} onClick={() => crud.setSelected(u.id)}>
                      <td>{u.nom}</td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{u.email}</td>
                      <td><Badge s={u.statut} /></td>
                      <td>{u.inscription || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="btn-row">
              <button className="btn btn-warning"   disabled={!crud.sel || crud.sel.statut === "Bloqué"} onClick={() => handleStatut("Bloqué", `${crud.sel.nom} bloqué`)}>⛔ Bloquer</button>
              <button className="btn btn-danger"    disabled={!crud.sel || crud.sel.statut === "Banni"}  onClick={() => handleStatut("Banni", `${crud.sel.nom} banni`)}>🚫 Bannir</button>
              <button className="btn btn-success"   disabled={!crud.sel || crud.sel.statut === "Actif"} onClick={() => handleStatut("Actif", `${crud.sel.nom} réactivé`)}>✅ Réactiver</button>
              <button className="btn btn-secondary" disabled={!crud.sel} onClick={() => crud.openEdit(crud.sel)}>✏️ Modifier</button>
              <button className="btn btn-danger"    disabled={!crud.sel} onClick={() => crud.openConfirm(crud.sel.id)}>🗑️ Supprimer</button>
            </div>
          </div>

          <div className="statusbar">
            <span>{filtered.length} utilisateur(s) affiché(s)</span>
            {crud.sel
              ? <span>Sélection : {crud.sel.nom} — {crud.sel.statut}</span>
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
