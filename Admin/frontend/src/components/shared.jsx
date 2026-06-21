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
export function ProfileModal({ onClose, adminInfo, onProfileUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    prenom:     adminInfo?.prenom     || '',
    nom:        adminInfo?.nom        || '',
    telephone:  adminInfo?.telephone  || '',
    departement:adminInfo?.departement|| '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const token = localStorage.getItem("adminToken");

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function initiales() {
    const p = adminInfo?.prenom?.[0] || '';
    const n = adminInfo?.nom?.[0]    || '';
    if (p || n) return (p + n).toUpperCase();
    return (adminInfo?.email?.[0] || 'A').toUpperCase();
  }

  function fullName() {
    const p = adminInfo?.prenom || '';
    const n = adminInfo?.nom    || '';
    if (p || n) return `${p} ${n}`.trim();
    return adminInfo?.email || 'Admin';
  }

  function shortId(id) {
    if (!id) return '—';
    return 'ADM-' + String(id).slice(-6).toUpperCase();
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: 'success', text: 'Profil mis à jour !' });
      setEditing(false);
      if (onProfileUpdated) onProfileUpdated(data);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header green">
          <h2>👤 Mon Profil Administrateur</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="profile-avatar-big">{initiales()}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{fullName()}</div>
            <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, marginTop: 3 }}>
              {adminInfo?.role || 'Super Administrateur'}
            </div>
            <Badge s="Actif" />
          </div>
          <div className="divider" />

          {!editing ? (
            <>
              <div className="profile-grid">
                {[
                  { label: "ID Admin",           value: shortId(adminInfo?._id) },
                  { label: "Département",        value: adminInfo?.departement || '—' },
                  { label: "Email",              value: adminInfo?.email || '—' },
                  { label: "Téléphone",          value: adminInfo?.telephone || '—' },
                  { label: "Date de création",   value: formatDate(adminInfo?.createdAt) },
                  { label: "Dernière connexion", value: formatDate(adminInfo?.lastLogin) },
                ].map(f => (
                  <div className="profile-field" key={f.label}>
                    <span className="profile-field-label">{f.label}</span>
                    <span className="profile-field-value">{f.value}</span>
                  </div>
                ))}
              </div>
              {msg && (
                <div className={`login-msg ${msg.type}`} style={{ marginTop: 8 }}>{msg.text}</div>
              )}
              <div className="divider" />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
                <button className="btn btn-primary" onClick={() => { setEditing(true); setMsg(null); }}>✏️ Modifier profil</button>
              </div>
            </>
          ) : (
            <>
              <div className="edit-grid">
                {[
                  { key: 'prenom',      label: 'Prénom' },
                  { key: 'nom',         label: 'Nom' },
                  { key: 'telephone',   label: 'Téléphone' },
                  { key: 'departement', label: 'Département' },
                ].map(f => (
                  <div className="edit-field" key={f.key}>
                    <label>{f.label}</label>
                    <input
                      type="text"
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              {msg && (
                <div className={`login-msg ${msg.type}`} style={{ marginTop: 8 }}>{msg.text}</div>
              )}
              <div className="divider" />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => { setEditing(false); setMsg(null); }}>Annuler</button>
                <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                  {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
                </button>
              </div>
            </>
          )}
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
