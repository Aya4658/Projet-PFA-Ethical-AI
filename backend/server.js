import express from 'express';
import cors from 'cors';
import { submitProductBackend, getDashboardData } from './api.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EthiChain backend is running' });
});

app.get('/api/dashboard', (req, res) => {
  res.json({ success: true, data: getDashboardData() });
});

app.post('/api/products', (req, res) => {
  const { formData, selectedCerts } = req.body;

  if (!formData) {
    return res.status(400).json({ success: false, message: 'Missing formData' });
  }

  const result = submitProductBackend(formData, selectedCerts || []);
  return res.json(result);
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`EthiChain backend running on http://localhost:${PORT}`);
});
