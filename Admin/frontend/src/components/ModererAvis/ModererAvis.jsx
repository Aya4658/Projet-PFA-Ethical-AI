import { useState } from "react";
import { Badge, useCRUD, EditModal, ConfirmDialog } from "../shared.jsx";
import "./ModererAvis.css";

const FIELDS = [
  { key: "utilisateur", label: "Utilisateur" },
  { key: "produit",     label: "Produit" },
  { key: "note",        label: "Note", type: "select", options: ["1★", "2★", "3★", "4★", "5★"] },
  { key: "statut",      label: "Statut", type: "select", options: ["Attente", "Signalé", "Actif"] },
  { key: "avis",        label: "Contenu de l'avis", type: "textarea", full: true },
];

export default function ModererAvis({ data, setData, showToast }) {
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const crud = useCRUD(data, setData, showToast, a => a.utilisateur);

  const filtered = data.filter(a => filtreStatut === "Tous" || a.statut === filtreStatut);

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span>💬 Modérer avis</span>
          <div className="ph-btns">
            <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
          </div>
        </div>
        <div className="panel-body">

          <div className="groupbox">
            <span className="groupbox-legend">Filtres avis</span>
            <div className="form-row" style={{ marginTop: 8 }}>
              <span className="form-label">Statut :</span>
              <select className="form-select" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
                <option>Tous</option><option>Attente</option><option>Signalé</option><option>Actif</option>
              </select>
            </div>
          </div>

          <div className="groupbox">
            <span className="groupbox-legend">Avis</span>
            <div className="stat-grid" style={{ marginTop: 8 }}>
              <div className="stat-box"><div className="stat-num orange">{data.filter(a => a.statut === "Attente").length}</div><div className="stat-lbl">À modérer</div></div>
              <div className="stat-box"><div className="stat-num">{data.filter(a => a.statut === "Actif").length}</div><div className="stat-lbl">Publiés</div></div>
              <div className="stat-box"><div className="stat-num red">{data.filter(a => a.statut === "Signalé").length}</div><div className="stat-lbl">Signalés</div></div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">💬</div>Aucun avis</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Utilisateur</th><th>Avis</th><th>Note</th><th>Produit</th><th>Statut</th></tr></thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className={crud.selected === a.id ? "selected" : ""} onClick={() => crud.setSelected(a.id)}>
                      <td>{a.utilisateur}</td>
                      <td style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.avis}</td>
                      <td>{a.note}</td>
                      <td>{a.produit}</td>
                      <td><Badge s={a.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {crud.sel && (
            <div className="groupbox">
              <span className="groupbox-legend">Contenu sélectionné</span>
              <textarea className="form-textarea" rows={3} readOnly value={crud.sel.avis} style={{ marginTop: 8, background: "var(--bg)" }} />
              <div className="btn-row">
                <button className="btn btn-success"   onClick={() => crud.updateField(crud.sel.id, "statut", "Actif",   `Avis de ${crud.sel.utilisateur} publié`)}>📢 Publier</button>
                <button className="btn btn-warning"   onClick={() => crud.updateField(crud.sel.id, "statut", "Signalé", `Avis de ${crud.sel.utilisateur} signalé`)}>🚩 Signaler</button>
                <button className="btn btn-secondary" onClick={() => crud.openEdit(crud.sel)}>✏️ Modifier</button>
                <button className="btn btn-danger"    onClick={() => crud.openConfirm(crud.sel.id)}>🗑️ Supprimer</button>
              </div>
            </div>
          )}

          <div className="statusbar">
            <span>{data.length} avis au total</span>
            {crud.sel
              ? <span>Sélection : {crud.sel.utilisateur}</span>
              : <span style={{ color: "var(--warning)" }}>⚠ Cliquez sur un avis</span>}
          </div>
        </div>
      </div>

      {crud.editItem && (
        <EditModal title="Modifier avis" fields={FIELDS} values={crud.editVals} onChange={crud.onChange} onSave={() => crud.saveEdit("Avis modifié")} onCancel={crud.closeEdit} />
      )}
      {crud.confirmId && (
        <ConfirmDialog itemName={`avis de ${crud.confirmItem?.utilisateur}`} onConfirm={crud.confirmDelete} onCancel={crud.closeConfirm} />
      )}
    </>
  );
}
