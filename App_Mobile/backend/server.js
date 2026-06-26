const nodeCrypto = require("crypto");
const express = require("express");
const cors = require("cors");

const { MongoClient } = require("mongodb");
require("dotenv").config();

globalThis.crypto = globalThis.crypto || nodeCrypto.webcrypto;
global.crypto = global.crypto || nodeCrypto.webcrypto;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "PFA";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in backend/.env");
}

const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  retryWrites: true,
});
let db;
let usersCollectionName = "Users";
let productsCollectionName = "Products";
let producersCollectionName = "Producers";

function sha256(input) {
  return nodeCrypto.createHash("sha256").update(input).digest("hex");
}

async function resolveCollectionName(preferred, fallback) {
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const names = new Set(collections.map((c) => c.name));
  if (names.has(preferred)) return preferred;
  if (names.has(fallback)) return fallback;
  return fallback;
}

async function initDb() {
  await client.connect();
  db = client.db(DB_NAME);

  usersCollectionName = await resolveCollectionName("Users", "Users");
  productsCollectionName = await resolveCollectionName("Products", "Products");
  producersCollectionName = await resolveCollectionName("Producers", "Producers");
}

function usersCollection() {
  return db.collection(usersCollectionName);
}

function productsCollection() {
  return db.collection(productsCollectionName);
}

function producersCollection() {
  return db.collection(producersCollectionName);
}

function parseNumericId(value) {
  const numeric = Number.parseInt(String(value), 10);
  return Number.isNaN(numeric) ? null : numeric;
}

function mapUser(user) {
  if (!user) return null;
  return {
    id: String(user.id ?? ""),
    name: user.name,
    email: user.email,
    country: user.country,
    preferences: user.preferences ?? {},
    stats: user.stats ?? {},
    favorites: Array.isArray(user.favorites) ? user.favorites.map(String) : [],
    scan_history: Array.isArray(user.scan_history)
      ? user.scan_history.map((entry) => ({
          product_id: String(entry.product_id),
          timestamp: entry.timestamp ?? entry.scanned_at,
          was_alternative_chosen: Boolean(entry.was_alternative_chosen),
        }))
      : [],
  };
}

async function attachProducer(product) {
  if (!product) return null;
  if (product.producer) return product;

  const producerId = parseNumericId(product.producer_id);
  if (producerId == null) return product;

  const producer = await producersCollection().findOne({ id: producerId });
  return {
    ...product,
    producer:
      producer || {
        name: "Unknown",
        type: "Unknown",
        workers_count: 0,
        average_salary_usd: 0,
      },
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const passwordHash = sha256(String(password));
    const user = await usersCollection().findOne({
      email: String(email),
      password: passwordHash,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json(mapUser(user));
  } catch (error) {
    return res.status(500).json({ message: `Login failed: ${error.message}` });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, country } = req.body || {};
    if (!name || !email || !password || !country) {
      return res.status(400).json({ message: "name, email, password and country are required" });
    }

    const existing = await usersCollection().findOne({ email: String(email) });
    if (existing) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const highest = await usersCollection().find().sort({ id: -1 }).limit(1).toArray();
    const nextId = highest.length > 0 ? Number(highest[0].id || 0) + 1 : 1;

    const now = new Date().toISOString();
    const userDoc = {
      id: nextId,
      name: String(name),
      email: String(email),
      country: String(country),
      password: sha256(String(password)),
      preferences: {
        is_vegan: false,
        is_organic_focused: true,
        is_fair_trade_focused: true,
        is_local_focused: true,
        max_carbon_footprint: 7.0,
      },
      stats: {
        total_scans: 0,
        total_purchases: 0,
        ethical_awareness_score: 50,
        total_co2_saved_kg: 0.0,
      },
      favorites: [],
      scan_history: [],
      created_at: now,
      updated_at: now,
    };

    await usersCollection().insertOne(userDoc);
    return res.status(201).json(mapUser(userDoc));
  } catch (error) {
    return res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
});

app.post('/api/auth/social', async (req, res) => {
  try {
    const { provider, token, country } = req.body || {};
    if (!provider || !token) {
      return res.status(400).json({ message: 'provider and token are required' });
    }

    const normalizedProvider = String(provider).toLowerCase();
    if (!['google', 'facebook'].includes(normalizedProvider)) {
      return res.status(400).json({ message: 'Unsupported social provider' });
    }

    let socialEmail;
    let socialName;

    if (normalizedProvider === 'google') {
      const verifyResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
      );
      if (!verifyResponse.ok) {
        throw new Error('Invalid Google token');
      }
      const profile = await verifyResponse.json();
      socialEmail = profile.email;
      socialName = profile.name || profile.email?.split('@')[0] || 'Google User';
      if (!socialEmail) {
        throw new Error('Google token did not contain an email');
      }
    } else {
      const verifyResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(token)}`,
      );
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(`Invalid Facebook token: ${errorText}`);
      }
      const profile = await verifyResponse.json();
      socialEmail = profile.email;
      socialName = profile.name || `Facebook User ${profile.id ?? ''}`;
      if (!socialEmail) {
        throw new Error('Facebook token did not contain an email');
      }
    }

    const normalizedEmail = String(socialEmail).toLowerCase();
    const normalizedName = String(socialName || (normalizedProvider === 'google' ? 'Google User' : 'Facebook User'));
    let user = await usersCollection().findOne({ email: normalizedEmail });

    if (!user) {
      const highest = await usersCollection().find().sort({ id: -1 }).limit(1).toArray();
      const nextId = highest.length > 0 ? Number(highest[0].id || 0) + 1 : 1;
      const now = new Date().toISOString();
      user = {
        id: nextId,
        name: normalizedName,
        email: normalizedEmail,
        country: String(country || 'Unknown'),
        password: sha256(String(token)),
        preferences: {
          is_vegan: false,
          is_organic_focused: true,
          is_fair_trade_focused: true,
          is_local_focused: true,
          max_carbon_footprint: 7.0,
        },
        stats: {
          total_scans: 0,
          total_purchases: 0,
          ethical_awareness_score: 50,
          total_co2_saved_kg: 0.0,
        },
        favorites: [],
        scan_history: [],
        created_at: now,
        updated_at: now,
      };
      await usersCollection().insertOne(user);
    }

    return res.json(mapUser(user));
  } catch (error) {
    return res.status(500).json({ message: `Social sign-in failed: ${error.message}` });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const id = parseNumericId(req.params.id);
    if (id == null) return res.status(400).json({ message: "Invalid user id" });

    const user = await usersCollection().findOne({ id });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(mapUser(user));
  } catch (error) {
    return res.status(500).json({ message: `Fetching user failed: ${error.message}` });
  }
});

app.patch("/api/users/:id/preferences", async (req, res) => {
  try {
    const id = parseNumericId(req.params.id);
    if (id == null) return res.status(400).json({ message: "Invalid user id" });

    const preferences = req.body || {};
    await usersCollection().updateOne(
      { id },
      { $set: { preferences, updated_at: new Date().toISOString() } }
    );
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: `Updating preferences failed: ${error.message}` });
  }
});

app.post("/api/users/:id/favorites", async (req, res) => {
  try {
    const id = parseNumericId(req.params.id);
    const productId = req.body?.productId;
    if (id == null || !productId) {
      return res.status(400).json({ message: "user id and productId are required" });
    }

    await usersCollection().updateOne(
      { id },
      { $addToSet: { favorites: String(productId) }, $set: { updated_at: new Date().toISOString() } }
    );
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: `Adding favorite failed: ${error.message}` });
  }
});

app.delete("/api/users/:id/favorites/:productId", async (req, res) => {
  try {
    const id = parseNumericId(req.params.id);
    const productId = req.params.productId;
    if (id == null || !productId) {
      return res.status(400).json({ message: "user id and productId are required" });
    }

    await usersCollection().updateOne(
      { id },
      { $pull: { favorites: String(productId) }, $set: { updated_at: new Date().toISOString() } }
    );
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: `Removing favorite failed: ${error.message}` });
  }
});

app.post("/api/users/:id/scans", async (req, res) => {
  try {
    const id = parseNumericId(req.params.id);
    const productId = req.body?.productId;
    const wasAlternativeChosen = Boolean(req.body?.wasAlternativeChosen);
    if (id == null || !productId) {
      return res.status(400).json({ message: "user id and productId are required" });
    }

    await usersCollection().updateOne(
      { id },
      {
        $push: {
          scan_history: {
            product_id: String(productId),
            timestamp: new Date().toISOString(),
            was_alternative_chosen: wasAlternativeChosen,
          },
        },
        $inc: { "stats.total_scans": 1 },
        $set: { updated_at: new Date().toISOString() },
      }
    );
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: `Recording scan failed: ${error.message}` });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { category, minEthicalScore, bio, local, vegan, equitable, q } = req.query;
    const selector = {};

    if (category) selector.category = category;
    if (minEthicalScore != null) {
      selector.ethical_score = { $gt: Number(minEthicalScore) };
    }
    if (q) {
      selector.$or = [
        { name: { $regex: String(q), $options: "i" } },
      ];
    }
    if (local === "true") selector.origin_country = "France";
    if (equitable === "true") selector.fair_trade_certified = true;
    const labelFilters = [];
    if (bio === "true") labelFilters.push("Bio");
    if (vegan === "true") labelFilters.push("Vegan", "Vegan Society");

    if (labelFilters.length > 0) {
      selector.labels = { $in: labelFilters };
    }


    const products = await productsCollection().find(selector).toArray();
    const withProducers = await Promise.all(products.map(attachProducer));
    return res.json(withProducers);
  } catch (error) {
    return res.status(500).json({ message: `Fetching products failed: ${error.message}` });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const raw = req.params.id;
    const numericId = parseNumericId(raw);
    const query = numericId != null ? { id: numericId } : { barcode: raw };
    const product = await productsCollection().findOne(query);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(await attachProducer(product));
  } catch (error) {
    return res.status(500).json({ message: `Fetching product failed: ${error.message}` });
  }
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
