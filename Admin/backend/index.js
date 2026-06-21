require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => console.log('✅ MongoDB PFA connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Schema flexible pour s'adapter à la structure existante de la collection Users
const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'Users' });
const User = mongoose.model('User', UserSchema);

// Schema flexible pour la collection Products
const ProductSchema = new mongoose.Schema({}, { strict: false, collection: 'Products' });
const Product = mongoose.model('Product', ProductSchema);

// Schema flexible pour la collection Producers
const ProducerSchema = new mongoose.Schema({}, { strict: false, collection: 'Producers' });
const Producer = mongoose.model('Producer', ProducerSchema);

function normalizeUser(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  const prenom = obj.prenom || '';
  const nomFamille = obj.nomFamille || obj.nom_famille || '';
  const fullName =
    obj.nom ||
    obj.name ||
    (prenom && nomFamille ? `${prenom} ${nomFamille}` : prenom || nomFamille) ||
    'Inconnu';

  let statut = obj.statut;
  if (!statut) {
    if (obj.status === 'active' || obj.status === 'Actif') statut = 'Actif';
    else if (obj.status === 'blocked' || obj.status === 'Bloqué' || obj.isBlocked) statut = 'Bloqué';
    else statut = 'Actif';
  }

  let inscription = obj.inscription || obj.dateInscription || obj.date_inscription;
  if (!inscription && obj.createdAt) {
    inscription = new Date(obj.createdAt).toLocaleDateString('fr-FR');
  }

  return {
    id: obj._id.toString(),
    nom: fullName,
    email: obj.email || '',
    statut,
    inscription: inscription || '',
  };
}

// GET tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(normalizeUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH statut (bloquer / débloquer)
app.patch('/api/users/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { statut } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(normalizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un utilisateur
app.put('/api/users/:id', async (req, res) => {
  try {
    const { nom, email, statut, inscription } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { nom, email, statut, inscription } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(normalizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un utilisateur
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES PRODUCERS (FOURNISSEURS) ====================

app.get('/api/producers', async (req, res) => {
  try {
    const producers = await Producer.find();
    res.json(producers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/producers/:id', async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id);
    if (!producer) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.json(producer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/producers', async (req, res) => {
  try {
    const producer = new Producer(req.body);
    await producer.save();
    res.status(201).json(producer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/producers/:id', async (req, res) => {
  try {
    const producer = await Producer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!producer) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.json(producer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/producers/:id', async (req, res) => {
  try {
    const producer = await Producer.findByIdAndDelete(req.params.id);
    if (!producer) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES PRODUCTS ====================

// GET tous les produits
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un produit par ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un nouveau produit
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un produit (mise à jour complète depuis le front)
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📋 API Users:     http://localhost:${PORT}/api/users`);
  console.log(`📦 API Products:  http://localhost:${PORT}/api/products`);
  console.log(`🏭 API Producers: http://localhost:${PORT}/api/producers`);
});
