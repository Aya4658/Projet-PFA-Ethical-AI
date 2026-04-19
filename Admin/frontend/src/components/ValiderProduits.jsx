import { useState } from "react";
import "./ValiderProduits.css";

const INITIAL_DATA = [
  { produit: "Tisane Sauvage Aurès",  fournisseur: "Herboristerie",      categorie: "Santé",       statut: "Attente"  },
  { produit: "Écharpe Laine Berbère", fournisseur: "Artisanes Ghardaïa", categorie: "Textile",     statut: "En revue" },
  { produit: "Savon Argan Naturel",   fournisseur: "Coop. Tafraout",     categorie: "Cosmétiques", statut: "Attente"  },
];

const BADGE_TYPE = { Attente: "warn", "En revue": "info", Validé: "ok", Refusé: "err" };

function Badge({ type, children }) {
  return <span className={`badge badge--${type}`}>{children}</span>;
}

function Toast({ toast }) {
  if (!toast) return null;
  return <div className="toast" style={{ background: toast.color }}>{toast.msg}</div>;
}

export default function ValiderProduits() {
  const [data, setData]         = useState(INITIAL_DATA);
  const [selected, setSelected] = useState(null);
  const [comment, setComment]   = useState("");
  const [checks, setChecks]     = useState([true, true, false]);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const doApprove = (ri) => {
    const p = data[ri].produit;
    setData((prev) => prev.map((r, i) => (i === ri ? { ...r, statut: "Validé" } : r)));
    showToast(`✔ "${p}" validé et publié`, "#16a34a");
    setSelected(null);
  };

  const doReject = (ri) => {
    const p = data[ri].produit;
    setData((prev) => prev.filter((_, i) => i !== ri));
    showToast(`✖ "${p}" refusé`, "#dc2626");
    setSelected(null);
  };

  const doAskCorrection = (ri) => {
    const p = data[ri].produit;
    setData((prev) => prev.map((r, i) => (i === ri ? { ...r, statut: "En revue" } : r)));
    showToast(`📝 Correction demandée pour "${p}"`, "#a16207");
    setSelected(null);
  };

  const toggleCheck = (i) =>
    setChecks((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const selectedItem = selected !== null ? data[selected] : null;

  return (
    <div className="vp-page">
      <Toast toast={toast} />

      {/* ── Table card ── */}
      <div className="card">
        <div className="card-title">
          <span className="card-title-bar" />
          Produits en attente de validation
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <div className="table-hcell vp-col-produit">Produit</div>
            <div className="table-hcell">Fournisseur</div>
            <div className="table-hcell">Catégorie</div>
            <div className="table-hcell">Statut</div>
            <div className="table-hcell table-hcell--actions">Actions</div>
          </div>

          {data.length === 0 && (
            <div className="vp-empty">Aucun produit en attente ✅</div>
          )}

          {data.map((r, ri) => (
            <div
              key={ri}
              className={`table-row ${selected === ri ? "table-row--selected" : ""}`}
              onClick={() => setSelected(ri)}
            >
              <div className="table-cell vp-col-produit vp-cell-bold">{r.produit}</div>
              <div className="table-cell">{r.fournisseur}</div>
              <div className="table-cell">{r.categorie}</div>
              <div className="table-cell">
                <Badge type={BADGE_TYPE[r.statut] || "info"}>{r.statut}</Badge>
              </div>
              <div className="table-cell table-cell--actions">
                <button className="btn btn--primary btn--small" onClick={(e) => { e.stopPropagation(); doApprove(ri); }}>✔ Valider</button>
                <button className="btn btn--danger btn--small"  onClick={(e) => { e.stopPropagation(); doReject(ri); }}>✖ Refuser</button>
              </div>
            </div>
          ))}
        </div>

        <div className="info-bar mt-8">{data.length} produit(s) en attente</div>
      </div>

      {/* ── Decision card ── */}
      <div className="card">
        <div className="card-title">
          <span className="card-title-bar" />
          Décision de validation
          {selectedItem && (
            <span className="vp-selected-label">— {selectedItem.produit}</span>
          )}
        </div>

        {!selectedItem && (
          <p className="vp-hint">👆 Cliquez sur un produit pour sélectionner</p>
        )}

        {selectedItem && (
          <>
            {/* Info row */}
            <div className="vp-info-row">
              <div className="vp-info-item">
                <span className="vp-info-lbl">Produit</span>
                <span className="vp-info-val">{selectedItem.produit}</span>
              </div>
              <div className="vp-info-item">
                <span className="vp-info-lbl">Fournisseur</span>
                <span className="vp-info-val">{selectedItem.fournisseur}</span>
              </div>
              <div className="vp-info-item">
                <span className="vp-info-lbl">Catégorie</span>
                <span className="vp-info-val">{selectedItem.categorie}</span>
              </div>
              <div className="vp-info-item">
                <span className="vp-info-lbl">Statut actuel</span>
                <Badge type={BADGE_TYPE[selectedItem.statut] || "info"}>{selectedItem.statut}</Badge>
              </div>
            </div>

            {/* Checklist */}
            <div className="vp-checks">
              {["Informations correctes", "Labels vérifiés", "Blockchain enregistrée"].map(
                (item, i) => (
                  <label key={i} className="check-row">
                    <input
                      type="checkbox"
                      checked={checks[i]}
                      onChange={() => toggleCheck(i)}
                      style={{ accentColor: "#16a34a" }}
                    />
                    {item}
                  </label>
                )
              )}
            </div>

            {/* Comment */}
            <div className="field-row">
              <label className="field-label">Commentaire / motif de refus</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Justification (optionnelle)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="flex-gap">
              <button
                className="btn btn--primary"
                onClick={() => doApprove(data.indexOf(selectedItem))}
              >
                ✔ Valider
              </button>
              <button
                className="btn btn--danger"
                onClick={() => doReject(data.indexOf(selectedItem))}
              >
                ✖ Refuser
              </button>
              <button
                className="btn"
                onClick={() => doAskCorrection(data.indexOf(selectedItem))}
              >
                📝 Demander correction
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}