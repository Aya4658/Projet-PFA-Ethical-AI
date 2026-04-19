import { useState } from "react";
import "./GererFournisseurs.css";

const INIT_DATA = [
  { id: 1, nom: "Ferme Azul",       region: "Béjaïa",   type: "Alimentation", statut: "Actif",    date: "01/03/2026" },
  { id: 2, nom: "Coopérative Nour", region: "Tlemcen",  type: "Artisanat",    statut: "Attente",  date: "14/04/2026" },
  { id: 3, nom: "Bio Sahara SARL",  region: "Ghardaïa", type: "Alimentation", statut: "Attente",  date: "15/04/2026" },
  { id: 4, nom: "TechGamma",        region: "Alger",     type: "Électronique", statut: "Suspendu", date: "10/02/2026" },
];

function badgeClass(statut) {
  if (statut === "Actif")    return "badge badge-ok";
  if (statut === "Suspendu") return "badge badge-err";
  if (statut === "Attente")  return "badge badge-warn";
  return "badge badge-info";
}

export default function GererFournisseurs({ toast }) {
  const [data, setData]         = useState(INIT_DATA);
  const [sel, setSel]           = useState(null);
  const [filtre, setFiltre]     = useState("Tous");
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ nom: "", region: "", type: "Alimentation" });

  const filtered = data.filter(f =>
    (filtre === "Tous" || f.statut === filtre) &&
    f.nom.toLowerCase().includes(search.toLowerCase())
  );

  const approuver = () => {
    if (!sel) return;
    setData(d => d.map(f => f.id === sel.id ? { ...f, statut: "Actif" } : f));
    setSel(s => ({ ...s, statut: "Actif" }));
    toast("Fournisseur approuvé !");
  };

  const suspendre = () => {
    if (!sel) return;
    setData(d => d.map(f => f.id === sel.id ? { ...f, statut: "Suspendu" } : f));
    setSel(s => ({ ...s, statut: "Suspendu" }));
    toast("Fournisseur suspendu.");
  };

  const supprimer = (id) => {
    setData(d => d.filter(f => f.id !== id));
    if (sel?.id === id) setSel(null);
    toast("Fournisseur supprimé.");
  };

  const ajouter = () => {
    if (!form.nom.trim()) return;
    const newF = {
      id: Date.now(),
      nom: form.nom,
      region: form.region || "—",
      type: form.type,
      statut: "Attente",
      date: new Date().toLocaleDateString("fr-FR"),
    };
    setData(d => [...d, newF]);
    setForm({ nom: "", region: "", type: "Alimentation" });
    setShowModal(false);
    toast("Fournisseur ajouté !");
  };

  return (
    <div className="gf-page">
      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Nouveau fournisseur</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <input className="input" placeholder="Nom *" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
              <input className="input" placeholder="Région" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
              <select className="select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Alimentation</option><option>Artisanat</option>
                <option>Électronique</option><option>Cosmétiques</option><option>Textile</option>
              </select>
              <div className="action-row" style={{ marginTop: 8 }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={ajouter}>Confirmer</button>
                <button className="btn btn-default" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="groupbox">
        <span className="groupbox-title">Rechercher</span>
        <div className="row">
          <input className="input input-grow" placeholder="Nom fournisseur…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="select" value={filtre} onChange={e => setFiltre(e.target.value)}>
            <option>Tous</option><option>Actif</option><option>Suspendu</option><option>Attente</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Ajouter</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="groupbox">
        <span className="groupbox-title">Liste fournisseurs</span>
        <div className="stat-grid-3">
          <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>{data.length}</div><div className="stat-label">Total</div></div>
          <div className="stat-box"><div className="stat-value" style={{ color: "#fbbf24" }}>{data.filter(f => f.statut === "Attente").length}</div><div className="stat-label">En attente</div></div>
          <div className="stat-box"><div className="stat-value" style={{ color: "#f87171" }}>{data.filter(f => f.statut === "Suspendu").length}</div><div className="stat-label">Suspendus</div></div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Fournisseur</th><th>Région</th><th>Type</th><th>Statut</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="table-empty">Aucun fournisseur</td></tr>}
              {filtered.map(f => (
                <tr key={f.id} className={sel?.id === f.id ? "selected" : ""} onClick={() => setSel(f)}>
                  <td style={{ fontWeight: sel?.id === f.id ? 700 : 400, color: sel?.id === f.id ? "#4ade80" : "#fff" }}>{f.nom}</td>
                  <td>{f.region}</td>
                  <td>{f.type}</td>
                  <td><span className={badgeClass(f.statut)}>{f.statut}</span></td>
                  <td>{f.date}</td>
                  <td><span className="td-del" onClick={e => { e.stopPropagation(); supprimer(f.id); }}>✕</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sel && (
          <div className="selection-info">
            Sélectionné : <strong>{sel.nom}</strong> — {sel.statut}
          </div>
        )}

        <div className="action-row">
          <button className="btn btn-success" onClick={approuver}>✓ Approuver</button>
          <button className="btn btn-warning" onClick={suspendre}>⊘ Suspendre</button>
          <button className="btn btn-danger"  onClick={() => sel && supprimer(sel.id)}>✕ Supprimer</button>
        </div>
        {!sel && <p className="hint">↑ Cliquez sur une ligne pour sélectionner</p>}
      </div>
    </div>
  );
}
