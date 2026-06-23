import { Badge, useCRUD, EditModal, ConfirmDialog } from "../shared.jsx";
import "./Certifications.css";

const FIELDS = [
  { key: "nom",         label: "Nom certification" },
  { key: "fournisseur", label: "Fournisseur" },
  { key: "statut",      label: "Statut", type: "select", options: ["Attente", "Valide", "Expiré"] },
];

export default function Certifications({ data, setData, showToast }) {
  const crud = useCRUD(data, setData, showToast, c => c.nom);

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span>🏅 Valider certifications</span>
          <div className="ph-btns">
            <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
          </div>
        </div>
        <div className="panel-body">
          <div className="groupbox">
            <span className="groupbox-legend">Liste certifications</span>
            <div className="stat-grid" style={{ marginTop: 8 }}>
              <div className="stat-box">
                <div className="stat-num orange">{data.filter(c => c.statut === "Attente").length}</div>
                <div className="stat-lbl">À traiter</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{data.filter(c => c.statut === "Valide").length}</div>
                <div className="stat-lbl">Validés</div>
              </div>
              <div className="stat-box">
                <div className="stat-num red">{data.filter(c => c.statut === "Expiré").length}</div>
                <div className="stat-lbl">Expirés</div>
              </div>
            </div>

            {data.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📭</div>Aucune certification</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Certification</th><th>Fournisseur</th><th>Statut</th></tr></thead>
                <tbody>
                  {data.map(c => (
                    <tr key={c.id} className={crud.selected === c.id ? "selected" : ""} onClick={() => crud.setSelected(c.id)}>
                      <td>{c.nom}</td><td>{c.fournisseur}</td><td><Badge s={c.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="btn-row">
              <button className="btn btn-success"   disabled={!crud.sel} onClick={() => crud.updateField(crud.sel.id, "statut", "Valide",  `${crud.sel.nom} validée`)}>✅ Valider</button>
              <button className="btn btn-danger"    disabled={!crud.sel} onClick={() => crud.updateField(crud.sel.id, "statut", "Expiré", `${crud.sel.nom} rejetée`)}>❌ Rejeter</button>
              <button className="btn btn-secondary" disabled={!crud.sel} onClick={() => crud.openEdit(crud.sel)}>✏️ Modifier</button>
              <button className="btn btn-danger"    disabled={!crud.sel} onClick={() => crud.openConfirm(crud.sel.id)}>🗑️ Supprimer</button>
            </div>
          </div>

          <div className="statusbar">
            <span>{data.length} certification(s)</span>
            {crud.sel
              ? <span>Sélection : {crud.sel.nom}</span>
              : <span style={{ color: "var(--warning)" }}>⚠ Cliquez sur une ligne</span>}
          </div>
        </div>
      </div>

      {crud.editItem && (
        <EditModal title={`Modifier — ${crud.editItem.nom}`} fields={FIELDS} values={crud.editVals} onChange={crud.onChange} onSave={() => crud.saveEdit()} onCancel={crud.closeEdit} />
      )}
      {crud.confirmId && (
        <ConfirmDialog itemName={crud.confirmItem?.nom} onConfirm={crud.confirmDelete} onCancel={crud.closeConfirm} />
      )}
    </>
  );
}
