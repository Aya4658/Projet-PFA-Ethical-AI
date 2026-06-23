import { useState } from "react";
import { Badge } from "../shared.jsx";
import "./Blockchain.css";

const BLOCS = [
  { num: 2847, hash: "0x4f3aec...", parent: "0x9b21ca...", date: "14/04/2026", valide: true  },
  { num: 2846, hash: "0x9b21ca...", parent: "0x7d56ff...", date: "13/04/2026", valide: true  },
  { num: 2845, hash: "0x7d56ff...", parent: "inconnu",    date: "13/04/2026", valide: false },
];

export default function Blockchain({ showToast }) {
  const [txId, setTxId] = useState("");

  const handleVerifier = () => {
    if (!txId.trim()) { showToast("warning", "⚠️", "Saisissez un ID de transaction"); return; }
    showToast("success", "🔗", `Transaction ${txId} vérifiée`);
    setTxId("");
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span>⛓️ Vérifier cohérence Blockchain</span>
        <div className="ph-btns">
          <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
        </div>
      </div>
      <div className="panel-body">

        <div className="groupbox">
          <span className="groupbox-legend">Vérification transaction</span>
          <div className="form-row" style={{ marginTop: 8 }}>
            <span className="form-label">ID transaction :</span>
            <input
              className="form-input"
              placeholder="0x4f3a...b81c"
              value={txId}
              onChange={e => setTxId(e.target.value)}
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}
            />
            <button className="btn btn-primary" onClick={handleVerifier}>Valider</button>
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Statistiques chaîne</span>
          <div className="stat-grid" style={{ marginTop: 8 }}>
            <div className="stat-box"><div className="stat-num">100%</div><div className="stat-lbl">Intégrité</div></div>
            <div className="stat-box"><div className="stat-num">2847</div><div className="stat-lbl">Blocs</div></div>
            <div className="stat-box"><div className="stat-num red">1</div><div className="stat-lbl">Anomalies</div></div>
          </div>
          <div className="progress-row">
            <span className="progress-label">Progression :</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: "100%" }} /></div>
            <span className="progress-val">100%</span>
          </div>
        </div>

        <div className="groupbox">
          <span className="groupbox-legend">Blocs récents</span>
          <div style={{ marginTop: 8 }}>
            {BLOCS.map((b, i) => (
              <div key={b.num}>
                <div className="bc-block" style={{ borderColor: b.valide ? "var(--card-border)" : "#fca5a5" }}>
                  <div className="bc-block-header">
                    <strong>Bloc #{b.num}</strong>
                    <Badge s={b.valide ? "Valide" : "Urgent"} />
                  </div>
                  <div className="bc-hash">Hash: {b.hash} | Parent: {b.parent} | {b.date}</div>
                </div>
                {i < BLOCS.length - 1 && <div className="bc-arrow">▲</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => showToast("success", "📄", "Rapport exporté")}>📄 Exporter rapport</button>
          <button className="btn btn-warning"   onClick={() => showToast("warning", "⚠️", "Anomalie signalée")}>⚠️ Signaler anomalie</button>
        </div>

        <div className="statusbar">
          <span>Dernier audit : 15/04/2026</span>
          <span>Bloc #2845 : anomalie détectée</span>
        </div>
      </div>
    </div>
  );
}
