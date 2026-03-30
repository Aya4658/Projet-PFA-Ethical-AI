import React from 'react';

function MainArea({
  activeTab,
  setActiveTab,
  sectionTitles,
  statCards,
  recentProducts,
  blockchainFeed,
  impactScores,
  certificationsData,
  productList,
  filteredProducts,
  searchQuery,
  productFilter,
  setSearchQuery,
  setProductFilter,
  formData,
  handleInput,
  certificationTags,
  selectedCerts,
  toggleCert,
  submitProduct,
  networkStats,
  profileStats,
}) {
  return (
    <main className="main">
      <div className="topbar">
        <div className="page-title">{sectionTitles[activeTab]}</div>
        <div className="topbar-right">
          <div className="notif-btn">
            🔔
            <span className="notif-dot" />
          </div>
          <button className="btn btn-gold" type="button" onClick={() => setActiveTab('add')}>
            + Nouveau produit
          </button>
        </div>
      </div>

      <div className="content">
        <section className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''}`}>
          <div className="stats-grid">
            {statCards.map((card) => (
              <div key={card.id} className={`stat-card ${card.variant}`}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
                <div className={`stat-trend ${card.trendType}`}>{card.trend}</div>
              </div>
            ))}
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Produits Récents</span>
                <button className="btn btn-outline" type="button" onClick={() => setActiveTab('products')}>
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
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <div className="prod-img">{product.emoji}</div>
                            <div>
                              <div className="prod-name">{product.name}</div>
                              <div className="prod-sku">{product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="pill pill-green">{product.category}</span>
                        </td>
                        <td>
                          <span className={`pill ${product.statusClass}`}>{product.status}</span>
                        </td>
                        <td>📱</td>
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
              <div className="card-body card-body-compact">
                <div className="chain-list">
                  {blockchainFeed.map((item) => (
                    <div key={item.id} className="chain-item">
                      <div className={`chain-dot ${item.status}`} />
                      <div>
                        <div className="chain-title">{item.title}</div>
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
              <div className="card-header">
                <span className="card-title">Impact Environnemental & Social</span>
              </div>
              <div className="card-body">
                {impactScores.map((item) => (
                  <div key={item.label} className="impact-item">
                    <div className="impact-header">
                      <span>{item.label}</span>
                      <strong>{item.value} / 100</strong>
                    </div>
                    <div className="impact-bar">
                      <div className="impact-fill" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Mes Certifications</span>
              </div>
              <div className="card-body">
                <div className="cert-list">
                  {certificationsData.map((cert) => (
                    <div key={cert.title} className={`cert-row ${cert.expired ? 'cert-expired' : ''}`}>
                      <span className="cert-icon">{cert.icon}</span>
                      <div>
                        <div className="cert-label">{cert.title}</div>
                        <div className="cert-subtitle">{cert.subtitle}</div>
                      </div>
                      <span className={`pill ${cert.statusClass}`}>{cert.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`tab-content ${activeTab === 'add' ? 'active' : ''}`}>
          <div className="steps">
            <div className="step done">
              <div className="step-num">✔</div>
              Informations
            </div>
            <div className="step-line done" />
            <div className="step active">
              <div className="step-num">2</div>
              Traçabilité
            </div>
            <div className="step-line" />
            <div className="step">
              <div className="step-num">3</div>
              Certifications
            </div>
            <div className="step-line" />
            <div className="step">
              <div className="step-num">4</div>
              Publication
            </div>
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
                    <label>Nom du produit *</label>
                    <input
                      type="text"
                      placeholder="ex: Miel de montagne bio Maroc"
                      value={formData.pName}
                      onChange={(e) => handleInput('pName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Catégorie *</label>
                    <select value={formData.pCat} onChange={(e) => handleInput('pCat', e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      <option>Alimentaire</option>
                      <option>Textile</option>
                      <option>Cosmétique</option>
                      <option>Artisanat</option>
                      <option>Agriculture</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pays d'origine *</label>
                    <input
                      type="text"
                      placeholder="ex: Maroc — Région de Fès"
                      value={formData.pOrigin}
                      onChange={(e) => handleInput('pOrigin', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prix (MAD)</label>
                    <input
                      type="number"
                      placeholder="ex: 85.00"
                      value={formData.pPrice}
                      onChange={(e) => handleInput('pPrice', e.target.value)}
                    />
                  </div>
                  <div className="form-group full">
                    <label>Description du produit</label>
                    <textarea
                      placeholder="Décrivez le produit, son histoire, ses caractéristiques uniques..."
                      value={formData.pDesc}
                      onChange={(e) => handleInput('pDesc', e.target.value)}
                    />
                  </div>
                  <div className="form-group full">
                    <label>Étapes de production</label>
                    <textarea
                      placeholder="1. Récolte manuelle en altitude\n2. Extraction à froid\n3. Mise en pot sans additifs..."
                      value={formData.pSteps}
                      onChange={(e) => handleInput('pSteps', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Impact social</label>
                    <input
                      type="text"
                      placeholder="ex: 3 familles soutenues"
                      value={formData.pSocial}
                      onChange={(e) => handleInput('pSocial', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Empreinte carbone (kg CO₂)</label>
                    <input
                      type="text"
                      placeholder="ex: 0.42 kg CO₂ / unité"
                      value={formData.pCarbon}
                      onChange={(e) => handleInput('pCarbon', e.target.value)}
                    />
                  </div>
                  <div className="form-group full">
                    <label>Certifications associées</label>
                    <div className="cert-tags">
                      {certificationTags.map((tag) => (
                        <span
                          key={tag}
                          className={`cert-tag ${selectedCerts.includes(tag) ? 'selected' : ''}`}
                          onClick={() => toggleCert(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn btn-outline" type="button">
                    Sauvegarder brouillon
                  </button>
                  <button className="btn btn-primary" type="button" onClick={submitProduct}>
                    ⛓ Enregistrer sur Blockchain
                  </button>
                </div>
              </div>
            </div>

            <div className="side-cards">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Aperçu QR Code</span>
                </div>
                <div className="card-body">
                  <div className="qr-preview">
                    <div className="qr-box">📱</div>
                    <div className="qr-title">QR Code Généré</div>
                    <div className="qr-id">ID: #{productList.length + 9} · EthiChain v2</div>
                    <div className="qr-note">Généré après validation Blockchain</div>
                  </div>
                  <div className="qr-actions">
                    <button className="btn btn-outline" type="button">
                      ⬇ Télécharger
                    </button>
                    <button className="btn btn-outline" type="button">
                      📋 Copier lien
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Info Blockchain</span>
                </div>
                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-row">
                      <span>Réseau</span>
                      <span className="info-value">EthiChain Mainnet</span>
                    </div>
                    <div className="info-row">
                      <span>Statut</span>
                      <span className="pill pill-green info-badge">Connecté</span>
                    </div>
                    <div className="info-row">
                      <span>Wallet fournisseur</span>
                      <span className="info-value monospace">0x4F2a...e391</span>
                    </div>
                    <div className="info-row">
                      <span>Frais transaction</span>
                      <span className="info-value">~0.001 ETH</span>
                    </div>
                    <div className="info-row">
                      <span>Immutabilité</span>
                      <span className="info-value info-success">✔ Garantie</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tous mes Produits (12)</span>
              <div className="toolbar">
                <input
                  type="text"
                  placeholder="🔍 Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                  <option>Tous</option>
                  <option>Validés</option>
                  <option>En attente</option>
                </select>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
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
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <div className="prod-img">{product.emoji}</div>
                          <div>
                            <div className="prod-name">{product.name}</div>
                            <div className="prod-sku">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${product.category === 'Textile' ? 'pill-amber' : 'pill-green'}`}>
                          {product.category}
                        </span>
                      </td>
                      <td>{product.price}</td>
                      <td>
                        <span className={`pill ${product.status === 'Validés' ? 'pill-blue' : 'pill-amber'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>{product.scans}</td>
                      <td>
                        <span className="monospace" style={{ fontSize: 11 }}>
                          {product.hash}
                        </span>
                      </td>
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
        </section>

        <section className={`tab-content ${activeTab === 'blockchain' ? 'active' : ''}`}>
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
                    {blockchainFeed.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="monospace" style={{ fontSize: 11 }}>
                            {item.hash}
                          </span>
                        </td>
                        <td>{item.title.split(' ')[0]}</td>
                        <td>{item.title.match(/#PRD-[0-9]+/)?.[0] || '—'}</td>
                        <td>
                          <span className={`pill ${item.status === 'confirmed' ? 'pill-green' : 'pill-amber'}`}>
                            {item.status === 'confirmed' ? '✔ Confirmé' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ fontSize: 11 }}>{item.time === 'En cours' ? '28/03/2026 16:20' : item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Statut du Réseau</span>
              </div>
              <div className="card-body">
                <div className="network-grid">
                  {networkStats.map((stat) => (
                    <div key={stat.label} className="network-item" style={{ background: stat.bg }}>
                      <div className="network-value" style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="network-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="network-card">
                  <div className="network-label">Adresse Wallet</div>
                  <div className="monospace">0x4F2a891b3d7C9eA2f01b4d5E8c7F3a2e...e391</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`tab-content ${activeTab === 'certifs' ? 'active' : ''}`}>
          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Mes Certifications</span>
                <button className="btn btn-primary" type="button">
                  + Ajouter
                </button>
              </div>
              <div className="card-body">
                <div className="cert-list">
                  {certificationsData.map((cert) => (
                    <div key={cert.title} className={`cert-row ${cert.expired ? 'cert-expired' : ''}`}>
                      <span className="cert-icon">{cert.icon}</span>
                      <div className="cert-text">
                        <div className="cert-label">{cert.title}</div>
                        <div className="cert-subtitle">{cert.subtitle}</div>
                        <div className="cert-hash">On-chain: {cert.title === 'ISO 26000 RSE' ? '0x9c0e...d443' : cert.title === 'Agriculture Biologique' ? '0x2b8d...a110' : '0x7f3a...c291'}</div>
                      </div>
                      <span className={`pill ${cert.statusClass}`}>{cert.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Ajouter une Certification</span>
              </div>
              <div className="card-body">
                <div className="form-grid">
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
                    <div className="file-drop">📎 Glisser-déposer ou cliquer pour importer</div>
                  </div>
                  <button className="btn btn-primary" type="button">
                    ⛓ Enregistrer sur Blockchain
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`tab-content ${activeTab === 'profile' ? 'active' : ''}`}>
          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Informations du Fournisseur</span>
              </div>
              <div className="card-body">
                <div className="profile-header">
                  <div className="profile-avatar">A</div>
                  <div>
                    <div className="profile-name">Aya Adlouni</div>
                    <div className="profile-subtitle">Fournisseur certifié — Fès, Maroc</div>
                    <div className="profile-pill-group">
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
                    <textarea value="Producteur artisanal engagé dans le commerce équitable, spécialisé dans les produits naturels du Maroc." readOnly />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" type="button">
                    Sauvegarder les modifications
                  </button>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Statistiques du Profil</span>
              </div>
              <div className="card-body">
                <div className="stats-list">
                  {profileStats.map((stat) => (
                    <div key={stat.label} className="profile-stat">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MainArea;
