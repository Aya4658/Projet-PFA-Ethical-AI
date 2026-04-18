import { useState } from "react";

// ── Palette & shared styles ──────────────────────────────────────────────────
const C = {
  bg: "#0f1117",
  panel: "#161b27",
  card: "#1e2535",
  border: "#2a3350",
  accent: "#3ecf8e",
  accentDim: "#1a5c40",
  blue: "#4f8ef7",
  blueDim: "#1a2e5c",
  warn: "#f5a623",
  warnDim: "#3d2800",
  danger: "#f05252",
  dangerDim: "#3d1010",
  text: "#e8eaf0",
  muted: "#7a85a3",
  white: "#ffffff",
};

// ── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ type, children }) => {
  const map = {
    actif:    { bg: "#0d3328", color: C.accent,  border: C.accent  },
    attente:  { bg: C.warnDim, color: C.warn,    border: C.warn    },
    suspendu: { bg: C.dangerDim, color: C.danger, border: C.danger },
    valide:   { bg: "#0d3328", color: C.accent,  border: C.accent  },
    expire:   { bg: C.dangerDim, color: C.danger, border: C.danger },
    revue:    { bg: C.blueDim, color: C.blue,    border: C.blue    },
    ok:       { bg: "#0d3328", color: C.accent,  border: C.accent  },
    err:      { bg: C.dangerDim, color: C.danger, border: C.danger },
    warn:     { bg: C.warnDim, color: C.warn,    border: C.warn    },
    info:     { bg: C.blueDim, color: C.blue,    border: C.blue    },
  };
  const s = map[type] || map.info;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.04em", whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ num, label, color }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "12px 10px", textAlign: "center",
  }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || C.accent, fontFamily: "monospace" }}>{num}</div>
    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
  </div>
);

// ── Section Title ────────────────────────────────────────────────────────────
const SectionTitle = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
  </div>
);

// ── Panel ────────────────────────────────────────────────────────────────────
const Panel = ({ title, children }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "14px 16px", marginBottom: 14,
  }}>
    {title && <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>}
    {children}
  </div>
);

// ── Table ────────────────────────────────────────────────────────────────────
const Table = ({ headers, rows, selected, onSelect }) => (
  <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
    <div style={{ display: "grid", gridTemplateColumns: headers.map(h => h.flex || "1fr").join(" "), background: "#111827", borderBottom: `1px solid ${C.border}` }}>
      {headers.map((h, i) => (
        <div key={i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h.label}</div>
      ))}
    </div>
    {rows.map((row, ri) => (
      <div key={ri}
        onClick={() => onSelect && onSelect(ri)}
        style={{
          display: "grid", gridTemplateColumns: headers.map(h => h.flex || "1fr").join(" "),
          borderBottom: `1px solid ${C.border}`, cursor: "pointer",
          background: selected === ri ? "#1e3a5f" : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { if (selected !== ri) e.currentTarget.style.background = "#1a2235"; }}
        onMouseLeave={e => { if (selected !== ri) e.currentTarget.style.background = "transparent"; }}
      >
        {row.map((cell, ci) => (
          <div key={ci} style={{ padding: "9px 12px", fontSize: 13, color: C.text, display: "flex", alignItems: "center" }}>{cell}</div>
        ))}
      </div>
    ))}
  </div>
);

// ── Button ───────────────────────────────────────────────────────────────────
const Btn = ({ onClick, children, variant = "default", small }) => {
  const variants = {
    default: { bg: C.card, color: C.text, border: C.border, hover: C.border },
    primary: { bg: C.accent, color: "#001a10", border: C.accent, hover: "#2eaf74" },
    danger:  { bg: C.danger, color: "#fff", border: C.danger, hover: "#d03030" },
    warn:    { bg: C.warn, color: "#1a0d00", border: C.warn, hover: "#d48a10" },
    blue:    { bg: C.blue, color: "#fff", border: C.blue, hover: "#3070d0" },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      borderRadius: 6, padding: small ? "4px 12px" : "7px 16px",
      fontSize: small ? 12 : 13, fontWeight: 600, cursor: "pointer",
      transition: "all 0.15s", fontFamily: "inherit",
    }}
      onMouseEnter={e => e.currentTarget.style.background = v.hover}
      onMouseLeave={e => e.currentTarget.style.background = v.bg}
    >{children}</button>
  );
};

// ── Input ────────────────────────────────────────────────────────────────────
const Input = ({ placeholder, value, onChange, style }) => (
  <input value={value} onChange={onChange} placeholder={placeholder}
    style={{
      background: "#111827", border: `1px solid ${C.border}`, borderRadius: 6,
      padding: "7px 12px", fontSize: 13, color: C.text, fontFamily: "inherit",
      outline: "none", ...style,
    }} />
);

const Select = ({ value, onChange, options, style }) => (
  <select value={value} onChange={onChange}
    style={{
      background: "#111827", border: `1px solid ${C.border}`, borderRadius: 6,
      padding: "7px 10px", fontSize: 13, color: C.text, fontFamily: "inherit",
      outline: "none", cursor: "pointer", ...style,
    }}>
    {options.map((o, i) => <option key={i} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

// ── Notification Toast ───────────────────────────────────────────────────────
const Toast = ({ msg, onClose }) => msg ? (
  <div style={{
    position: "fixed", bottom: 28, right: 28, background: C.accent, color: "#001a10",
    padding: "12px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14,
    boxShadow: "0 8px 32px #0008", zIndex: 9999, display: "flex", gap: 12, alignItems: "center",
  }}>
    ✓ {msg}
    <button onClick={onClose} style={{ background: "none", border: "none", color: "#001a10", cursor: "pointer", fontWeight: 900, fontSize: 16 }}>×</button>
  </div>
) : null;

// ═══════════════════════════════════════════════════════════════════════════════
// UC1 – Gérer comptes fournisseurs
// ═══════════════════════════════════════════════════════════════════════════════
const GererFournisseurs = ({ onToast }) => {
  const initial = [
    { nom: "Société Alpha",   statut: "actif",    date: "01/03/2026" },
    { nom: "MediaBeta",       statut: "attente",  date: "10/04/2026" },
    { nom: "TechGamma",       statut: "suspendu", date: "15/02/2026" },
    { nom: "EcoVerde SARL",   statut: "actif",    date: "20/01/2026" },
    { nom: "NaturaBio",       statut: "attente",  date: "05/04/2026" },
  ];
  const [rows, setRows] = useState(initial);
  const [sel, setSel] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");

  const filtered = rows.filter(r =>
    r.nom.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatut === "Tous" || r.statut === filterStatut.toLowerCase())
  );

  const act = (action) => {
    if (filtered[sel] === undefined) return;
    const nom = filtered[sel].nom;
    const newStatut = action === "approuver" ? "actif" : action === "suspendre" ? "suspendu" : null;
    if (newStatut) {
      setRows(rows.map(r => r.nom === nom ? { ...r, statut: newStatut } : r));
      onToast(`${action === "approuver" ? "Approuvé" : "Suspendu"} : ${nom}`);
    } else if (action === "supprimer") {
      setRows(rows.filter(r => r.nom !== nom));
      setSel(0);
      onToast(`Supprimé : ${nom}`);
    }
  };

  const labelMap = { actif: "Actif", attente: "Attente", suspendu: "Suspendu" };
  const typeMap = { actif: "actif", attente: "attente", suspendu: "suspendu" };

  return (
    <div>
      <SectionTitle icon="🏭" title="Gérer comptes fournisseurs" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard num={rows.length} label="Total" color={C.blue} />
        <StatCard num={rows.filter(r => r.statut === "attente").length} label="En attente" color={C.warn} />
        <StatCard num={rows.filter(r => r.statut === "suspendu").length} label="Suspendus" color={C.danger} />
      </div>
      <Panel title="Rechercher fournisseur">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Input placeholder="Nom du fournisseur…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
          <Select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} options={["Tous", "Actif", "Attente", "Suspendu"]} />
          <Btn variant="primary" onClick={() => {}}>Rechercher</Btn>
        </div>
      </Panel>
      <Panel title="Liste fournisseurs">
        <Table
          headers={[{ label: "Nom", flex: "2fr" }, { label: "Statut" }, { label: "Date inscription" }]}
          rows={filtered.map(r => [
            <span style={{ fontWeight: 600 }}>{r.nom}</span>,
            <Badge type={typeMap[r.statut]}>{labelMap[r.statut]}</Badge>,
            <span style={{ color: C.muted, fontSize: 12 }}>{r.date}</span>,
          ])}
          selected={sel}
          onSelect={setSel}
        />
        {filtered[sel] && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#111827", borderRadius: 8, fontSize: 13, color: C.muted }}>
            Sélection : <strong style={{ color: C.text }}>{filtered[sel].nom}</strong>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <Btn variant="primary" onClick={() => act("approuver")}>✓ Approuver</Btn>
          <Btn variant="warn"    onClick={() => act("suspendre")}>⏸ Suspendre</Btn>
          <Btn variant="danger"  onClick={() => act("supprimer")}>✕ Supprimer</Btn>
          <Btn onClick={() => {}}>✎ Modifier</Btn>
        </div>
      </Panel>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// UC2 – Valider produits avant publication
// ═══════════════════════════════════════════════════════════════════════════════
const ValiderProduits = ({ onToast }) => {
  const initial = [
    { nom: "Câble HDMI 4K",   fournisseur: "TechGamma", statut: "attente" },
    { nom: "Chaise Ergo Z5",  fournisseur: "Sté Alpha", statut: "revue" },
    { nom: "Masque N95",      fournisseur: "MediaBeta", statut: "attente" },
    { nom: "Huile d'argan BIO", fournisseur: "NaturaBio", statut: "attente" },
  ];
  const [rows, setRows] = useState(initial);
  const [sel, setSel] = useState(0);
  const [search, setSearch] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const filtered = rows.filter(r => r.nom.toLowerCase().includes(search.toLowerCase()));
  const lblMap = { attente: "Attente", revue: "En revue", valide: "Validé", refuse: "Refusé" };
  const typMap = { attente: "attente", revue: "info", valide: "valide", refuse: "err" };

  const act = (action) => {
    if (!filtered[sel]) return;
    const nom = filtered[sel].nom;
    if (action === "valider") {
      setRows(rows.map(r => r.nom === nom ? { ...r, statut: "valide" } : r));
      onToast(`Produit validé : ${nom}`);
    } else if (action === "refuser") {
      setRows(rows.map(r => r.nom === nom ? { ...r, statut: "refuse" } : r));
      onToast(`Produit refusé : ${nom}`);
    } else if (action === "supprimer") {
      setRows(rows.filter(r => r.nom !== nom));
      setSel(0);
      onToast(`Produit supprimé : ${nom}`);
    }
    setCommentaire("");
  };

  return (
    <div>
      <SectionTitle icon="📦" title="Valider produits avant publication" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard num={rows.filter(r => r.statut === "attente" || r.statut === "revue").length} label="En attente" color={C.warn} />
        <StatCard num={rows.filter(r => r.statut === "valide").length} label="Validés" color={C.accent} />
      </div>
      <Panel title="Rechercher produit">
        <div style={{ display: "flex", gap: 10 }}>
          <Input placeholder="Nom du produit…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <Btn variant="primary" onClick={() => {}}>Rechercher</Btn>
        </div>
      </Panel>
      <Panel title="Produits en attente de validation">
        <Table
          headers={[{ label: "Produit", flex: "2fr" }, { label: "Fournisseur" }, { label: "Statut" }]}
          rows={filtered.map(r => [
            <span style={{ fontWeight: 600 }}>{r.nom}</span>,
            <span style={{ color: C.muted }}>{r.fournisseur}</span>,
            <Badge type={typMap[r.statut]}>{lblMap[r.statut]}</Badge>,
          ])}
          selected={sel}
          onSelect={setSel}
        />
      </Panel>
      <Panel title="Décision">
        <textarea
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          placeholder="Motif de refus (optionnel)…"
          rows={3}
          style={{
            width: "100%", background: "#111827", border: `1px solid ${C.border}`,
            borderRadius: 6, padding: "8px 12px", fontSize: 13, color: C.text,
            fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <Btn variant="primary" onClick={() => act("valider")}>✓ Valider</Btn>
          <Btn variant="danger"  onClick={() => act("refuser")}>✕ Refuser</Btn>
          <Btn onClick={() => {}}>✎ Modifier</Btn>
          <Btn variant="danger"  onClick={() => act("supprimer")}>🗑 Supprimer</Btn>
          <Btn variant="blue"   onClick={() => onToast("Produit ajouté")}>+ Ajouter produit</Btn>
        </div>
      </Panel>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// UC3 – Valider certifications
// ═══════════════════════════════════════════════════════════════════════════════════════
const ValiderCertifications = ({ onToast }) => {
  const initial = [
    { cert: "ISO 9001",    fournisseur: "Sté Alpha",  statut: "attente", expiry: "2027-01" },
    { cert: "CE Marquage", fournisseur: "MediaBeta",  statut: "expire",  expiry: "2024-12" },
    { cert: "HACCP",       fournisseur: "TechGamma",  statut: "valide",  expiry: "2028-06" },
    { cert: "ISO 14001",   fournisseur: "EcoVerde",   statut: "attente", expiry: "2026-09" },
    { cert: "Fair Trade",  fournisseur: "NaturaBio",  statut: "valide",  expiry: "2027-03" },
  ];
  const [rows, setRows] = useState(initial);
  const [sel, setSel] = useState(0);
  const [filterType, setFilterType] = useState("Tous");
  const [filterStatut, setFilterStatut] = useState("Tous");

  const lblMap = { attente: "Attente", valide: "Valide", expire: "Expiré" };
  const typMap = { attente: "attente", valide: "valide", expire: "expire" };

  const filtered = rows.filter(r =>
    (filterType === "Tous" || r.cert === filterType) &&
    (filterStatut === "Tous" || r.statut === filterStatut.toLowerCase())
  );

  const act = (action) => {
    if (!filtered[sel]) return;
    const cert = filtered[sel].cert;
    if (action === "valider") {
      setRows(rows.map(r => r.cert === cert ? { ...r, statut: "valide" } : r));
      onToast(`Certification validée : ${cert}`);
    } else if (action === "rejeter") {
      setRows(rows.map(r => r.cert === cert ? { ...r, statut: "expire" } : r));
      onToast(`Certification rejetée : ${cert}`);
    } else if (action === "supprimer") {
      setRows(rows.filter(r => r.cert !== cert));
      setSel(0);
      onToast(`Supprimée : ${cert}`);
    }
  };

  return (
    <div>
      <SectionTitle icon="🏅" title="Valider certifications" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard num={rows.filter(r => r.statut === "attente").length} label="À traiter" color={C.warn} />
        <StatCard num={rows.filter(r => r.statut === "valide").length} label="Validées" color={C.accent} />
        <StatCard num={rows.filter(r => r.statut === "expire").length} label="Expirées" color={C.danger} />
      </div>
      <Panel title="Filtres">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Select value={filterType} onChange={e => setFilterType(e.target.value)}
            options={["Tous", "ISO 9001", "CE Marquage", "HACCP", "ISO 14001", "Fair Trade"]} />
          <Select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            options={["Tous", "Attente", "Valide", "Expire"]} />
          <Btn variant="primary" onClick={() => {}}>Filtrer</Btn>
        </div>
      </Panel>
      <Panel title="Liste certifications">
        <Table
          headers={[{ label: "Certification", flex: "2fr" }, { label: "Fournisseur" }, { label: "Expiration" }, { label: "Statut" }]}
          rows={filtered.map(r => [
            <span style={{ fontWeight: 600 }}>{r.cert}</span>,
            <span style={{ color: C.muted }}>{r.fournisseur}</span>,
            <span style={{ color: C.muted, fontSize: 12 }}>{r.expiry}</span>,
            <Badge type={typMap[r.statut]}>{lblMap[r.statut]}</Badge>,
          ])}
          selected={sel}
          onSelect={setSel}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <Btn variant="primary" onClick={() => act("valider")}>✓ Valider</Btn>
          <Btn variant="danger"  onClick={() => act("rejeter")}>✕ Rejeter</Btn>
          <Btn onClick={() => {}}>✎ Modifier</Btn>
          <Btn variant="danger"  onClick={() => act("supprimer")}>🗑 Supprimer</Btn>
        </div>
      </Panel>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// UC4 – Vérifier cohérence Blockchain
// ═══════════════════════════════════════════════════════════════════════════════
const VerifierBlockchain = ({ onToast }) => {
  const [txId, setTxId] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);

  const blocs = [
    { id: 2847, hash: "0x4f3aec...b81c", parent: "0x9b21ca...f340", date: "14/04/2026", statut: "valide" },
    { id: 2846, hash: "0x9b21ca...f340", parent: "0x7d56ff...a903", date: "13/04/2026", statut: "valide" },
    { id: 2845, hash: "0x7d56ff...a903", parent: "inconnu",          date: "13/04/2026", statut: "anomalie" },
  ];

  const handleVerify = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setResult(txId.includes("4f3a") ? "valide" : txId.length > 4 ? "anomalie" : null);
    }, 1200);
  };

  const ProgressBar = ({ pct, color }) => (
    <div style={{ flex: 1, height: 12, background: "#111827", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color || C.accent, borderRadius: 6, transition: "width 1s" }} />
    </div>
  );

  return (
    <div>
      <SectionTitle icon="🔗" title="Vérifier cohérence Blockchain" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard num="100%" label="Intégrité" color={C.accent} />
        <StatCard num="2847" label="Blocs" color={C.blue} />
        <StatCard num="1" label="Anomalies" color={C.danger} />
      </div>
      <Panel title="Vérification transaction">
        <div style={{ display: "flex", gap: 10 }}>
          <Input placeholder="0x4f3a…b81c" value={txId} onChange={e => setTxId(e.target.value)} style={{ flex: 1, fontFamily: "monospace" }} />
          <Btn variant="primary" onClick={handleVerify}>{searching ? "⏳ Vérification…" : "Vérifier"}</Btn>
        </div>
        {result && (
          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: result === "valide" ? "#0d3328" : C.dangerDim, color: result === "valide" ? C.accent : C.danger, fontWeight: 600, fontSize: 14 }}>
            {result === "valide" ? "✓ Transaction valide — aucune anomalie détectée" : "⚠ Anomalie détectée — bloc non conforme"}
          </div>
        )}
      </Panel>
      <Panel title="Progression audit">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: C.muted, width: 120 }}>Intégrité globale</span>
          <ProgressBar pct={100} color={C.accent} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, width: 36 }}>100%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: C.muted, width: 120 }}>Blocs vérifiés</span>
          <ProgressBar pct={99.96} color={C.blue} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.blue, width: 36 }}>2846</span>
        </div>
      </Panel>
      <Panel title="Blocs récents">
        {blocs.map((b, i) => (
          <div key={b.id}>
            <div style={{
              background: b.statut === "anomalie" ? "#2d0a0a" : "#111827",
              border: `1px solid ${b.statut === "anomalie" ? C.danger : C.border}`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 6,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: C.text, fontFamily: "monospace" }}>Bloc #{b.id}</span>
                <Badge type={b.statut === "valide" ? "ok" : "err"}>
                  {b.statut === "valide" ? "✓ Valide" : "⚠ Anomalie"}
                </Badge>
              </div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: "monospace" }}>
                Hash: {b.hash} | Parent: {b.parent} | {b.date}
              </div>
            </div>
            {i < blocs.length - 1 && (
              <div style={{ textAlign: "center", fontSize: 16, color: C.blue, margin: "2px 0" }}>↑</div>
            )}
          </div>
        ))}
      </Panel>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="blue" onClick={() => onToast("Rapport exporté")}>📥 Exporter rapport</Btn>
        <Btn variant="danger" onClick={() => onToast("Anomalie signalée")}>⚠ Signaler anomalie</Btn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN – AdminFournisseur
// ═════════════════════════──────────────────────────────────────────────────────────────
const TABS = [
  { key: "fournisseurs", label: "Comptes Fournisseurs", icon: "🏭" },
  { key: "produits",     label: "Valider Produits",     icon: "📦" },
  { key: "certifs",      label: "Certifications",        icon: "🏅" },
  { key: "blockchain",   label: "Blockchain",            icon: "🔗" },
];

export default function AdminFournisseur() {
  const [activeTab, setActiveTab] = useState("fournisseurs");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>EthiChain</span>
          <span style={{ color: C.muted, fontSize: 13 }}>/ Admin Fournisseur</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>A</div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: C.panel, borderRight: `1px solid ${C.border}`, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px", marginBottom: 8 }}>Navigation</div>
          {TABS.map(t => {
            const active = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                background: active ? `${C.accent}18` : "transparent",
                border: active ? `1px solid ${C.accentDim}` : "1px solid transparent",
                borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                color: active ? C.accent : C.muted, fontFamily: "inherit",
                fontSize: 13, fontWeight: active ? 700 : 500,
                display: "flex", alignItems: "center", gap: 10,
                transition: "all 0.15s", textAlign: "left", width: "100%",
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#1e2535"; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; } }}
              >
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, fontSize: 11, color: C.muted, padding: "12px 12px 0" }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 2 }}>Admin Fournisseur</div>
            <div>Connecté · Session active</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxHeight: "calc(100vh - 56px)" }}>
          {activeTab === "fournisseurs" && <GererFournisseurs onToast={showToast} />}
          {activeTab === "produits"     && <ValiderProduits   onToast={showToast} />}
          {activeTab === "certifs"      && <ValiderCertifications onToast={showToast} />}
          {activeTab === "blockchain"   && <VerifierBlockchain onToast={showToast} />}
        </div>
      </div>

      <Toast msg={toast} onClose={() => setToast("")} />
    </div>
  );
}
