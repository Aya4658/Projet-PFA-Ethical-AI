import { useState, useCallback } from "react";

// ─── BADGE ────────────────────────────────────────────────────────
export function Badge({ s }) {
  const map = {
    Actif: "badge-ok", Valide: "badge-ok",
    Attente: "badge-warn", "En attente": "badge-warn", "En revue": "badge-info", "En cours": "badge-info",
    Bloqué: "badge-err", Suspendu: "badge-err", Expiré: "badge-err", Urgent: "badge-err", Signalé: "badge-err",
  };
  return <span className={`badge ${map[s] || "badge-info"}`}>{s}</span>;
}

// ─── TOAST CONTAINER ──────────────────────────────────────────────
export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.icon}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── useToast HOOK ─────────────────────────────────────────────────
let _tid = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((type, icon, msg) => {
    const id = ++_tid;
    setToasts(p => [...p, { id, type, icon, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, showToast };
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────
export function ConfirmDialog({ itemName, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card modal-card-sm">
        <div className="modal-header red">
          <h2>Confirmer la suppression</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <div className="confirm-icon">🗑️</div>
          <div className="confirm-msg">Supprimer « {itemName} » ?</div>
          <div className="confirm-sub">Cette action est irréversible.</div>
          <div className="confirm-btns">
            <button className="btn btn-secondary" style={{ minWidth: 100 }} onClick={onCancel}>Annuler</button>
            <button className="btn btn-danger"    style={{ minWidth: 100 }} onClick={onConfirm}>Oui, supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────
export function EditModal({ title, fields, values, onChange, onSave, onCancel }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card">
        <div className="modal-header green">
          <h2>✏️ {title}</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <div className="edit-grid">
            {fields.map(f => (
              <div className="edit-field" key={f.key} style={f.full ? { gridColumn: "1/-1" } : {}}>
                <label>{f.label}</label>
                {f.type === "select" ? (
                  <select value={values[f.key] || ""} onChange={e => onChange(f.key, e.target.value)}>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea rows={3} value={values[f.key] || ""} onChange={e => onChange(f.key, e.target.value)} />
                ) : (
                  <input type={f.type || "text"} value={values[f.key] || ""} onChange={e => onChange(f.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn btn-success" onClick={onSave}>💾 Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE MODAL ────────────────────────────────────────────────
const ADMIN_INFO = {
  prenom: "Mohamed", nom: "Principal", email: "admin@ethicchain.ma",
  role: "Super Administrateur", dateCreation: "01/01/2024",
  derniereConnexion: "26/04/2026 09:14", telephone: "+212 600 000 001",
  statut: "Actif", id: "ADM-0001", departement: "Direction Technique",
};

export function ProfileModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header green">
          <h2>👤 Mon Profil Administrateur</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="profile-avatar-big">MP</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{ADMIN_INFO.prenom} {ADMIN_INFO.nom}</div>
            <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, marginTop: 3 }}>{ADMIN_INFO.role}</div>
            <Badge s={ADMIN_INFO.statut} />
          </div>
          <div className="divider" />
          <div className="profile-grid">
            {[
              { label: "ID Admin",           value: ADMIN_INFO.id },
              { label: "Département",        value: ADMIN_INFO.departement },
              { label: "Email",              value: ADMIN_INFO.email },
              { label: "Téléphone",          value: ADMIN_INFO.telephone },
              { label: "Date de création",   value: ADMIN_INFO.dateCreation },
              { label: "Dernière connexion", value: ADMIN_INFO.derniereConnexion },
            ].map(f => (
              <div className="profile-field" key={f.label}>
                <span className="profile-field-label">{f.label}</span>
                <span className="profile-field-value">{f.value}</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
            <button className="btn btn-primary" onClick={onClose}>✏️ Modifier profil</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── useCRUD HOOK GÉNÉRIQUE ───────────────────────────────────────
export function useCRUD(data, setData, showToast, labelFn) {
  const [selected, setSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editVals, setEditVals] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const sel = data.find(d => d.id === selected) || null;
  const confirmItem = data.find(d => d.id === confirmId) || null;

  const openEdit = (item, initialVals) => { setEditItem(item); setEditVals(initialVals || { ...item }); };
  const closeEdit = () => setEditItem(null);
  const onChange = (k, v) => setEditVals(p => ({ ...p, [k]: v }));
  const saveEdit = (successMsg) => {
    setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...editVals } : d));
    showToast("success", "💾", successMsg || `${editVals[Object.keys(editVals)[0]]} modifié`);
    setEditItem(null);
  };
  const openConfirm = (id) => setConfirmId(id);
  const closeConfirm = () => setConfirmId(null);
  const confirmDelete = () => {
    const name = labelFn ? labelFn(confirmItem) : confirmItem?.[Object.keys(confirmItem)[1]];
    setData(prev => prev.filter(d => d.id !== confirmId));
    showToast("danger", "🗑️", `${name} supprimé`);
    setSelected(null); setConfirmId(null);
  };
  const updateField = (id, field, value, toastMsg) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    if (toastMsg) showToast("success", "✅", toastMsg);
  };

  return {
    selected, setSelected, sel,
    editItem, editVals, onChange, openEdit, closeEdit, saveEdit,
    confirmId, confirmItem, openConfirm, closeConfirm, confirmDelete,
    updateField,
  };
}
