import { useState } from "react";
import "./ValiderCertifications.css";

const INIT_DATA = [
  { id: 1, cert: "AB Bio",    fournisseur: "Ferme Azul", statut: "Attente", expiration: "31/12/2026" },
  { id: 2, cert: "ISO 9001",  fournisseur: "Bio Sahara", statut: "Attente", expiration: "30/06/2027" },
  { id: 3, cert: "Fairtrade", fournisseur: "Coop. Nour", statut: "Valide",  expiration: "31/12/2027" },
  { id: 4, cert: "HACCP",     fournisseur: "TechGamma",  statut: "Expiré",  expiration: "01/01/2025" },
];

function badgeClass(statut) {
  if (statut === "Valide")  return "badge badge-ok";
  if (statut === "Attente") return "badge badge-warn";
  if (statut === "Expiré")  return "badge badge-err";
  return "badge badge-info";
}

export default function ValiderCertifications({ toast }) {
  const [data, setData]         = useState(INIT_DATA);
  const [sel, setSel]           = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ cert: "", fournisseur: "", expiration: "" });

  const valider = () => {
    if (!sel) return;
    setData(d => d.map(c => c.id === sel.id ? { ...c, statut: "Valide" } : c));
    setSel(s => ({ ...s, statut: "Valide" }));
    toast("Certification validée !");
  };

  const rejeter = () => {
    if (!sel) return;
    setData(d => d.filter(c => c.id !== sel.id));
    setSel(null);
    toast("Certification rejetée.");
  };

  const supprimer = (id) => {
    setData(d => d.filter(c => c.id !== id));
    if (sel?.id === id) setSel(null);
    toast("Certification supprimée.");
  };

  const ajouter = () => {
    if (!form.cert.trim()) return;
    setData(d => [...d, { id: Date.now(), cert: form.cert, fournisseur: form.fournisseur || "—", statut: "Attente", expiration: form.expiration || "—" }]);
    setForm({ cert: "", fournisseur: "", expiration: "" });
    setShowModal(false);
    toast("Certification ajoutée !");
  };

  return (
    <div className="vc-page">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Ajouter une certification</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <input className="input" placeholder="Type de certification *" value={form.cert} onChange={e => setForm({ ...form, cert: e.target.value })} />
              <input className="input" placeholder="Fournisseur" value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} />
              <input className="input" placeholder="Expiration (dd/mm/yyyy)" value={form.expiration} onChange={e => setForm({ ...form, expiration: e.target.value })} />
              <div className="action-row" style={{ marginTop: 8 }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={ajouter}>Ajouter</button>
                <button className="btn btn-default" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="stat-grid-3">
        <div className="stat-box"><div className="stat-value" style={{ color: "#fbbf24" }}>{data.filter(c => c.statut === "Attente").length}</div><div className="stat-label">À traiter</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>{data.filter(c => c.statut === "Valide").length}</div><div className="stat-label">Validées</div></div>
        <div className="stat-box"><div className="stat-value" style={{ color: "#f87171" }}>{data.filter(c => c.statut === "Expiré").length}</div><div className="stat-label">Expirées</div></div>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Liste certifications</span>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Certification</th><th>Fournisseur</th><th>Statut</th><th>Expiration</th><th></th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={5} className="table-empty">Aucune certification</td></tr>}
              {data.map(c => (
                <tr key={c.id} className={sel?.id === c.id ? "selected" : ""} onClick={() => setSel(c)}>
                  <td style={{ fontWeight: sel?.id === c.id ? 700 : 400, color: sel?.id === c.id ? "#4ade80" : "#fff" }}>{c.cert}</td>
                  <td>{c.fournisseur}</td>
                  <td><span className={badgeClass(c.statut)}>{c.statut}</span></td>
                  <td>{c.expiration}</td>
                  <td><span className="td-del" onClick={e => { e.stopPropagation(); supprimer(c.id); }}>✕</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sel && <div className="selection-info">Sélectionné : <strong>{sel.cert}</strong> — {sel.fournisseur}</div>}

        <div className="action-row">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Ajouter</button>
          <button className="btn btn-success" onClick={valider}>✓ Valider</button>
          <button className="btn btn-danger"  onClick={rejeter}>✕ Rejeter</button>
        </div>
        {!sel && <p className="hint">↑ Cliquez sur une ligne pour sélectionner</p>}
      </div>
    </div>
  );
}
