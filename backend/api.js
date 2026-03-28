export const navItems = [
  { id: 'dashboard', icon: '🌿', label: 'Tableau de bord' },
  { id: 'products', icon: '📦', label: 'Mes Produits', badge: '12' },
  { id: 'add', icon: '➕', label: 'Ajouter Produit' },
  { id: 'blockchain', icon: '⛓️', label: 'Blockchain' },
  { id: 'certifs', icon: '🏅', label: 'Certifications' },
  { id: 'profile', icon: '👤', label: 'Mon Profil' },
];

export const titles = {
  dashboard: 'Tableau de bord',
  products: 'Mes Produits',
  add: 'Ajouter un Produit',
  blockchain: 'Blockchain',
  certifs: 'Certifications',
  profile: 'Mon Profil',
};

export const stats = [
  { icon: '📦', value: '12', label: 'Produits enregistrés', trend: '↑ +3 ce mois', trendClass: 'up', cardClass: 'green' },
  { icon: '⛓️', value: '48', label: 'Transactions Blockchain', trend: '↑ Tout validé', trendClass: 'up', cardClass: 'gold' },
  { icon: '👁️', value: '1.2k', label: 'Scans QR Code', trend: '↑ +18% semaine', trendClass: 'up', cardClass: 'blue' },
  { icon: '⭐', value: '4.8', label: 'Note consommateurs', trend: '↑ Excellent', trendClass: 'up', cardClass: 'purple' },
];

export const recentProducts = [
  { icon: '🍯', name: 'Miel de Montagne Bio', sku: '#PRD-001', category: 'Alimentaire', categoryClass: 'pill-green', status: '✔ Validé', statusClass: 'pill-blue', qr: '📱' },
  { icon: '🧵', name: 'Tissu Artisanal Berbère', sku: '#PRD-002', category: 'Textile', categoryClass: 'pill-amber', status: '✔ Validé', statusClass: 'pill-blue', qr: '📱' },
  { icon: '🫒', name: 'Huile d\'Argan Pure', sku: '#PRD-003', category: 'Cosmétique', categoryClass: 'pill-green', status: '⏳ En attente', statusClass: 'pill-amber', qr: '—' },
  { icon: '🌿', name: 'Thé à la Menthe Fès', sku: '#PRD-004', category: 'Alimentaire', categoryClass: 'pill-green', status: '✔ Validé', statusClass: 'pill-blue', qr: '📱' },
];

export const blockchainActivity = [
  { statusClass: 'confirmed', title: 'Enregistrement produit #PRD-004', hash: '0x3f7a...bc42', time: '2h ago' },
  { statusClass: 'confirmed', title: 'Certification ajoutée #PRD-001', hash: '0x8d1c...f391', time: '1j ago' },
  { statusClass: 'pending', title: 'Validation #PRD-003 en cours...', hash: '0xa2e5...7b0d', time: 'En cours' },
  { statusClass: 'confirmed', title: 'Mise à jour traçabilité #PRD-002', hash: '0x61f9...c84e', time: '3j ago' },
  { statusClass: 'confirmed', title: 'Enregistrement #PRD-002', hash: '0x0d3b...aa91', time: '1 sem' },
];

export const impactItems = [
  { label: '🌱 Score Écologique', value: '82 / 100', width: '82%', color: 'var(--leaf)' },
  { label: '🤝 Équité salariale', value: '91 / 100', width: '91%', color: 'var(--sage)' },
  { label: '♻️ Durabilité emballage', value: '67 / 100', width: '67%', color: 'var(--amber)' },
  { label: '🌍 Empreinte carbone', value: '74 / 100', width: '74%', color: 'var(--gold)' },
];

export const certificationBlocks = [
  { icon: '🌿', title: 'Fair Trade Certified', subtitle: 'Valide jusqu\'au 12/2025', badge: 'Active', badgeClass: 'pill-green', warning: false },
  { icon: '🌾', title: 'Agriculture Biologique', subtitle: 'Valide jusqu\'au 06/2026', badge: 'Active', badgeClass: 'pill-green', warning: false },
  { icon: '🏅', title: 'ISO 26000 RSE', subtitle: 'Renouvellement requis', badge: 'Expirée', badgeClass: 'pill-amber', warning: true },
];

export const productsList = [
  { icon: '🍯', name: 'Miel de Montagne Bio', sku: '#PRD-001', category: 'Alimentaire', categoryClass: 'pill-green', price: '85 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 423, blockchain: '0x3f7a...bc42' },
  { icon: '🧵', name: 'Tissu Artisanal Berbère', sku: '#PRD-002', category: 'Textile', categoryClass: 'pill-amber', price: '320 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 187, blockchain: '0x8d1c...f391' },
  { icon: '🫒', name: 'Huile d\'Argan Pure', sku: '#PRD-003', category: 'Cosmétique', categoryClass: 'pill-green', price: '145 MAD', status: '⏳ En attente', statusClass: 'pill-amber', scans: 0, blockchain: '— En cours' },
  { icon: '🌿', name: 'Thé à la Menthe Fès', sku: '#PRD-004', category: 'Alimentaire', categoryClass: 'pill-green', price: '45 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 612, blockchain: '0x61f9...c84e' },
  { icon: '🧴', name: 'Savon Beldi Traditionnel', sku: '#PRD-005', category: 'Cosmétique', categoryClass: 'pill-green', price: '35 MAD', status: '✔ Validé', statusClass: 'pill-blue', scans: 284, blockchain: '0x2ab7...d01f' },
];

export const transactions = [
  { hash: '0x3f7a...bc42', type: 'Enregistrement', product: '#PRD-004', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '28/03/2026 14:32' },
  { hash: '0x8d1c...f391', type: 'Certification', product: '#PRD-001', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '27/03/2026 09:15' },
  { hash: '0xa2e5...7b0d', type: 'Enregistrement', product: '#PRD-003', badge: '⏳ Pending', badgeClass: 'pill-amber', date: '28/03/2026 16:20' },
  { hash: '0x61f9...c84e', type: 'Mise à jour', product: '#PRD-002', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '25/03/2026 11:40' },
  { hash: '0x0d3b...aa91', type: 'Enregistrement', product: '#PRD-002', badge: '✔ Confirmé', badgeClass: 'pill-green', date: '21/03/2026 08:00' },
];

export const profileStats = [
  { label: '📦 Produits enregistrés', value: '12' },
  { label: '🏅 Certifications actives', value: '2' },
  { label: '👁️ Total scans QR', value: '1,238' },
  { label: '⭐ Note moyenne', value: '4.8 / 5' },
  { label: '📅 Membre depuis', value: 'Janv. 2025' },
];

export const certTags = [
  '🌿 Fair Trade',
  '🌾 Bio / Organique',
  '♻️ Eco-label',
  '🤝 Commerce équitable',
  '🌍 Carbon Neutral',
  '🏅 ISO 26000',
];

export const initialForm = {
  name: '',
  category: '',
  origin: '',
  price: '',
  desc: '',
  steps: '',
  social: '',
  carbon: '',
};

export function getDashboardData() {
  return {
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
    initialForm,
  };
}

export function submitProductBackend(formData, selectedCerts) {
  const txHash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;
  return {
    success: true,
    txHash,
    savedProduct: {
      ...formData,
      certifications: selectedCerts,
      id: `#PRD-${Math.floor(100 + Math.random() * 900)}`,
      blockchainHash: txHash,
    },
  };
}
