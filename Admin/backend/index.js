const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => console.log('✅ MongoDB PFA connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// ==================== SCHEMA ADMIN ====================

const AdminSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true, lowercase: true },
  password:         { type: String, required: true },
  prenom:           { type: String, default: '' },
  nom:              { type: String, default: '' },
  telephone:        { type: String, default: '' },
  departement:      { type: String, default: 'Direction Technique' },
  role:             { type: String, default: 'Super Administrateur' },
  lastLogin:        { type: Date },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },
}, { collection: 'Admins', timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

// ==================== ROUTES AUTH ====================

// Créer le premier compte admin (utilisé une seule fois pour l'initialisation)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, secret } = req.body;
    if (secret !== process.env.JWT_SECRET) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Admin déjà existant' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashed });
    await admin.save();
    res.json({ message: 'Compte admin créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    // Sauvegarder la date de dernière connexion
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, email: admin.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer le profil admin (route protégée par JWT)
app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password -resetToken -resetTokenExpiry');
    if (!admin) return res.status(404).json({ error: 'Admin non trouvé' });
    res.json(admin);
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

// Modifier le profil admin
app.put('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { prenom, nom, telephone, departement } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      decoded.id,
      { $set: { prenom, nom, telephone, departement } },
      { new: true }
    ).select('-password -resetToken -resetTokenExpiry');
    res.json(admin);
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

// Mot de passe oublié → envoie un email de réinitialisation
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });

    const token = crypto.randomBytes(32).toString('hex');
    admin.resetToken = token;
    admin.resetTokenExpiry = new Date(Date.now() + 3600000); // expire dans 1h
    await admin.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const resetLink = `http://localhost:5173/?reset=${token}`;
    await transporter.sendMail({
      from: `"EthicChain Admin" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe — EthicChain Admin',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#1b5e20;margin-bottom:16px;">🌿 EthicChain Admin</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p style="margin:24px 0;">
            <a href="${resetLink}"
               style="background:#1b5e20;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px;">Ce lien expire dans <strong>1 heure</strong>.<br>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        </div>
      `,
    });

    res.json({ message: 'Email de réinitialisation envoyé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Réinitialiser le mot de passe avec le token reçu par email
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!admin) return res.status(400).json({ error: 'Lien invalide ou expiré' });
    admin.password = await bcrypt.hash(password, 10);
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    await admin.save();
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

  const statut = obj.status || obj.statut || 'Actif';

  let inscription = obj.inscription_date || obj.inscription || obj.dateInscription || obj.date_inscription;
  if (inscription && /^\d{4}-\d{2}-\d{2}$/.test(inscription)) {
    inscription = new Date(inscription + 'T00:00:00').toLocaleDateString('fr-FR');
  } else if (!inscription && obj.createdAt) {
    inscription = new Date(obj.createdAt).toLocaleDateString('fr-FR');
  }

  return {
    id: obj._id.toString(),
    nom: fullName,
    email: obj.email || '',
    statut,
    inscription: inscription || '',
    country: obj.country || '',
    stats: obj.stats || {},
    favorites: obj.favorites || [],
    scan_history: obj.scan_history || [],
    raw: {
      inscription_date: obj.inscription_date || '',
      createdAt: obj.createdAt || null,
    },
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
      { $set: { status: statut, statut } },
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
    const update = { nom, name: nom, email, status: statut, statut };
    if (inscription) {
      const iso = inscription.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
        ? `${inscription.slice(6, 10)}-${inscription.slice(3, 5)}-${inscription.slice(0, 2)}`
        : inscription;
      update.inscription_date = iso;
      update.inscription = inscription;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
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

// ==================== ROUTES REPORTS (SIGNALEMENTS) ====================

const ReportSchema = new mongoose.Schema({}, { strict: false, collection: 'reports' });
const Report = mongoose.model('Report', ReportSchema);

function normalizeReport(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    reportId: obj.id,
    report_code: obj.report_code || '',
    user_id: obj.user_id,
    username: obj.username || '',
    product_id: obj.product_id,
    reason: obj.reason || '',
    description: obj.description || '',
    status: obj.status || 'En attente',
    created_at: obj.created_at || null,
    resolved_at: obj.resolved_at || null,
    moderator_notes: obj.moderator_notes || '',
  };
}

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ created_at: -1 });
    res.json(reports.map(normalizeReport));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/reports/:id', async (req, res) => {
  try {
    const { status, moderator_notes } = req.body;
    const update = {};
    if (status) {
      update.status = status;
      if (['Résolu', 'Rejeté'].includes(status)) {
        update.resolved_at = new Date().toISOString();
      }
    }
    if (moderator_notes !== undefined) update.moderator_notes = moderator_notes;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Signalement non trouvé' });
    res.json(normalizeReport(report));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Signalement non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES STATISTIQUES ====================

app.get('/api/statistics', async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const [
      usersTotal,
      usersByStatus,
      productsTotal,
      productsByCategory,
      avgRating,
      producersTotal,
      reportsTotal,
      reportsByStatus,
      reportsByReason,
      activity,
      usersByCountry,
    ] = await Promise.all([
      db.collection('Users').countDocuments(),
      db.collection('Users').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray(),
      db.collection('Products').countDocuments(),
      db.collection('Products').aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]).toArray(),
      db.collection('Products').aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]).toArray(),
      db.collection('Producers').countDocuments(),
      db.collection('reports').countDocuments(),
      db.collection('reports').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray(),
      db.collection('reports').aggregate([{ $group: { _id: '$reason', count: { $sum: 1 } } }]).toArray(),
      db.collection('Users').aggregate([{
        $group: {
          _id: null,
          totalScans: { $sum: '$stats.total_scans' },
          totalPurchases: { $sum: '$stats.total_purchases' },
          avgEthicalScore: { $avg: '$stats.ethical_awareness_score' },
          totalCo2Saved: { $sum: '$stats.total_co2_saved_kg' },
        },
      }]).toArray(),
      db.collection('Users').aggregate([{ $group: { _id: '$country', count: { $sum: 1 } } }]).toArray(),
    ]);

    const toMap = (arr) => Object.fromEntries(arr.map(r => [r._id || 'Inconnu', r.count]));

    res.json({
      users: {
        total: usersTotal,
        byStatus: toMap(usersByStatus),
      },
      products: {
        total: productsTotal,
        byCategory: toMap(productsByCategory),
        avgRating: avgRating[0]?.avg ? Math.round(avgRating[0].avg * 10) / 10 : 0,
      },
      producers: { total: producersTotal },
      reports: {
        total: reportsTotal,
        byStatus: toMap(reportsByStatus),
        byReason: toMap(reportsByReason),
      },
      activity: {
        totalScans: activity[0]?.totalScans || 0,
        totalPurchases: activity[0]?.totalPurchases || 0,
        avgEthicalScore: activity[0]?.avgEthicalScore ? Math.round(activity[0].avgEthicalScore) : 0,
        totalCo2Saved: activity[0]?.totalCo2Saved ? Math.round(activity[0].totalCo2Saved * 100) / 100 : 0,
      },
      usersByCountry: toMap(usersByCountry),
      generatedAt: new Date().toISOString(),
    });
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
  console.log(`📋 API Users:        http://localhost:${PORT}/api/users`);
  console.log(`📦 API Products:     http://localhost:${PORT}/api/products`);
  console.log(`🏭 API Producers:    http://localhost:${PORT}/api/producers`);
  console.log(`🚨 API Reports:      http://localhost:${PORT}/api/reports`);
  console.log(`📊 API Statistics:   http://localhost:${PORT}/api/statistics`);
});
