import { useState } from "react";

const labelMap = { actif: "Actif", attente: "Attente", suspendu: "Suspendu" };
const statusClass = { actif: "badge-actif", attente: "badge-attente", suspendu: "badge-suspendu" };

const Btn = ({ children, variant = "default", ...props }) => (
  <button className={`button button-${variant}`} {...props}>{children}</button>
);

const Input = ({ value, onChange, placeholder }) => (
  <input className="input" value={value} onChange={onChange} placeholder={placeholder} />
);

const Select = ({ value, onChange, options }) => (
  <select className="select" value={value} onChange={onChange}>
    {options.map((option, index) => (
      <option key={index} value={option.value || option}>{option.label || option}</option>
    ))}
  </select>
);

const Table = ({ headers, rows, selected, onSelect }) => (
  <div className="table-wrapper" style={{ "--table-columns": headers.map(h => h.flex || "1fr").join(" ") }}>
    <div className="table-header">
      {headers.map((header, index) => (
        <div key={index} className="table-header-cell">{header.label}</div>
      ))}
    </div>
    {rows.map((row, rowIndex) => (
      <div key={rowIndex} className={`table-row${selected === rowIndex ? " selected" : ""}`} onClick={() => onSelect && onSelect(rowIndex)}>
        {row.map((cell, cellIndex) => (
          <div key={cellIndex} className="table-cell">{cell}</div>
        ))}
      </div>
    ))}
  </div>
);

export default function ComptesFournisseur({ onToast }) {
  const initial = [
    { nom: "Société Alpha", statut: "actif", date: "01/03/2026" },
    { nom: "MediaBeta", statut: "attente", date: "10/04/2026" },
    { nom: "TechGamma", statut: "suspendu", date: "15/02/2026" },
    { nom: "EcoVerde SARL", statut: "actif", date: "20/01/2026" },
    { nom: "NaturaBio", statut: "attente", date: "05/04/2026" },
  ];
  const [rows, setRows] = useState(initial);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");

  const filtered = rows.filter((row) =>
    row.nom.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatut === "Tous" || row.statut === filterStatut.toLowerCase())
  );

  const act = (action) => {
    if (!filtered[selectedIndex]) return;
    const nom = filtered[selectedIndex].nom;
    if (action === "approuver") {
      setRows(rows.map((row) => row.nom === nom ? { ...row, statut: "actif" } : row));
      onToast(`Approuvé : ${nom}`);
    } else if (action === "suspendre") {
      setRows(rows.map((row) => row.nom === nom ? { ...row, statut: "suspendu" } : row));
      onToast(`Suspendu : ${nom}`);
    } else if (action === "supprimer") {
      setRows(rows.filter((row) => row.nom !== nom));
      setSelectedIndex(0);
      onToast(`Supprimé : ${nom}`);
    }
  };

  return (
    <div className="page page-comptes">
      <div className="section-title">
        <span className="section-icon">🏭</span>
        <h2>Comptes fournisseurs</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{rows.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rows.filter((row) => row.statut === "attente").length}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rows.filter((row) => row.statut === "suspendu").length}</div>
          <div className="stat-label">Suspendus</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-title">Rechercher fournisseur</div>
        <div className="form-row">
          <Input placeholder="Nom du fournisseur…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} options={["Tous", "Actif", "Attente", "Suspendu"]} />
          <Btn variant="primary" onClick={() => {}}>Rechercher</Btn>
        </div>
      </div>
      <div className="panel">
        <div className="panel-title">Liste fournisseurs</div>
        <Table
          headers={[{ label: "Nom", flex: "2fr" }, { label: "Statut" }, { label: "Date inscription" }]}
          rows={filtered.map((row) => [
            <span style={{ fontWeight: 600 }}>{row.nom}</span>,
            <span className={`badge ${statusClass[row.statut]}`}>{labelMap[row.statut]}</span>,
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{row.date}</span>,
          ])}
          selected={selectedIndex}
          onSelect={setSelectedIndex}
        />
        {filtered[selectedIndex] && (
          <div className="panel" style={{ marginTop: 0 }}>
            Sélection : <strong>{filtered[selectedIndex].nom}</strong>
          </div>
        )}
        <div className="button-row">
          <Btn variant="primary" onClick={() => act("approuver")}>✓ Approuver</Btn>
          <Btn variant="warn" onClick={() => act("suspendre")}>⏸ Suspendre</Btn>
          <Btn variant="danger" onClick={() => act("supprimer")}>✕ Supprimer</Btn>
          <Btn onClick={() => {}}>✎ Modifier</Btn>
        </div>
      </div>
    </div>
  );
}
