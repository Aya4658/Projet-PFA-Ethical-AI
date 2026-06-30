// ==================== IMPORTS ET CONFIGURATION ====================
// Ce fichier est le cœur du backend administrateur.
// Il sert à créer un serveur Express, se connecter à MongoDB, gérer l'authentification
// des administrateurs et exposer des routes API pour gérer les utilisateurs, produits,
// fournisseurs, signalements et statistiques.

// 1. On importe le module path pour manipuler les chemins de fichiers.
const path = require('path');
// 2. On charge les variables d'environnement depuis le fichier .env du dossier backend.
require('dotenv').config({ path: path.join(__dirname, '.env') });
// 3. On importe Express pour créer le serveur web.
const express = require('express');
// 4. On importe Mongoose pour communiquer avec MongoDB.
const mongoose = require('mongoose');
// 5. On importe CORS pour autoriser les appels depuis le frontend.
const cors = require('cors');
// 6. On importe bcrypt pour hacher les mots de passe.
const bcrypt = require('bcryptjs');
// 7. On importe jsonwebtoken pour créer et vérifier les tokens JWT.
const jwt = require('jsonwebtoken');
// 8. On importe nodemailer pour envoyer les emails de réinitialisation.
const nodemailer = require('nodemailer');
// 9. On importe crypto pour générer des tokens sécurisés.
const crypto = require('crypto');

// 10. On crée l’application Express qui va recevoir les requêtes.
const app = express();
// 11. On active CORS pour permettre au frontend d’envoyer des requêtes.
app.use(cors());
// 12. On dit à Express de lire automatiquement les requêtes au format JSON.
app.use(express.json());

// 13. On se connecte à MongoDB avec l’URI contenue dans la variable d’environnement.
mongoose.connect(process.env.MONGO_URI, { family: 4 })
  // 14. Si la connexion réussit, on affiche un message de confirmation.
  .then(() => console.log('✅ MongoDB PFA connecté'))
  // 15. Si la connexion échoue, on affiche l’erreur dans la console.
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// ==================== SCHÉMA ADMIN ====================
// 16. On définit la structure des documents Administrateur dans la base.
const AdminSchema = new mongoose.Schema({
  // 17. Chaque admin a un email obligatoire, unique et en minuscule.
  email: { type: String, required: true, unique: true, lowercase: true },
  // 18. Le mot de passe est obligatoire et sera haché.
  password: { type: String, required: true },
  // 19. Le prénom est facultatif avec une valeur vide par défaut.
  prenom: { type: String, default: '' },
  // 20. Le nom est facultatif avec une valeur vide par défaut.
  nom: { type: String, default: '' },
  // 21. Le téléphone est facultatif.
  telephone: { type: String, default: '' },
  // 22. Le département a une valeur par défaut.
  departement: { type: String, default: 'Direction Technique' },
  // 23. Le rôle a une valeur par défaut.
  role: { type: String, default: 'Super Administrateur' },
  // 24. La date de dernière connexion est enregistrée si nécessaire.
  lastLogin: { type: Date },
  // 25. Le token de reset peut être stocké temporairement.
  resetToken: { type: String },
  // 26. La date d’expiration de ce token est stockée aussi.
  resetTokenExpiry: { type: Date },
}, { collection: 'Admins', timestamps: true });
// 27. On précise que la collection utilisée est Admins.
// 28. Les timestamps ajoutent createdAt et updatedAt automatiquement.

// 29. On crée le modèle Admin à partir du schéma.
const Admin = mongoose.model('Admin', AdminSchema);

// ==================== ROUTES D’AUTHENTIFICATION ====================
// 30. Ces routes permettent de créer un compte, se connecter et gérer la récupération de mot de passe.

// 31. Cette route crée le premier compte admin, souvent utilisée une seule fois.
app.post('/api/auth/register', async (req, res) => {
  try {
    // 32. On récupère l’email, le mot de passe et le secret envoyés par le frontend.
    const { email, password, secret } = req.body;
    // 33. On vérifie si le secret fourni est correct.
    if (secret !== process.env.JWT_SECRET) {
      // 34. Si le secret est faux, on refuse l’accès.
      return res.status(403).json({ error: 'Accès refusé' });
    }
    // 35. On cherche si un admin avec cet email existe déjà.
    const existing = await Admin.findOne({ email });
    // 36. Si un admin existe déjà, on refuse la création.
    if (existing) return res.status(400).json({ error: 'Admin déjà existant' });
    // 37. On hache le mot de passe avant de l’enregistrer.
    const hashed = await bcrypt.hash(password, 10);
    // 38. On crée un nouvel admin avec le mot de passe haché.
    const admin = new Admin({ email, password: hashed });
    // 39. On sauvegarde l’admin dans MongoDB.
    await admin.save();
    // 40. On répond au frontend avec un message de succès.
    res.json({ message: 'Compte admin créé avec succès' });
  } catch (err) {
    // 41. Si une erreur survient, on l’envoie au frontend.
    res.status(500).json({ error: err.message });
  }
});

// 42. Cette route connecte un admin avec son email et son mot de passe.
app.post('/api/auth/login', async (req, res) => {
  try {
    // 43. On récupère l’email et le mot de passe du corps de la requête.
    const { email, password } = req.body;
    // 44. On cherche l’admin correspondant à cet email en minuscule.
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    // 45. Si l’admin n’existe pas, on refuse la connexion.
    if (!admin) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    // 46. On compare le mot de passe envoyé avec celui stocké.
    const valid = await bcrypt.compare(password, admin.password);
    // 47. Si la comparaison échoue, on refuse la connexion.
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    // 48. On met à jour la date de dernière connexion.
    admin.lastLogin = new Date();
    // 49. On sauvegarde cette modification.
    await admin.save();

    // 50. On crée un token JWT valable 8 heures.
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    // 51. On renvoie le token et l’email de l’admin.
    res.json({ token, email: admin.email });
  } catch (err) {
    // 52. En cas d’erreur, on envoie un message d’erreur.
    res.status(500).json({ error: err.message });
  }
});

// 53. Cette route récupère le profil de l’admin connecté avec un token JWT.
app.get('/api/auth/profile', async (req, res) => {
  try {
    // 54. On récupère l’en-tête Authorization de la requête.
    const authHeader = req.headers.authorization;
    // 55. Si le token manque, on refuse l’accès.
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
    // 56. On extrait le token depuis l’en-tête.
    const token = authHeader.split(' ')[1];
    // 57. On vérifie la validité du token à l’aide du secret.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 58. On cherche l’admin correspondant à l’identifiant contenu dans le token.
    const admin = await Admin.findById(decoded.id).select('-password -resetToken -resetTokenExpiry');
    // 59. Si aucun admin n’est trouvé, on envoie une erreur 404.
    if (!admin) return res.status(404).json({ error: 'Admin non trouvé' });
    // 60. On renvoie le profil sans les données sensibles.
    res.json(admin);
  } catch (err) {
    // 61. Si le token est invalide, on renvoie une erreur 401.
    res.status(401).json({ error: 'Token invalide' });
  }
});

// 62. Cette route permet de modifier les informations du profil de l’admin.
app.put('/api/auth/profile', async (req, res) => {
  try {
    // 63. On récupère l’en-tête Authorization.
    const authHeader = req.headers.authorization;
    // 64. Si l’en-tête manque, on refuse l’opération.
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
    // 65. On récupère le token JWT.
    const token = authHeader.split(' ')[1];
    // 66. On vérifie la validité du token.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 67. On récupère les nouvelles valeurs du profil du corps de la requête.
    const { prenom, nom, telephone, departement } = req.body;
    // 68. On met à jour l’admin dans MongoDB.
    const admin = await Admin.findByIdAndUpdate(
      decoded.id,
      { $set: { prenom, nom, telephone, departement } },
      { new: true }
    ).select('-password -resetToken -resetTokenExpiry');
    // 69. On envoie le profil mis à jour au frontend.
    res.json(admin);
  } catch (err) {
    // 70. Si le token est invalide, on renvoie une erreur.
    res.status(401).json({ error: 'Token invalide' });
  }
});

// 71. Cette route envoie un email de réinitialisation du mot de passe.
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    // 72. On récupère l’email envoyé par le frontend.
    const { email } = req.body;
    // 73. On cherche l’admin correspondant à cet email.
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    // 74. Si aucun compte n’existe, on renvoie une erreur 404.
    if (!admin) return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });

    // 75. On génère un token aléatoire sécurisé.
    const token = crypto.randomBytes(32).toString('hex');
    // 76. On enregistre ce token dans le document de l’admin.
    admin.resetToken = token;
    // 77. On définit une date d’expiration dans 1 heure.
    admin.resetTokenExpiry = new Date(Date.now() + 3600000);
    // 78. On sauvegarde la modification dans la base.
    await admin.save();

    // 79. On crée un transporteur pour envoyer l’email.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        // 80. L’adresse Gmail de l’expéditeur vient de la variable d’environnement.
        user: process.env.GMAIL_USER,
        // 81. Le mot de passe d’application Gmail vient aussi de la variable d’environnement.
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 82. On construit le lien de réinitialisation.
    const resetLink = `http://localhost:5173/?reset=${token}`;
    // 83. On envoie l’email avec le lien de réinitialisation.
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

    // 84. On confirme au frontend que l’email a bien été envoyé.
    res.json({ message: 'Email de réinitialisation envoyé' });
  } catch (err) {
    // 85. Si une erreur survient, on envoie un message d’erreur.
    res.status(500).json({ error: err.message });
  }
});

// 86. Cette route permet de changer le mot de passe après validation du token.
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    // 87. On récupère le token et le nouveau mot de passe.
    const { token, password } = req.body;
    // 88. On cherche un admin avec ce token encore valide.
    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    // 89. Si aucun token valide n’existe, on refuse la réinitialisation.
    if (!admin) return res.status(400).json({ error: 'Lien invalide ou expiré' });
    // 90. On hache le nouveau mot de passe.
    admin.password = await bcrypt.hash(password, 10);
    // 91. On supprime le token après utilisation.
    admin.resetToken = undefined;
    // 92. On supprime aussi la date d’expiration.
    admin.resetTokenExpiry = undefined;
    // 93. On sauvegarde la mise à jour dans la base.
    await admin.save();
    // 94. On confirme la réussite au frontend.
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    // 95. Si une erreur survient, on envoie un message d’erreur.
    res.status(500).json({ error: err.message });
  }
});

// ==================== SCHÉMAS FLEXIBLES POUR LES AUTRES COLLECTIONS ====================
// Ces schémas sont flexibles, ce qui signifie qu'ils acceptent des champs variables sans erreur.
// Cela est utile parce que les collections MongoDB peuvent avoir des structures différentes selon les données.

const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'Users' });
// Schéma pour la collection Users, avec des champs dynamiques acceptés.
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({}, { strict: false, collection: 'Products' });
// Schéma pour la collection Products.
const Product = mongoose.model('Product', ProductSchema);

const ProducerSchema = new mongoose.Schema({}, { strict: false, collection: 'Producers' });
// Schéma pour la collection Producers.
const Producer = mongoose.model('Producer', ProducerSchema);

// Fonction utilitaire pour normaliser les données utilisateur avant de les envoyer au frontend.
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

// Route GET pour récupérer tous les utilisateurs depuis la base de données.
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(normalizeUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route PATCH pour changer le statut d'un utilisateur (actif, bloqué, etc.).
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

// Route PUT pour modifier les informations d'un utilisateur.
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

// Route DELETE pour supprimer un utilisateur de la base.
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES DES SIGNALEMENTS ====================
// Ces routes permettent d'afficher, modifier et supprimer les signalements envoyés par les utilisateurs.

const ReportSchema = new mongoose.Schema({}, { strict: false, collection: 'reports' });
// Schéma flexible pour la collection reports.
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

// Route GET pour récupérer la liste des signalements triés par date de création.
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ created_at: -1 });
    res.json(reports.map(normalizeReport));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route PATCH pour mettre à jour le statut d'un signalement et ajouter des notes de modération.
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

// Route DELETE pour supprimer un signalement.
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Signalement non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTE DES STATISTIQUES ====================
// Cette route prépare des données agrégées pour l'interface d'administration.

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

// ==================== ROUTES DES FOURNISSEURS ====================
// Ces routes permettent de gérer les fournisseurs enregistrés dans la base.

app.get('/api/producers', async (req, res) => {
  try {
    const producers = await Producer.find();
    res.json(producers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route GET pour récupérer un fournisseur spécifique par son identifiant.
app.get('/api/producers/:id', async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id);
    if (!producer) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.json(producer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route POST pour créer un nouveau fournisseur.
app.post('/api/producers', async (req, res) => {
  try {
    const producer = new Producer(req.body);
    await producer.save();
    res.status(201).json(producer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route PUT pour modifier un fournisseur existant.
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

// Route DELETE pour supprimer un fournisseur.
app.delete('/api/producers/:id', async (req, res) => {
  try {
    const producer = await Producer.findByIdAndDelete(req.params.id);
    if (!producer) return res.status(404).json({ error: 'Fournisseur non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES DES PRODUITS ====================
// Ces routes permettent de gérer les produits dans l'administration.

// Route GET pour récupérer tous les produits.
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route GET pour récupérer un produit précis via son identifiant.
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route POST pour créer un nouveau produit.
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route PUT pour mettre à jour complètement un produit depuis l'interface.
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

// Route DELETE pour supprimer un produit.
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DÉMARRAGE DU SERVEUR ====================
// Le serveur écoute sur un port défini par la variable d'environnement PORT ou par défaut 5000.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // On affiche quelques URLs utiles pour tester l'API dans la console.
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📋 API Users:        http://localhost:${PORT}/api/users`);
  console.log(`📦 API Products:     http://localhost:${PORT}/api/products`);
  console.log(`🏭 API Producers:    http://localhost:${PORT}/api/producers`);
  console.log(`🚨 API Reports:      http://localhost:${PORT}/api/reports`);
  console.log(`📊 API Statistics:   http://localhost:${PORT}/api/statistics`);
});
