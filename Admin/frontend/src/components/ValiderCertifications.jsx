import { useState } from "react";
import "./ValiderCertifications.css";

const INITIAL_DATA = [
  { cert: "AB Bio",    fournisseur: "Ferme Azul",  statut: "Attente", exp: "31/12/2026" },
  { cert: "ISO 9001",  fournisseur: "Bio Sahara",  statut: "Attente", exp: "30/06/2027" },
  { cert: "Fairtrade", fournisseur: "Coop. Nour",  statut: "Valide",  exp: "31/12/2027" },
  { cert: "HACCP",     fournisseur: "TechGamma",   statut: "Expiré",  exp: "01/01/2025" },
];

const BADGE_TYPE = { Attente: "warn", Valide: "ok", Expiré: "err" };

function Badge({ type, children }) {
  return <span className={`badge badge--${type}`}>{children}</span>;
}
function Toast({ toast }) {
  if (!toast) return null;
  return <div className="toast" style={{ background: toast.color }}>{toast.msg}</div>;
}

export default function ValiderCertifications() {
  const [data, setData]         = useState(INITIAL_DATA);
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState(null);
  const [filterType, setFilterType] = useState("Tous");
  const [filterSt, setFilterSt]     = useState("Tous");

  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = data.filter((r) =>
    (filterType === "Tous" || r.cert === filterType) &&
    (filterSt   === "Tous" || r.statut === filterSt)
  );

  const doApprove = (ri) => {
    const cert = filtered[ri].cert;
    const fn   = filtered[ri].fournisseur;
    setData((p) => p.map((r) => (r.cert === cert && r.fournisseur === fn ? { ...r, statut: "Valide" } : r)));
    showToast(`✔ ${cert} — ${fn} validé`, "#16a34a");
  };

  const doReject = (ri) => {
    const cert = filtered[ri].cert;
    const fn   = filtered[ri].fournisseur;
    setData((p) => p.map((r) => (r.cert === cert && r.fournisseur === fn ? { ...r, statut: "Expiré" } : r)));
    showToast(`✖ ${cert} — ${fn} rejeté`, "#dc2626");
  };

  const doDelete = (ri) => {
    const cert = filtered[ri].cert;
    const fn   = filtered[ri].fournisseur;
    setData((p) => p.filter((r) => !(r.cert === cert && r.fournisseur === fn)));
    showToast(`🗑 Certification supprimée`, "#dc2626");
  };

  return (
    <div className="vc-page">
      <Toast toast={toast} />

      {/* Filter card */}
      <div className="card">
        <div className="card-title"><span className="card-title-bar" />Filtres</div>
        <div className="row">
          <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {["Tous", "AB Bio", "ISO 9001", "Fairtrade", "HACCP"].map((o) => <option key={o}>{o}</option>)}
          </select>
          <select className="form-select" value={filterSt} onChange={(e) => setFilterSt(e.target.value)}>
            {["Tous", "Attente", "Valide", "Expiré"].map((o) => <option key={o}>{o}</option>)}
          </select>
          <button className="btn" onClick={() => { setFilterType("Tous"); setFilterSt("Tous"); }}>
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Stats + Table card */}
      <div className="card">
        <div className="card-title"><span className="card-title-bar" />Liste des certifications</div>

        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-num" style={{ color: "#a16207" }}>
              {data.filter((r) => r.statut === "Attente").length}
            </div>
            <div className="stat-lbl">À traiter</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{data.filter((r) => r.statut === "Valide").length}</div>
            <div className="stat-lbl">Validées</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ color: "#dc2626" }}>
              {data.filter((r) => r.statut === "Expiré").length}
            </div>
            <div className="stat-lbl">Expirées</div>
          </div>
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <div className="table-hcell vc-col-cert">Certification</div>
            <div className="table-hcell">Fournisseur</div>
            <div className="table-hcell">Statut</div>
            <div className="table-hcell">Expiration</div>
            <div className="table-hcell table-hcell--actions">Actions</div>
          </div>

          {filtered.length === 0 && (
            <div className="vc-empty">Aucune certification trouvée</div>
          )}

          {filtered.map((r, ri) => (
            <div
              key={ri}
              className={`table-row ${selected === ri ? "table-row--selected" : ""}`}
              onClick={() => setSelected(ri)}
            >
              <div className="table-cell vc-col-cert vc-cell-bold">{r.cert}</div>
              <div className="table-cell">{r.fournisseur}</div>
              <div className="table-cell">
                <Badge type={BADGE_TYPE[r.statut] || "info"}>{r.statut}</Badge>
              </div>
              <div className={`table-cell ${r.statut === "Expiré" ? "vc-expired-date" : ""}`}>{r.exp}</div>
              <div className="table-cell table-cell--actions">
                <button className="btn btn--primary btn--small" onClick={(e) => { e.stopPropagation(); doApprove(ri); }}>✔</button>
                <button className="btn btn--danger btn--small"  onClick={(e) => { e.stopPropagation(); doReject(ri); }}>✖</button>
                <button className="btn btn--danger btn--small"  onClick={(e) => { e.stopPropagation(); doDelete(ri); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        <div className="info-bar mt-8">{filtered.length} certification(s) affichée(s)</div>
      </div>
    </div>
  );
}