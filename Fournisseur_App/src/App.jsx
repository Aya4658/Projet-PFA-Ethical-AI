import { useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '🌿', badge: null },
  { id: 'products', label: 'Mes Produits', icon: '📦', badge: '12' },
  { id: 'add', label: 'Ajouter Produit', icon: '➕', badge: null },
  { id: 'blockchain', label: 'Blockchain', icon: '⛓️', badge: null },
  { id: 'certifs', label: 'Certifications', icon: '🏅', badge: null },
  { id: 'profile', label: 'Mon Profil', icon: '👤', badge: null },
];

const statCards = [
  { id: 1, variant: 'green', icon: '📦', value: '12', label: 'Produits enregistrés', trend: '↑ +3 ce mois', trendType: 'up' },
  { id: 2, variant: 'gold', icon: '⛓️', value: '48', label: 'Transactions Blockchain', trend: '↑ Tout validé', trendType: 'up' },
  { id: 3, variant: 'blue', icon: '👁️', value: '1.2k', label: 'Scans QR Code', trend: '↑ +18% semaine', trendType: 'up' },
  { id: 4, variant: 'purple', icon: '⭐', value: '4.8', label: 'Note consommateurs', trend: '↑ Excellent', trendType: 'up' },
];

const recentProducts = [
  { id: 'PRD-001', emoji: '🍯', name: 'Miel de Montagne Bio', category: 'Alimentaire', status: '✔ Validé', statusClass: 'pill-blue' },
  { id: 'PRD-002', emoji: '🧵', name: 'Tissu Artisanal Berbère', category: 'Textile', status: '✔ Validé', statusClass: 'pill-blue' },
  { id: 'PRD-003', emoji: '🫒', name: 'Huile d\'Argan Pure', category: 'Cosmétique', status: '⏳ En attente', statusClass: 'pill-amber' },
  { id: 'PRD-004', emoji: '🌿', name: 'Thé à la Menthe Fès', category: 'Alimentaire', status: '✔ Validé', statusClass: 'pill-blue' },
];

const blockchainFeed = [
  { id: 1, status: 'confirmed', title: 'Enregistrement produit #PRD-004', hash: '0x3f7a...bc42', time: '2h ago' },
  { id: 2, status: 'confirmed', title: 'Certification ajoutée #PRD-001', hash: '0x8d1c...f391', time: '1j ago' },
  { id: 3, status: 'pending', title: 'Validation #PRD-003 en cours...', hash: '0xa2e5...7b0d', time: 'En cours' },
  { id: 4, status: 'confirmed', title: 'Mise à jour traçabilité #PRD-002', hash: '0x61f9...c84e', time: '3j ago' },
  { id: 5, status: 'confirmed', title: 'Enregistrement #PRD-002', hash: '0x0d3b...aa91', time: '1 sem' },
];

const impactScores = [
  { label: '🌱 Score Écologique', value: 82, color: 'var(--leaf)' },
  { label: '🤝 Équité salariale', value: 91, color: 'var(--sage)' },
  { label: '♻️ Durabilité emballage', value: 67, color: 'var(--amber)' },
  { label: '🌍 Empreinte carbone', value: 74, color: 'var(--gold)' },
];

const certificationsData = [
  { icon: '🌿', title: 'Fair Trade Certified', subtitle: 'Valide jusqu\'au 12/2025', status: 'Active', statusClass: 'pill-green' },
  { icon: '🌾', title: 'Agriculture Biologique', subtitle: 'Valide jusqu\'au 06/2026', status: 'Active', statusClass: 'pill-green' },
  { icon: '🏅', title: 'ISO 26000 RSE', subtitle: 'Renouvellement requis', status: 'Expirée', statusClass: 'pill-amber', expired: true },
];

const productList = [
  { id: 'PRD-001', emoji: '🍯', name: 'Miel de Montagne Bio', sku: '#PRD-001', category: 'Alimentaire', price: '85 MAD', status: 'Validés', scans: 423, hash: '0x3f7a...bc42' },
  { id: 'PRD-002', emoji: '🧵', name: 'Tissu Artisanal Berbère', sku: '#PRD-002', category: 'Textile', price: '320 MAD', status: 'Validés', scans: 187, hash: '0x8d1c...f391' },
  { id: 'PRD-003', emoji: '🫒', name: 'Huile d\'Argan Pure', sku: '#PRD-003', category: 'Cosmétique', price: '145 MAD', status: 'En attente', scans: 0, hash: '— En cours' },
  { id: 'PRD-004', emoji: '🌿', name: 'Thé à la Menthe Fès', sku: '#PRD-004', category: 'Alimentaire', price: '45 MAD', status: 'Validés', scans: 612, hash: '0x61f9...c84e' },
  { id: 'PRD-005', emoji: '🧴', name: 'Savon Beldi Traditionnel', sku: '#PRD-005', category: 'Cosmétique', price: '35 MAD', status: 'Validés', scans: 284, hash: '0x2ab7...d01f' },
];

const sidebarProfile = {
  initials: 'A',
  name: 'Aya Adlouni',
  role: 'Fournisseur certifié',
};

const profileStats = [
  { label: 'Produits enregistrés', value: '12' },
  { label: 'Certifications actives', value: '2' },
  { label: 'Total scans QR', value: '1,238' },
  { label: 'Note moyenne', value: '4.8 / 5' },
  { label: 'Membre depuis', value: 'Janv. 2025' },
];

const networkStats = [
  { label: 'Total Tx', value: '48', bg: 'var(--cream)', color: 'var(--leaf)' },
  { label: 'En attente', value: '1', bg: 'var(--cream)', color: 'var(--amber)' },
  { label: 'Échoués', value: '0', bg: 'var(--cream)', color: 'var(--forest)' },
];

const certificationTags = [
  '🌿 Fair Trade',
  '🌾 Bio / Organique',
  '♻️ Eco-label',
  '🤝 Commerce équitable',
  '🌍 Carbon Neutral',
  '🏅 ISO 26000',
];

const sectionTitles = {
  dashboard: 'Tableau de bord',
  products: 'Mes Produits',
  add: 'Ajouter un Produit',
  blockchain: 'Blockchain',
  certifs: 'Certifications',
  profile: 'Mon Profil',
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [formData, setFormData] = useState({
    pName: '',
    pCat: '',
    pOrigin: '',
    pPrice: '',
    pDesc: '',
    pSteps: '',
    pSocial: '',
    pCarbon: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [txHash, setTxHash] = useState('0x3f7a...bc42');
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('Tous');

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchesQuery = [product.name, product.sku, product.category].some((field) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesFilter = productFilter === 'Tous' || product.status === productFilter;
      return matchesQuery && matchesFilter;
    });
  }, [searchQuery, productFilter]);

  const handleInput = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCert = (tag) => {
    setSelectedCerts((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const submitProduct = () => {
    const hash = `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`;
    setTxHash(hash);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveTab('products');
  };

  return (
    <div className="app">
      <Sidebar navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} sidebarProfile={sidebarProfile} />
      <MainArea
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sectionTitles={sectionTitles}
        statCards={statCards}
        recentProducts={recentProducts}
        blockchainFeed={blockchainFeed}
        impactScores={impactScores}
        certificationsData={certificationsData}
        productList={productList}
        filteredProducts={filteredProducts}
        searchQuery={searchQuery}
        productFilter={productFilter}
        setSearchQuery={setSearchQuery}
        setProductFilter={setProductFilter}
        formData={formData}
        handleInput={handleInput}
        certificationTags={certificationTags}
        selectedCerts={selectedCerts}
        toggleCert={toggleCert}
        submitProduct={submitProduct}
        networkStats={networkStats}
        profileStats={profileStats}
      />
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-icon">⛓✅</div>
            <div className="modal-title">Produit enregistré !</div>
            <div className="modal-copy">Votre produit a été enregistré avec succès sur la Blockchain EthiChain. Un QR Code unique a été généré.</div>
            <div className="modal-hash">Hash: {txHash}</div>
            <button className="btn btn-primary" type="button" onClick={closeModal}>
              Parfait !
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
