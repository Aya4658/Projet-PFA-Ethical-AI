import { useState, useEffect } from "react";
import { ConfirmDialog } from "../shared.jsx";
import { verifyBlockchain } from "../../utils/blockchainVerify.js";
import "./Produits.css";

const API = "http://localhost:5000/api/products";
const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  currency: "EUR",
  origin_country: "",
  fair_trade_certified: false,
  ethical_score: "",
  carbon_footprint_kg: "",
  stock: "",
  rating: "",
  producer_id: "",
  labels: "",
};

function mapListItem(p) {
  return {
    id: p._id,
    nom: p.name || p.nom || "Sans nom",
    category: p.category || "—",
    fournisseur: p.producer_id != null ? String(p.producer_id) : "—",
    price: p.price != null ? `${p.price} ${p.currency || "EUR"}` : "—",
  };
}

function productToForm(p) {
  return {
    name: p.name || "",
    category: p.category || "",
    price: p.price ?? "",
    currency: p.currency || "EUR",
    origin_country: p.origin_country || "",
    fair_trade_certified: Boolean(p.fair_trade_certified),
    ethical_score: p.ethical_score ?? "",
    carbon_footprint_kg: p.carbon_footprint_kg ?? "",
    stock: p.stock ?? "",
    rating: p.rating ?? "",
    producer_id: p.producer_id ?? "",
    labels: Array.isArray(p.labels) ? p.labels.join(", ") : "",
  };
}

function formToPayload(form) {
  return {
    name: form.name,
    category: form.category,
    price: parseFloat(form.price) || 0,
    currency: form.currency,
    origin_country: form.origin_country,
    fair_trade_certified: form.fair_trade_certified,
    ethical_score: parseInt(form.ethical_score, 10) || 0,
    carbon_footprint_kg: parseFloat(form.carbon_footprint_kg) || 0,
    stock: parseInt(form.stock, 10) || 0,
    rating: parseFloat(form.rating) || 0,
    producer_id: form.producer_id !== "" ? Number(form.producer_id) : null,
    labels: form.labels
      ? form.labels.split(",").map(l => l.trim()).filter(Boolean)
      : [],
  };
}

export default function Produits({ data, setData, showToast }) {
  const [recherche, setRecherche] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const filtered = data.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const goFirst = () => setPageIndex(0);
  const goPrev  = () => setPageIndex(p => Math.max(0, p - 1));
  const goNext  = () => setPageIndex(p => Math.min(totalPages - 1, p + 1));
  const goLast  = () => setPageIndex(totalPages - 1);

  const selected = data.find(p => p.id === selectedId);

  useEffect(() => {
    setPageIndex(0);
  }, [recherche]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setForm(EMPTY_FORM);
      setVerifyResult(null);
      return;
    }
    setLoadingDetail(true);
    setVerifyResult(null);
    fetch(`${API}/${selectedId}`)
      .then(r => r.json())
      .then(p => {
        setDetail(p);
        setForm(productToForm(p));
        setLoadingDetail(false);
      })
      .catch(() => {
        showToast("danger", "❌", "Impossible de charger le produit");
        setLoadingDetail(false);
      });
  }, [selectedId]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setDetail(updated);
      setData(prev => prev.map(p =>
        p.id === selectedId
          ? mapListItem({ ...updated, _id: selectedId })
          : p
      ));
      showToast("success", "✅", `${form.name} enregistré`);
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData(prev => prev.filter(p => p.id !== confirmId));
      if (selectedId === confirmId) setSelectedId(null);
      setConfirmId(null);
      showToast("success", "🗑️", "Produit supprimé");
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleAjouter = async () => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nouveau produit", category: "Cosmétique", price: 0, currency: "EUR" }),
      });
      const created = await res.json();
      const item = mapListItem(created);
      setData(prev => [...prev, item]);
      setSelectedId(item.id);
      showToast("success", "➕", "Nouveau produit — remplissez les champs");
    } catch {
      showToast("danger", "❌", "Erreur de connexion au serveur");
    }
  };

  const handleVerify = async () => {
    if (!detail) return;
    setVerifying(true);
    try {
      const result = await verifyBlockchain(detail.processes, detail.blockchain_root_hash);
      setVerifyResult(result);
      showToast(
        result.valid ? "success" : "danger",
        result.valid ? "✅" : "⚠️",
        result.summary
      );
    } finally {
      setVerifying(false);
    }
  };

  const processes = detail?.processes
    ? [...detail.processes].sort((a, b) => a.step_number - b.step_number)
    : [];

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span>📦 Gérer produits</span>
          <div className="ph-btns">
            <div className="ph-btn">_</div><div className="ph-btn">□</div><div className="ph-btn">✕</div>
          </div>
        </div>
        <div className="panel-body">

          <div className="groupbox">
            <span className="groupbox-legend">Rechercher produit</span>
            <div className="form-row" style={{ marginTop: 8 }}>
              <span className="form-label">Produit :</span>
              <input
                className="form-input"
                placeholder="Nom du produit..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
              />
            </div>
          </div>

          <div className="groupbox">
            <span className="groupbox-legend">Catalogue produits</span>
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📭</div>Aucun produit</div>
            ) : (
              <>
                <table className="data-table" style={{ marginTop: 8 }}>
                  <thead>
                    <tr><th>Produit</th><th>Catégorie</th><th>Fournisseur</th><th>Prix</th></tr>
                  </thead>
                  <tbody>
                    {paginated.map(p => (
                      <tr
                        key={p.id}
                        className={selectedId === p.id ? "selected" : ""}
                        onClick={() => setSelectedId(p.id)}
                      >
                        <td>{p.nom}</td>
                        <td>{p.category}</td>
                        <td>{p.fournisseur}</td>
                        <td>{p.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="btn-row produits-pagination">
                  <button className="btn btn-secondary" onClick={goFirst} disabled={safePage === 0}>
                    ⏮ Premiers 10
                  </button>
                  <button className="btn btn-secondary" onClick={goPrev} disabled={safePage === 0}>
                    ◀ 10 précédents
                  </button>
                  <button className="btn btn-secondary" onClick={goNext} disabled={safePage >= totalPages - 1}>
                    10 suivants ▶
                  </button>
                  <button className="btn btn-secondary" onClick={goLast} disabled={safePage >= totalPages - 1}>
                    Derniers 10 ⏭
                  </button>
                </div>
                <div className="produits-page-info">
                  Page {safePage + 1} / {totalPages} — produits {pageStart + 1} à {Math.min(pageStart + PAGE_SIZE, filtered.length)} sur {filtered.length}
                </div>
              </>
            )}
          </div>

          {selectedId && (
            <>
              <div className="groupbox">
                <span className="groupbox-legend">Informations produit — {form.name || selected?.nom}</span>
                {loadingDetail ? (
                  <div className="empty-state" style={{ padding: 16 }}>Chargement...</div>
                ) : (
                  <div className="produits-form-grid" style={{ marginTop: 8 }}>
                    <div className="edit-field">
                      <label>Nom</label>
                      <input value={form.name} onChange={e => updateForm("name", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Catégorie</label>
                      <input value={form.category} onChange={e => updateForm("category", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Prix</label>
                      <input type="number" step="0.01" value={form.price} onChange={e => updateForm("price", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Devise</label>
                      <input value={form.currency} onChange={e => updateForm("currency", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Pays d'origine</label>
                      <input value={form.origin_country} onChange={e => updateForm("origin_country", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>ID Fournisseur</label>
                      <input type="number" value={form.producer_id} onChange={e => updateForm("producer_id", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Score éthique (/100)</label>
                      <input type="number" value={form.ethical_score} onChange={e => updateForm("ethical_score", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Empreinte carbone (kg)</label>
                      <input type="number" step="0.01" value={form.carbon_footprint_kg} onChange={e => updateForm("carbon_footprint_kg", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Stock</label>
                      <input type="number" value={form.stock} onChange={e => updateForm("stock", e.target.value)} />
                    </div>
                    <div className="edit-field">
                      <label>Note (/5)</label>
                      <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => updateForm("rating", e.target.value)} />
                    </div>
                    <div className="edit-field produits-form-full">
                      <label>Labels (séparés par des virgules)</label>
                      <input value={form.labels} onChange={e => updateForm("labels", e.target.value)} placeholder="Fairtrade, Ecocert..." />
                    </div>
                    <div className="edit-field produits-form-full">
                      <label className="produits-checkbox-label">
                        <input
                          type="checkbox"
                          checked={form.fair_trade_certified}
                          onChange={e => updateForm("fair_trade_certified", e.target.checked)}
                        />
                        Commerce équitable certifié
                      </label>
                    </div>
                  </div>
                )}
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button className="btn btn-success" disabled={!selectedId || saving || loadingDetail} onClick={handleSave}>
                    💾 Enregistrer
                  </button>
                  <button className="btn btn-danger" disabled={!selectedId} onClick={() => setConfirmId(selectedId)}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>

              <div className="groupbox">
                <span className="groupbox-legend">Événements blockchain (lecture seule)</span>
                {loadingDetail ? (
                  <div className="empty-state" style={{ padding: 16 }}>Chargement...</div>
                ) : processes.length === 0 ? (
                  <div className="empty-state" style={{ padding: 16 }}>Aucun événement blockchain</div>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    {detail?.blockchain_root_hash && (
                      <div className="bc-root">
                        <span className="bc-root-label">Ancre racine (blockchain_root_hash)</span>
                        <code className="bc-hash">{detail.blockchain_root_hash}</code>
                      </div>
                    )}
                    {processes.map((step, i) => (
                      <div key={step.step_number}>
                        <div className={`bc-block ${verifyResult?.steps[i] ? (verifyResult.steps[i].linkOk ? "bc-valid" : "bc-invalid") : ""}`}>
                          <div className="bc-block-header">
                            <strong>Étape {step.step_number}</strong>
                            {verifyResult?.steps[i] && (
                              <span className={`bc-status ${verifyResult.steps[i].linkOk ? "ok" : "err"}`}>
                                {verifyResult.steps[i].linkOk ? "✓ Conforme" : "✗ Non conforme"}
                              </span>
                            )}
                          </div>
                          <div>{step.process}</div>
                          <div className="bc-hash">previous_hash : {step.previous_hash}</div>
                          {verifyResult?.steps[i]?.computedHash && (
                            <div className="bc-hash">hash calculé : {verifyResult.steps[i].computedHash}</div>
                          )}
                        </div>
                        {i < processes.length - 1 && <div className="bc-arrow">↓</div>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button
                    className="btn btn-primary"
                    disabled={!detail || processes.length === 0 || verifying}
                    onClick={handleVerify}
                  >
                    {verifying ? "Vérification..." : "🔍 Vérifier la viabilité de la chaîne"}
                  </button>
                </div>
                {verifyResult && (
                  <div className={`bc-verify-result ${verifyResult.valid ? "ok" : "err"}`}>
                    {verifyResult.summary}
                    {verifyResult.valid && verifyResult.cryptoChainOk === false && (
                      <div className="bc-hash" style={{ marginTop: 4, fontWeight: 400 }}>
                        Note : calcul SHA-256 inter-blocs différent, mais la structure de la chaîne est conforme.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="btn-row">
            <button className="btn btn-info" style={{ flex: 1 }} onClick={handleAjouter}>➕ Ajouter produit</button>
          </div>

          <div className="statusbar">
            <span>{data.length} produit(s)</span>
            {selected
              ? <span>Sélection : {selected.nom}</span>
              : <span style={{ color: "var(--warning)" }}>⚠ Cliquez sur une ligne</span>}
          </div>
        </div>
      </div>

      {confirmId && (
        <ConfirmDialog
          itemName={data.find(p => p.id === confirmId)?.nom}
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}
