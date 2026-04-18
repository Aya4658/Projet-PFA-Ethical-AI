import { useState } from "react";

const labelMap = { attente: "Attente", valide: "Valide", expire: "Expiré" };
const statusClass = { attente: "badge-attente", valide: "badge-actif", expire: "badge-expire" };

const Btn = ({ children, variant = "default", ...props }) => (
  <button className={`button button-${variant}`} {...props}>{children}</button>
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

export default function Certifications({ onToast }) {
  const initial = [
    { cert: "ISO 9001", fournisseur: "Sté Alpha", statut: "attente", expiry: "2027-01" },
    { cert: "CE Marquage", fournisseur: "MediaBeta", statut: "expire", expiry: "2024-12" },
    { cert: "HACCP", fournisseur: "TechGamma", statut: "valide", expiry: "2028-06" },
    { cert: "ISO 14001", fournisseur: "EcoVerde", statut: "attente", expiry: "2026-09" },
    { cert: "Fair Trade", fournisseur: "NaturaBio", statut: "valide", expiry: "2027-03" },
  ];
  const [rows, setRows] = useState(initial);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterType, setFilterType] = useState("Tous");
  const [filterStatut, setFilterStatut] = useState("Tous");

  const filtered = rows.filter(
    (row) =>
      (filterType === "Tous" || row.cert === filterType) &&
      (filterStatut === "Tous" || row.statut === filterStatut.toLowerCase())
  );

  const act = (action) => {
    if (!filtered[selectedIndex]) return;
    const cert = filtered[selectedIndex].cert;
    if (action === "valider") {
      setRows(rows.map((row) => row.cert === cert ? { ...row, statut: "valide" } : row));
      onToast(`Certification validée : ${cert}`);
    } else if (action === "rejeter") {
      setRows(rows.map((row) => row.cert === cert ? { ...row, statut: "expire" } : row));
      onToast(`Certification rejetée : ${cert}`);
    } else if (action === "supprimer") {
      setRows(rows.filter((row) => row.cert !== cert));
      setSelectedIndex(0);
      onToast(`Supprimée : ${cert}`);
    }
  };

  return (
    <div className="page page-certifications">
      <div className="section-title">
        <span className="section-icon">🏅</span>
        <h2>Certifications</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{rows.filter((row) => row.statut === "attente").length}</div>
          <div className="stat-label">À traiter</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rows.filter((row) => row.statut === "valide").length}</div>
          <div className="stat-label">Validées</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{rows.filter((row) => row.statut === "expire").length}</div>
          <div className="stat-label">Expirées</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-title">Filtres</div>
        <div className="form-row">
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} options={["Tous", "ISO 9001", "CE Marquage", "HACCP", "ISO 14001", "Fair Trade"]} />
          <Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} options={["Tous", "Attente", "Valide", "Expire"]} />
          <Btn variant="primary" onClick={() => {}}>Filtrer</Btn>
        </div>
      </div>
      <div className="panel">
        <div className="panel-title">Liste certifications</div>
        <Table
          headers={[{ label: "Certification", flex: "2fr" }, { label: "Fournisseur" }, { label: "Expiration" }, { label: "Statut" }]}
          rows={filtered.map((row) => [
            <span style={{ fontWeight: 600 }}>{row.cert}</span>,
            <span style={{ color: "var(--muted)" }}>{row.fournisseur}</span>,
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{row.expiry}</span>,
            <span className={`badge ${statusClass[row.statut]}`}>{labelMap[row.statut]}</span>,
          ])}
          selected={selectedIndex}
          onSelect={setSelectedIndex}
        />
        <div className="button-row">
          <Btn variant="primary" onClick={() => act("valider")}>✓ Valider</Btn>
          <Btn variant="danger" onClick={() => act("rejeter")}>✕ Rejeter</Btn>
          <Btn onClick={() => {}}>✎ Modifier</Btn>
          <Btn variant="danger" onClick={() => act("supprimer")}>🗑 Supprimer</Btn>
        </div>
      </div>
    </div>
  );
}
