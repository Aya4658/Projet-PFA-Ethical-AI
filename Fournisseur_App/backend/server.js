import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Supplier from './models/Supplier.js';
import Product from './models/Product.js';
import BlockchainEvent from './models/BlockchainEvent.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ethichain';

mongoose.set('strictQuery', true);
await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const seedDatabase = async () => {
  const supplierCount = await Supplier.countDocuments();
  if (supplierCount === 0) {
    await Supplier.insertMany([
      { id: 1, name: 'Société Alpha', email: 'contact@alpha.com', phone: '+212600000001', country: 'Maroc' },
      { id: 2, name: 'Beta Fournitures', email: 'info@beta.com', phone: '+212600000002', country: 'France' }
    ]);
    console.log('Seeded initial suppliers');
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      { id: 101, name: 'Huile d\'olive bio', sku: 'HU-OL-001', price: 12.5, stock: 120, producer: 'Oliviers du Sud', country: 'Maroc', certificates: [] },
      { id: 102, name: 'Savon naturel', sku: 'SV-NAT-002', price: 4.2, stock: 80, producer: 'Savonnerie Verte', country: 'France', certificates: [] }
    ]);
    console.log('Seeded initial products');
  }
};

await seedDatabase();

app.use(cors());
app.use(express.json());

app.get('/api/suppliers', async (req, res) => {
  const suppliers = await Supplier.find().sort({ id: -1 });
  res.json(suppliers);
});

app.post('/api/suppliers', async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.json(supplier);
});

app.delete('/api/suppliers/:id', async (req, res) => {
  const supplier = await Supplier.findOneAndDelete({ id: Number(req.params.id) });
  if (!supplier) return res.status(404).json({ error: 'Fournisseur introuvable' });
  res.json({ success: true });
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find().sort({ id: -1 });
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
  const product = await Product.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
  const product = await Product.findOneAndDelete({ id: Number(req.params.id) });
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  res.json({ success: true });
});

app.get('/api/blockchain', async (req, res) => {
  const query = {};
  if (req.query.productId) query.productId = Number(req.query.productId);
  const events = await BlockchainEvent.find(query).sort({ ts: -1 });
  res.json(events);
});

app.post('/api/blockchain', async (req, res) => {
  const event = await BlockchainEvent.create(req.body);
  res.json(event);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
