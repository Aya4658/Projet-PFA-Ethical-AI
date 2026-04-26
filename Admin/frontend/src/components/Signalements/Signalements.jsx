import { useState } from "react";
import { Badge, useCRUD, EditModal, ConfirmDialog } from "../shared.jsx";
import "./Signalements.css";

const FIELDS = [
  { key: "produit", label: "Produit" },
  { key: "motif",   label: "Motif" },
  { key: "statut",  label: "Statut", type: "select", options: ["Urgent", "En cours", "Résolu"] },
];

export default function Signalements({ data, setData, showToast }) {
  const [action, setAction] = useState("Retirer le produit");
  const [noteAdmin, setNoteAdmin] = useState("");
  const crud = useCRUD(data, setData, showToast, s => s.produit);

  const handleAppliquer = () => {
    if (!crud.sel) return;
    crud.updateField(crud.sel.id, "statut", "En cours", `Action "${action}" appliquée`);
    setNoteAdmin("");
  };

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span>🚨 Traiter signalements produits</span>
          <div className="ph-btns">
            <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
          </div>
        </div>
        <div className="panel-body">

          <div className="groupbox">
            <span className="groupbox-legend">Signalements</span>
            <div className="stat-grid" style={{ marginTop: 8 }}>
              <div className="stat-box"><div className="stat-num red">{data.filter(s => s.statut === "Urgent").length}</div><div className="stat-lbl">Urgent</div></div>
              <div className="stat-box"><div className="stat-num orange">{data.filter(s => s.statut === "En cours").length}</div><div className="stat-lbl">En cours</div></div>
              <div className="stat-box"><div className="stat-num">{data.filter(s => s.statut === "Résolu").length}</div><div className="stat-lbl">Résolus</div></div>
            </div>

            {data.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">✅</div>Aucun signalement</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Produit</th><th>Motif</th><th>Statut</th></tr></thead>
                <tbody>
                  {data.map(s => (
                    <tr key={s.id} className={crud.selected === s.id ? "selected" : ""} onClick={() => crud.setSelected(s.id)}>
                      <td>{s.produit}</td><td>{s.motif}</td><td><Badge s={s.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="groupbox">
            <span className="groupbox-legend">Décision administrative</span>
            <div className="form-row" style={{ marginTop: 8 }}>
              <span className="form-label">Action :</span>
              <select className="form-select" style={{ flex: 1 }} value={action} onChange={e => setAction(e.target.value)}>
                <option>Retirer le produit</option>
                <option>Avertir fournisseur</option>
                <option>Classer sans suite</option>
              </select>
            </div>
            <div style={{ marginBottom: 6 }}>
              <span className="form-label">Note interne :</span>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Justification interne..."
                value={noteAdmin}
                onChange={e => setNoteAdmin(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>
            <div className="btn-row">
              <button className="btn btn-success"   disabled={!crud.sel} onClick={handleAppliquer}>⚖️ Appliquer</button>
              <button className="btn btn-secondary" disabled={!crud.sel} onClick={() => crud.openEdit(crud.sel)}>✏️ Modifier</button>
              <button className="btn btn-danger"    disabled={!crud.sel} onClick={() => crud.openConfirm(crud.sel.id)}>🗑️ Supprimer</button>
            </div>
          </div>

          <div className="statusbar">
            <span>{data.length} signalement(s)</span>
            {crud.sel
              ? <span>Sélection : {crud.sel.produit}</span>
              : <span style={{ color: "var(--warning)" }}>⚠ Cliquez sur une ligne</span>}
          </div>
        </div>
      </div>

      {crud.editItem && (
        <EditModal title={`Modifier — ${crud.editItem.produit}`} fields={FIELDS} values={crud.editVals} onChange={crud.onChange} onSave={() => crud.saveEdit()} onCancel={crud.closeEdit} />
      )}
      {crud.confirmId && (
        <ConfirmDialog itemName={crud.confirmItem?.produit} onConfirm={crud.confirmDelete} onCancel={crud.closeConfirm} />
      )}
    </>
  );
}
