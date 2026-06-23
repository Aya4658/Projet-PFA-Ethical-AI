import { useState } from "react";
import { Badge, useCRUD, EditModal, ConfirmDialog } from "../shared.jsx";
import "./Signalements.css";

const API = "http://localhost:5000/api/reports";

const STATUS_OPTIONS = ["En attente", "En cours d'examen", "Résolu", "Rejeté"];

const ACTION_STATUS = {
  "Marquer en examen": "En cours d'examen",
  "Résoudre le signalement": "Résolu",
  "Rejeter le signalement": "Rejeté",
};

const FIELDS = [
  { key: "report_code", label: "Code signalement" },
  { key: "username",    label: "Utilisateur" },
  { key: "product_id",  label: "ID produit" },
  { key: "reason",      label: "Motif" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "status",      label: "Statut", type: "select", options: STATUS_OPTIONS },
  { key: "moderator_notes", label: "Notes modérateur", type: "textarea" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function Signalements({ data, setData, showToast }) {
  const [action, setAction] = useState("Marquer en examen");
  const [noteAdmin, setNoteAdmin] = useState("");
  const crud = useCRUD(data, setData, showToast, s => s.report_code);

  const handleAppliquer = async () => {
    if (!crud.sel) return;
    const status = ACTION_STATUS[action];
    try {
      const res = await fetch(`${API}/${crud.sel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, moderator_notes: noteAdmin || crud.sel.moderator_notes }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast("success", "✅", `Signalement ${updated.report_code} : ${status}`);
      setNoteAdmin("");
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API}/${crud.editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: crud.editVals.status,
          moderator_notes: crud.editVals.moderator_notes,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(prev => prev.map(r => r.id === updated.id ? updated : r));
      crud.closeEdit();
      showToast("success", "✅", `Signalement ${updated.report_code} mis à jour`);
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

  const countBy = status => data.filter(s => s.status === status).length;

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
              <div className="stat-box"><div className="stat-num orange">{countBy("En attente")}</div><div className="stat-lbl">En attente</div></div>
              <div className="stat-box"><div className="stat-num blue">{countBy("En cours d'examen")}</div><div className="stat-lbl">En examen</div></div>
              <div className="stat-box"><div className="stat-num">{countBy("Résolu")}</div><div className="stat-lbl">Résolus</div></div>
              <div className="stat-box"><div className="stat-num red">{countBy("Rejeté")}</div><div className="stat-lbl">Rejetés</div></div>
            </div>

            {data.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">✅</div>Aucun signalement</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Utilisateur</th>
                    <th>Produit</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(s => (
                    <tr key={s.id} className={crud.selected === s.id ? "selected" : ""} onClick={() => crud.setSelected(s.id)}>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{s.report_code}</td>
                      <td>{s.username}</td>
                      <td>#{s.product_id}</td>
                      <td>{s.reason}</td>
                      <td><Badge s={s.status} /></td>
                      <td>{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {crud.sel && (
            <div className="groupbox">
              <span className="groupbox-legend">Détail — {crud.sel.report_code}</span>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
                <div><strong>Description :</strong> {crud.sel.description || "—"}</div>
                {crud.sel.moderator_notes && (
                  <div style={{ marginTop: 4 }}><strong>Notes modérateur :</strong> {crud.sel.moderator_notes}</div>
                )}
                {crud.sel.resolved_at && (
                  <div style={{ marginTop: 4 }}><strong>Résolu le :</strong> {formatDate(crud.sel.resolved_at)}</div>
                )}
              </div>
            </div>
          )}

          <div className="groupbox">
            <span className="groupbox-legend">Décision administrative</span>
            <div className="form-row" style={{ marginTop: 8 }}>
              <span className="form-label">Action :</span>
              <select className="form-select" style={{ flex: 1 }} value={action} onChange={e => setAction(e.target.value)}>
                {Object.keys(ACTION_STATUS).map(a => (
                  <option key={a}>{a}</option>
                ))}
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
              ? <span>Sélection : {crud.sel.report_code} — {crud.sel.reason}</span>
              : <span style={{ color: "var(--warning)" }}>⚠ Cliquez sur une ligne</span>}
          </div>
        </div>
      </div>

      {crud.editItem && (
        <EditModal
          title={`Modifier — ${crud.editItem.report_code}`}
          fields={FIELDS}
          values={crud.editVals}
          onChange={crud.onChange}
          onSave={handleSaveEdit}
          onCancel={crud.closeEdit}
        />
      )}
      {crud.confirmId && (
        <ConfirmDialog itemName={crud.confirmItem?.report_code} onConfirm={handleDelete} onCancel={crud.closeConfirm} />
      )}
    </>
  );
}
