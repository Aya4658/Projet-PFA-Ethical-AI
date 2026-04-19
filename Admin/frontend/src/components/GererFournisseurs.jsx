import { useState } from "react";
import "./GererFournisseurs.css";

const INITIAL_DATA = [
  { nom: "Ferme Azul",       region: "Béjaïa",   type: "Alimentation", statut: "Actif",    date: "01/03/2026" },
  { nom: "Coopérative Nour", region: "Tlemcen",  type: "Artisanat",    statut: "Attente",  date: "14/04/2026" },
  { nom: "Bio Sahara SARL",  region: "Ghardaïa", type: "Alimentation", statut: "Attente",  date: "15/04/2026" },
  { nom: "TechGamma",        region: "Alger",    type: "Électronique", statut: "Suspendu", date: "10/02/2026" },
];

const TYPES    = ["Alimentation", "Artisanat", "Cosmétiques", "Textile", "Électronique"];
const STATUTS  = ["Actif", "Attente", "Suspendu"];
const BADGE_TYPE = { Actif: "ok", Attente: "warn", Suspendu: "err" };

// ── Shared mini-components ────────────────────────────────────────────────────
function Badge({ type, children }) {
  return <span className={`badge badge--${type}`}>{children}</span>;
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast" style={{ background: toast.color }}>
      {toast.msg}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function GererFournisseurs() {
  const [data, setData]         = useState(INITIAL_DATA);
  const [search, setSearch]     = useState("");
  const [filterSt, setFilterSt] = useState("Tous");
  const [modal, setModal]       = useState(null); // "edit" | "add" | null
  const [editIdx, setEditIdx]   = useState(null);
  const [form, setForm]         = useState({});
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = data.filter(
    (r) =>
      r.nom.toLowerCase().includes(search.toLowerCase()) &&
      (filterSt === "Tous" || r.statut === filterSt)
  );

  // CRUD handlers
  const openEdit = (ri) => {
    setEditIdx(ri);
    setForm({ ...filtered[ri] });
    setModal("edit");
  };

  const openAdd = () => {
    setForm({ nom: "", region: "", type: "Alimentation", statut: "Attente", date: new Date().toLocaleDateString("fr-FR") });
    setModal("add");
  };

  const doApprove = (ri) => {
    const nom = filtered[ri].nom;
    setData((p) => p.map((r) => (r.nom === nom ? { ...r, statut: "Actif" } : r)));
    showToast(`✔ ${nom} approuvé`, "#16a34a");
  };

  const doBlock = (ri) => {
    const nom = filtered[ri].nom;
    setData((p) => p.map((r) => (r.nom === nom ? { ...r, statut: "Suspendu" } : r)));
    showToast(`🔒 ${nom} suspendu`, "#dc2626");
  };

  const doDelete = (ri) => {
    const nom = filtered[ri].nom;
    setData((p) => p.filter((r) => r.nom !== nom));
    showToast(`🗑 ${nom} supprimé`, "#dc2626");
  };

  const saveEdit = () => {
    const old = filtered[editIdx].nom;
    setData((p) => p.map((r) => (r.nom === old ? { ...form } : r)));
    setModal(null);
    showToast("✔ Modifications enregistrées", "#16a34a");
  };

  const saveAdd = () => {
    if (!form.nom.trim()) return;
    setData((p) => [...p, { ...form }]);
    setModal(null);
    showToast(`✔ ${form.nom} ajouté`, "#16a34a");
  };

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="gf-page">
      <Toast toast={toast} />

      {/* ── Search card ── */}
      <div className="card">
        <div className="card-title">
          <span className="card-title-bar" />
          Rechercher un fournisseur
        </div>
        <div className="row">
          <input
            className="form-input flex-1"
            placeholder="Nom du fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            value={filterSt}
            onChange={(e) => setFilterSt(e.target.value)}
          >
            {["Tous", ...STATUTS].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <button className="btn btn--primary" onClick={openAdd}>
            + Ajouter
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="card">
        <div className="card-title">
          <span className="card-title-bar" />
          Liste des fournisseurs
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-num">{data.length}</div>
            <div className="stat-lbl">Total</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ color: "#a16207" }}>
              {data.filter((r) => r.statut === "Attente").length}
            </div>
            <div className="stat-lbl">En attente</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ color: "#dc2626" }}>
              {data.filter((r) => r.statut === "Suspendu").length}
            </div>
            <div className="stat-lbl">Suspendus</div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <div className="table-header">
            <div className="table-hcell gf-col-nom">Fournisseur</div>
            <div className="table-hcell">Région</div>
            <div className="table-hcell">Type</div>
            <div className="table-hcell">Statut</div>
            <div className="table-hcell">Date</div>
            <div className="table-hcell table-hcell--actions">Actions</div>
          </div>

          {filtered.length === 0 && (
            <div className="gf-empty">Aucun fournisseur trouvé</div>
          )}

          {filtered.map((r, ri) => (
            <div
              key={ri}
              className={`table-row ${selected === ri ? "table-row--selected" : ""}`}
              onClick={() => setSelected(ri)}
            >
              <div className="table-cell gf-col-nom gf-cell-bold">{r.nom}</div>
              <div className="table-cell">{r.region}</div>
              <div className="table-cell">{r.type}</div>
              <div className="table-cell">
                <Badge type={BADGE_TYPE[r.statut] || "info"}>{r.statut}</Badge>
              </div>
              <div className="table-cell">{r.date}</div>
              <div className="table-cell table-cell--actions">
                <button className="btn btn--small" onClick={(e) => { e.stopPropagation(); openEdit(ri); }}>✏️</button>
                <button className="btn btn--primary btn--small" onClick={(e) => { e.stopPropagation(); doApprove(ri); }}>✔</button>
                <button className="btn btn--danger btn--small" onClick={(e) => { e.stopPropagation(); doBlock(ri); }}>🔒</button>
                <button className="btn btn--danger btn--small" onClick={(e) => { e.stopPropagation(); doDelete(ri); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        <div className="info-bar mt-8">
          {filtered.length} fournisseur(s) affiché(s)
          {selected !== null && filtered[selected] ? ` · Sélection : ${filtered[selected].nom}` : ""}
        </div>
      </div>

      {/* ── Modal Edit ── */}
      {modal === "edit" && (
        <Modal title="Modifier le fournisseur" onClose={() => setModal(null)}>
          <div className="field-row">
            <label className="field-label">Nom</label>
            <input className="form-input w-full" value={form.nom} onChange={(e) => setField("nom", e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Région</label>
            <input className="form-input w-full" value={form.region} onChange={(e) => setField("region", e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Type</label>
            <select className="form-select w-full" value={form.type} onChange={(e) => setField("type", e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Statut</label>
            <select className="form-select w-full" value={form.statut} onChange={(e) => setField("statut", e.target.value)}>
              {STATUTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setModal(null)}>Annuler</button>
            <button className="btn btn--primary" onClick={saveEdit}>Enregistrer</button>
          </div>
        </Modal>
      )}

      {/* ── Modal Add ── */}
      {modal === "add" && (
        <Modal title="Ajouter un fournisseur" onClose={() => setModal(null)}>
          <div className="field-row">
            <label className="field-label">Nom *</label>
            <input className="form-input w-full" placeholder="Nom du fournisseur" value={form.nom} onChange={(e) => setField("nom", e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Région</label>
            <input className="form-input w-full" placeholder="ex: Béjaïa" value={form.region} onChange={(e) => setField("region", e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Type</label>
            <select className="form-select w-full" value={form.type} onChange={(e) => setField("type", e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setModal(null)}>Annuler</button>
            <button className="btn btn--primary" onClick={saveAdd}>Ajouter</button>
          </div>
        </Modal>
      )}
    </div>
  );
}