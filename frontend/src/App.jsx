import { useEffect, useState } from 'react';
import './App.css';

const fallbackData = {
  navItems: [
    { id: 'dashboard', icon: '🌿', label: 'Tableau de bord' },
    { id: 'products', icon: '📦', label: 'Mes Produits', badge: '12' },
    { id: 'add', icon: '➕', label: 'Ajouter Produit' },
    { id: 'blockchain', icon: '⛓️', label: 'Blockchain' },
    { id: 'certifs', icon: '🏅', label: 'Certifications' },
    { id: 'profile', icon: '👤', label: 'Mon Profil' },
  ],
  titles: {
    dashboard: 'Tableau de bord',
    products: 'Mes Produits',
    add: 'Ajouter un Produit',
    blockchain: 'Blockchain',
    certifs: 'Certifications',
    profile: 'Mon Profil',
  },
  stats: [
    { icon: '📦', value: '12', label: 'Produits enregistrés', trend: '↑ +3 ce mois', trendClass: 'up', cardClass: 'green' },
    { icon: '⛓️', value: '48', label: 'Transactions Blockchain', trend: '↑ Tout validé', trendClass: 'up', cardClass: 'gold' },
    { icon: '👁️', value: '1.2k', label: 'Scans QR Code', trend: '↑ +18% semaine', trendClass: 'up', cardClass: 'blue' },
    { icon: '⭐', value: '4.8', label: 'Note consommateurs', trend: '↑ Excellent', trendClass: 'up', cardClass: 'purple' },
  ],
  recentProducts: [
    { icon: '🍯', name: 'Miel de Montagne Bio', sku: '#PRD-001', category: 'Alimentaire', categoryClass: 'pill-green', status: '✔ Validé', statusClass: 'pill-blue', qr: '📱' },
    { icon: '🧵', name: 'Tissu Artisanal Berbère', sku: '#PRD-002', category: 'Textile', categoryClass: 'pill-amber', status: '✔ Validé', statusClass: 'pill-blue', qr: '📱' },
    { icon: '🫒', name: 'Huile d\'Argan Pure', sku: '#PRD-003', category: 'Cosmétique', categoryClass: 'pill-green', status: '⏳ En attente', statusClass: 'pill-amber', qr: '—' },
    { icon: '🌿', name: 'Thé à la Menthe Fès', sku: '#PRD-004', category: 'Alimentaire', categoryClass: 'pill-green', status: '✔ Validé', statusClass: 'pill-blue', qr: '📱' },
  ],
  blockchainActivity: [
    { statusClass: 'confirmed', title: 'Enregistrement produit #PRD-004', hash: '0x3f7a...bc42', time: '2h ago' },
    { statusClass: 'confirmed', title: 'Certification ajoutée #PRD-001', hash: '0x8d1c...f391', time: '1j ago' },
    { statusClass: 'pending', title: 'Validation #PRD-003 en cours...', hash: '0xa2e5...7b0d', time: 'En cours' },
    { statusClass: 'confirmed', title: 'Mise à jour traçabilité #PRD-002', hash: '0x61f9...c84e', time: '3j ago' },
    { statusClass: 'confirmed', title: 'Enregistrement #PRD-002', hash: '0x0d3b...aa91', time: '1 sem' },
  ],
  impactItems: [
    { label: '🌱 Score Écologique', value: '82 / 100', width: '82%', color: 'var(--leaf)' },
    { label: '🤝 Équité salariale', value: '91 / 100', width: '91%', color: 'var(--sage)' },
    { label: '♻️ Durabilité emballage', value: '67 / 100', width: '67%', color: 'var(--amber)' },
    { label: '🌍 Empreinte carbone', value: '74 / 100', width: '74%', color: 'var(--gold)' },
  ],
  certificationBlocks: [
    { icon: '🌿', title: 'Fair Trade Certified', subtitle: 'Valide jusqu\'au 12/2025', badge: 'Active', badgeClass: 'pill-green', warning: false },
    { icon: '🌾', title: 'Agriculture Biologique', subtitle: 'Valide jusqu\'au 06/2026', badge: 'Active', badgeClass: 'pill-green', warning: false },
    { icon: '🏅', title: 'ISO 26000 RSE', subtitle: 'Renouvellement requis', badge: 'Expirée', badgeClass: 'pill-amber', warning: true },
  ],
  productsList: [
    { icon: '🍯', name: 'Miel de Montagne Bio', sku: '#PRD-001', category: 'Alimentaire', categoryClass: 'pill-green', price: '85 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 423, blockchain: '0x3f7a...bc42' },
    { icon: '🧵', name: 'Tissu Artisanal Berbère', sku: '#PRD-002', category: 'Textile', categoryClass: 'pill-amber', price: '320 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 187, blockchain: '0x8d1c...f391' },
    { icon: '🫒', name: 'Huile d\'Argan Pure', sku: '#PRD-003', category: 'Cosmétique', categoryClass: 'pill-green', price: '145 MAD', status: '⏳ En attente', statusClass: 'pill-amber', scans: 0, blockchain: '— En cours' },
    { icon: '🌿', name: 'Thé à la Menthe Fès', sku: '#PRD-004', category: 'Alimentaire', categoryClass: 'pill-green', price: '45 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 612, blockchain: '0x61f9...c84e' },
    { icon: '🧴', name: 'Savon Beldi Traditionnel', sku: '#PRD-005', category: 'Cosmétique', categoryClass: 'pill-green', price: '35 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 284, blockchain: '0x2ab7...d01f' },
  ],
  transactions: [
    { hash: '0x3f7a...bc42', type: 'Enregistrement', product: '#PRD-004', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '28/03/2026 14:32' },
    { hash: '0x8d1c...f391', type: 'Certification', product: '#PRD-001', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '27/03/2026 09:15' },
    { hash: '0xa2e5...7b0d', type: 'Enregistrement', product: '#PRD-003', badge: '⏳ Pending', badgeClass: 'pill-amber', date: '28/03/2026 16:20' },
    { hash: '0x61f9...c84e', type: 'Mise à jour', product: '#PRD-002', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '25/03/2026 11:40' },
    { hash: '0x0d3b...aa91', type: 'Enregistrement', product: '#PRD-002', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '21/03/2026 08:00' },
  ],
  profileStats: [
    { label: '📦 Produits enregistrés', value: '12' },
    { label: '🏅 Certifications actives', value: '2' },
    { label: '👁️ Total scans QR', value: '1,238' },
    { label: '⭐ Note moyenne', value: '4.8 / 5' },
    { label: '📅 Membre depuis', value: 'Janv. 2025' },
  ],
  certTags: [
    '🌿 Fair Trade',
    '🌾 Bio / Organique',
    '♻️ Eco-label',
    '🤝 Commerce équitable',
    '🌍 Carbon Neutral',
    '🏅 ISO 26000',
  ],
  initialForm: {
    name: '',
    category: '',
    origin: '',
    price: '',
    desc: '',
    steps: '',
    social: '',
    carbon: '',
  },
};

export default function App() {
  const [dashboardData, setDashboardData] = useState(fallbackData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productForm, setProductForm] = useState(fallbackData.initialForm);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState('0x...');
  const [error, setError] = useState(null);

  const {
    navItems,
    titles,
    stats,
    recentProducts,
    blockchainActivity,
    impactItems,
    certificationBlocks,
    productsList,
    transactions,
    profileStats,
    certTags,
  } = dashboardData;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/dashboard');
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.message || 'Backend unavailable');
        }
        setDashboardData(json.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDashboard();
  }, []);

  const changeTab = (id) => setActiveTab(id);

  const handleInput = (key, value) => {
    setProductForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCert = (tag) => {
    setSelectedCerts((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const submitProduct = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: productForm, selectedCerts }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Erreur lors de l\'enregistrement');
      }
      setTxHash(json.txHash);
      setShowSuccess(true);
      setProductForm(fallbackData.initialForm);
      setSelectedCerts([]);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowSuccess(false);
    setActiveTab('products');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand">Ethi<span>Chain</span></div>
          <div className="tagline">Espace Fournisseur</div>
        </div>

        <div className="nav-section-label">Navigation</div>
        {navItems.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => changeTab(item.id)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
            {item.badge ? <span className="badge">{item.badge}</span> : null}
          </div>
        ))}

        <div className="nav-section-label">Compte</div>
        <div
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => changeTab('profile')}
        >
          <span className="icon">👤</span> Mon Profil
        </div>
        <div className="nav-item">
          <span className="icon">⚙️</span> Paramètres
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <div className="name">Aya Adlouni</div>
              <div className="role">Fournisseur certifié</div>
            </div>
            <div className="verified-badge">✔ Vérifié</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="page-title">{titles[activeTab] || 'EthiChain'}</div>
          <div className="topbar-right">
            <div className="notif-btn">🔔<span className="notif-dot" /></div>
            <button className="btn btn-gold" type="button" onClick={() => changeTab('add')}>
              + Nouveau produit
            </button>
          </div>
        </div>

        <div className="content">
          {error && (
            <div style={{ marginBottom: 24, color: '#b84a4a' }}>
              Erreur backend: {error}
            </div>
          )}

          <div className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <div className="stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className={`stat-card ${stat.cardClass}`}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className={`stat-trend ${stat.trendClass}`}>{stat.trend}</div>
                </div>
              ))}
            </div>

            <div className="two-col">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Produits Récents</span>
                  <button className="btn btn-outline" type="button" onClick={() => changeTab('products')}>
                    Voir tout
                  </button>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th>Statut</th>
                        <th>QR</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.map((product) => (
                        <tr key={product.sku}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="prod-img">{product.icon}</div>
                              <div>
                                <div className="prod-name">{product.name}</div>
                                <div className="prod-sku">{product.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`pill ${product.categoryClass}`}>{product.category}</span></td>
                          <td><span className={`pill ${product.statusClass}`}>{product.status}</span></td>
                          <td>{product.qr}</td>
                          <td>
                            <button className="action-btn" type="button">✏️</button>
                            <button className="action-btn" type="button">👁️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Activité Blockchain</span>
                  <span className="pill pill-green">⛓ Connecté</span>
                </div>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                  <div className="chain-list">
                    {blockchainActivity.map((item) => (
                      <div key={item.hash} className="chain-item">
                        <div className={`chain-dot ${item.statusClass}`} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.title}</div>
                          <div className="chain-hash">{item.hash}</div>
                        </div>
                        <div className="chain-time">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="two-col">
              <div className="card">
                <div className="card-header"><span className="card-title">Impact Environnemental & Social</span></div>
                <div className="card-body">
                  {impactItems.map((item) => (
                    <div key={item.label} className="impact-item">
                      <div className="impact-header">
                        <span>{item.label}</span><strong>{item.value}</strong>
                      </div>
                      <div className="impact-bar">
                        <div className="impact-fill" style={{ width: item.width, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Mes Certifications</span></div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {certificationBlocks.map((cert) => (
                      <div
                        key={cert.title}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          borderRadius: 10,
                          background: cert.warning ? 'rgba(200,168,75,0.07)' : 'rgba(74,140,92,0.07)',
                          border: cert.warning ? '1px solid rgba(200,168,75,0.2)' : '1px solid var(--border)',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{cert.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{cert.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{cert.subtitle}</div>
                        </div>
                        <span className={`pill ${cert.badgeClass}`} style={{ marginLeft: 'auto' }}>{cert.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'add' ? 'active' : ''}`}>
            <div className="steps">
              <div className="step done"><div className="step-num">✔</div>Informations</div>
              <div className="step-line done" />
              <div className="step active"><div className="step-num">2</div>Traçabilité</div>
              <div className="step-line" />
              <div className="step"><div className="step-num">3</div>Certifications</div>
              <div className="step-line" />
              <div className="step"><div className="step-num">4</div>Publication</div>
            </div>

            <div className="two-col">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Enregistrer un Nouveau Produit</span>
                  <span className="pill pill-amber">⛓ Sera enregistré sur Blockchain</span>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="pName">Nom du produit *</label>
                      <input
                        id="pName"
                        type="text"
                        placeholder="ex: Miel de montagne bio Maroc"
                        value={productForm.name}
                        onChange={(e) => handleInput('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pCat">Catégorie *</label>
                      <select
                        id="pCat"
                        value={productForm.category}
                        onChange={(e) => handleInput('category', e.target.value)}
                      >
                        <option value="">— Sélectionner —</option>
                        <option>Alimentaire</option>
                        <option>Textile</option>
                        <option>Cosmétique</option>
                        <option>Artisanat</option>
                        <option>Agriculture</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="pOrigin">Pays d'origine *</label>
                      <input
                        id="pOrigin"
                        type="text"
                        placeholder="ex: Maroc — Région de Fès"
                        value={productForm.origin}
                        onChange={(e) => handleInput('origin', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pPrice">Prix (MAD)</label>
                      <input
                        id="pPrice"
                        type="number"
                        placeholder="ex: 85.00"
                        value={productForm.price}
                        onChange={(e) => handleInput('price', e.target.value)}
                      />
                    </div>
                    <div className="form-group full">
                      <label htmlFor="pDesc">Description du produit</label>
                      <textarea
                        id="pDesc"
                        placeholder="Décrivez le produit, son histoire, ses caractéristiques uniques..."
                        value={productForm.desc}
                        onChange={(e) => handleInput('desc', e.target.value)}
                      />
                    </div>
                    <div className="form-group full">
                      <label htmlFor="pSteps">Étapes de production</label>
                      <textarea
                        id="pSteps"
                        placeholder="1. Récolte manuelle en altitude\n2. Extraction à froid\n3. Mise en pot sans additifs..."
                        style={{ minHeight: 100 }}
                        value={productForm.steps}
                        onChange={(e) => handleInput('steps', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pSocial">Impact social</label>
                      <input
                        id="pSocial"
                        type="text"
                        placeholder="ex: 3 familles soutenues"
                        value={productForm.social}
                        onChange={(e) => handleInput('social', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pCarbon">Empreinte carbone (kg CO₂)</label>
                      <input
                        id="pCarbon"
                        type="text"
                        placeholder="ex: 0.42 kg CO₂ / unité"
                        value={productForm.carbon}
                        onChange={(e) => handleInput('carbon', e.target.value)}
                      />
                    </div>
                    <div className="form-group full">
                      <label>Certifications associées</label>
                      <div className="cert-tags">
                        {certTags.map((tag) => (
                          <span
                            key={tag}
                            className={`cert-tag ${selectedCerts.includes(tag) ? 'selected' : ''}`}
                            onClick={() => toggleCert(tag)}
                            role="button"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <button className="btn btn-outline" type="button">Sauvegarder brouillon</button>
                    <button className="btn btn-primary" type="button" onClick={submitProduct}>⛓ Enregistrer sur Blockchain</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <div className="card-header"><span className="card-title">Aperçu QR Code</span></div>
                  <div className="card-body">
                    <div className="qr-preview">
                      <div className="qr-box">📱</div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>QR Code Généré</div>
                      <div className="qr-id">ID: #PRD-013 · EthiChain v2</div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8 }}>Généré après validation Blockchain</div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline" type="button" style={{ flex: 1, justifyContent: 'center' }}>⬇ Télécharger</button>
                      <button className="btn btn-outline" type="button" style={{ flex: 1, justifyContent: 'center' }}>📋 Copier lien</button>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><span className="card-title">Info Blockchain</span></div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                      {[
                        ['Réseau', 'EthiChain Mainnet'],
                        ['Statut', 'Connecté'],
                        ['Wallet fournisseur', '0x4F2a...e391'],
                        ['Frais transaction', '~0.001 ETH'],
                        ['Immutabilité', '✔ Garantie'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-light)' }}>{label}</span>
                          <span style={{ fontWeight: 600 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Tous mes Produits ({productsList.length})</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="🔍 Rechercher..." style={{ padding: '8px 14px', width: 200 }} />
                  <select style={{ padding: '8px 12px' }}>
                    <option>Tous</option>
                    <option>Validés</option>
                    <option>En attente</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Catégorie</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>QR Scans</th>
                      <th>Blockchain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map((product) => (
                      <tr key={product.sku}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="prod-img">{product.icon}</div>
                            <div>
                              <div className="prod-name">{product.name}</div>
                              <div className="prod-sku">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`pill ${product.categoryClass}`}>{product.category}</span></td>
                        <td>{product.price}</td>
                        <td><span className={`pill ${product.statusClass}`}>{product.status}</span></td>
                        <td>{product.scans}</td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{product.blockchain}</span></td>
                        <td>
                          <button className="action-btn" type="button">✏️</button>
                          <button className="action-btn" type="button">👁️</button>
                          <button className="action-btn" type="button">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'blockchain' ? 'active' : ''}`}>
            <div className="two-col">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Historique des Transactions</span>
                  <span className="pill pill-green">⛓ En ligne</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Hash</th>
                        <th>Type</th>
                        <th>Produit</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.hash}>
                          <td><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{tx.hash}</span></td>
                          <td>{tx.type}</td>
                          <td>{tx.product}</td>
                          <td><span className={`pill ${tx.badgeClass}`}>{tx.badge}</span></td>
                          <td style={{ fontSize: 11 }}>{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Statut du Réseau</span></div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: 16, background: 'rgba(74,140,92,0.07)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Réseau</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--forest)' }}>EthiChain Mainnet</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1, padding: 14, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--leaf)' }}>48</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Total Tx</div>
                      </div>
                      <div style={{ flex: 1, padding: 14, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amber)' }}>1</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>En attente</div>
                      </div>
                      <div style={{ flex: 1, padding: 14, background: 'var(--cream)', borderRadius: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--forest)' }}>0</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Échoués</div>
                      </div>
                    </div>
                    <div style={{ padding: 14, background: 'rgba(200,168,75,0.07)', borderRadius: 10, border: '1px solid rgba(200,168,75,0.2)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Adresse Wallet</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', color: 'var(--forest)' }}>0x4F2a891b3d7C9eA2f01b4d5E8c7F3a2e...e391</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'certifs' ? 'active' : ''}`}>
            <div className="two-col">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Mes Certifications</span>
                  <button className="btn btn-primary" type="button" style={{ fontSize: 12, padding: '8px 16px' }}>+ Ajouter</button>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {certificationBlocks.map((cert) => (
                      <div
                        key={cert.title}
                        style={{
                          padding: 18,
                          borderRadius: 'var(--radius-sm)',
                          background: cert.warning ? 'rgba(200,168,75,0.05)' : 'rgba(74,140,92,0.05)',
                          border: cert.warning ? '1.5px solid rgba(200,168,75,0.25)' : '1.5px solid rgba(74,140,92,0.2)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontSize: 36 }}>{cert.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{cert.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{cert.subtitle}</div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: cert.warning ? 'var(--amber)' : 'var(--leaf)', marginTop: 6 }}>On-chain: 0x...{cert.warning ? 'd443' : 'c291'}</div>
                          </div>
                          <span className={`pill ${cert.badgeClass}`}>{cert.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Ajouter une Certification</span></div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label>Nom de la certification</label>
                      <input type="text" placeholder="ex: Rainforest Alliance" />
                    </div>
                    <div className="form-group">
                      <label>Organisme certificateur</label>
                      <input type="text" placeholder="ex: Rainforest Alliance Intl." />
                    </div>
                    <div className="form-group">
                      <label>Date d'expiration</label>
                      <input type="date" />
                    </div>
                    <div className="form-group">
                      <label>Document de preuve (PDF)</label>
                      <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', color: 'var(--text-light)' }}>
                        📎 Glisser-déposer ou cliquer pour importer
                      </div>
                    </div>
                    <button className="btn btn-primary" type="button">⛓ Enregistrer sur Blockchain</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'profile' ? 'active' : ''}`}>
            <div className="two-col">
              <div className="card">
                <div className="card-header"><span className="card-title">Informations du Fournisseur</span></div>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--leaf),var(--forest))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--white)', fontWeight: 700 }}>A</div>
                    <div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>Aya Adlouni</div>
                      <div style={{ color: 'var(--text-light)', fontSize: 13 }}>Fournisseur certifié — Fès, Maroc</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <span className="pill pill-green">✔ Identité vérifiée</span>
                        <span className="pill pill-blue">⛓ Wallet connecté</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nom complet</label>
                      <input type="text" value="Aya Adlouni" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value="aya.adlouni@ethichain.ma" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Téléphone</label>
                      <input type="tel" value="+212 6XX XXX XXX" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Région</label>
                      <input type="text" value="Fès-Meknès, Maroc" readOnly />
                    </div>
                    <div className="form-group full">
                      <label>Description de l'entreprise</label>
                      <textarea style={{ minHeight: 80 }} readOnly>
                        Producteur artisanal engagé dans le commerce équitable, spécialisé dans les produits naturels du Maroc.
                      </textarea>
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-primary" type="button">Sauvegarder les modifications</button>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Statistiques du Profil</span></div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {profileStats.map((stat) => (
                      <div key={stat.label} style={{ padding: 16, background: 'var(--cream)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{stat.label}</span><strong>{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">⛓✅</div>
            <div className="modal-title">Produit enregistré !</div>
            <div className="modal-text">Votre produit a été enregistré avec succès sur la Blockchain EthiChain. Un QR Code unique a été généré.</div>
            <div className="modal-hash">Hash: <span>{txHash}</span></div>
            <button className="btn btn-primary" type="button" onClick={closeModal} style={{ width: '100%', justifyContent: 'center' }}>Parfait !</button>
          </div>
        </div>
      )}
    </div>
  );
}
