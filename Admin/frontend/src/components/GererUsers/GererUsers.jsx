import { useState } from "react";
import "./GererUsers.css";

const INIT_DATA = [
  { id: 1, nom: "Leila Mansouri", email: "leila@mail.dz",  commandes: 24, avis: 12, statut: "Actif"   },
  { id: 2, nom: "Karim Benali",   email: "karim@mail.dz",  commandes: 7,  avis: 3,  statut: "Actif"   },
  { id: 3, nom: "Amira Saadi",    email: "amira@mail.dz",  commandes: 0,  avis: 0,  statut: "Inactif" },
];

function badgeClass(statut) {
  if (statut === "Actif")   return "badge badge-ok";
  if (statut === "Bloqué")  return "badge badge-err";
  if (statut === "Inactif") return "badge badge-warn";
  return "badge badge-info";
}

export default function GererUsers({ toast }) {
  const [data, setData]         = useState(INIT_DATA);
  const [sel, setSel]           = useState(null);
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ nom: "", email: "" });

  const filtered = data.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const bloquer = () => {
    if (!sel) return;
    const next = sel.statut === "Bloqué" ? "Actif" : "Bloqué";
    setData(d => d.map(u => u.id === sel.id ? { ...u, statut: next } : u));
    setSel(s => ({ ...s, statut: next }));
    toast(next === "Bloqué" ? "Utilisateur bloqué." : "Utilisateur débloqué !");
  };

  const supprimer = (id) => {
    setData(d => d.filter(u => u.id !== id));
    if (sel?.id === id) setSel(null);
    toast("Utilisateur supprimé.");
  };

  const ajouter = () => {
    if (!form.nom.trim()) return;
    setData(d => [...d, { id: Date.now(), nom: form.nom, email: form.email || "—", commandes: 0, avis: 0, statut: "Actif" }]);
    setForm({ nom: "", email: "" });
    setShowModal(false);
    toast("Utilisateur ajouté !");
  };

  return (
    <div className="gu-page">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Ajouter un utilisateur</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <input className="input" placeholder="Nom complet *" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
              <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <div className="action-row" style={{ marginTop: 8 }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={ajouter}>Ajouter</button>
                <button className="btn btn-default" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="groupbox">
        <span className="groupbox-title">Rechercher</span>
        <div className="row">
          <input className="input input-grow" placeholder="Nom ou email…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Ajouter</button>
        </div>
      </div>

      <div className="groupbox">
        <span className="groupbox-title">Liste utilisateurs</span>
        <div className="stat-grid-3">
          <div className="stat-box"><div className="stat-value" style={{ color: "#4ade80" }}>{data.length}</div><div className="stat-label">Total</div></div>
          <div className="stat-box"><div className="stat-value" style={{ color: "#f87171" }}>{data.filter(u => u.statut === "Bloqué").length}</div><div className="stat-label">Bloqués</div></div>
          <div className="stat-box"><div className="stat-value" style={{ color: "#fbbf24" }}>{data.filter(u => u.statut === "Inactif").length}</div><div className="stat-label">Inactifs</div></div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Utilisateur</th><th>Email</th><th>Commandes</th><th>Avis</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="table-empty">Aucun utilisateur</td></tr>}
              {filtered.map(u => (
                <tr key={u.id} className={sel?.id === u.id ? "selected" : ""} onClick={() => setSel(u)}>
                  <td style={{ fontWeight: sel?.id === u.id ? 700 : 400, color: sel?.id === u.id ? "#4ade80" : "#fff" }}>{u.nom}</td>
                  <td>{u.email}</td>
                  <td>{u.commandes}</td>
                  <td>{u.avis}</td>
                  <td><span className={badgeClass(u.statut)}>{u.statut}</span></td>
                  <td><span className="td-del" onClick={e => { e.stopPropagation(); supprimer(u.id); }}>✕</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sel && <div className="selection-info">Sélectionné : <strong>{sel.nom}</strong> — {sel.statut}</div>}

        <div className="action-row">
          <button className="btn btn-warning" onClick={bloquer}>
            {sel?.statut === "Bloqué" ? "⊘ Débloquer" : "⊘ Bloquer"}
          </button>
          <button className="btn btn-danger" onClick={() => sel && supprimer(sel.id)}>✕ Supprimer</button>
        </div>
        {!sel && <p className="hint">↑ Cliquez sur une ligne pour sélectionner</p>}
      </div>
    </div>
  );
}
