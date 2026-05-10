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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
