const nodeCrypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { StringDecoder } = require("string_decoder");
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

function normalizeSourceTag(sourceTag) {
  if (!sourceTag) return null;
  const normalized = String(sourceTag).toLowerCase();
  if (normalized === "openfoodfact" || normalized === "openfoodfacts") {
    return "openFoodFacts";
  }
  if (normalized === "ethico" || normalized === "mongodb") {
    return "mongodb";
  }
  return String(sourceTag);
}

function serializeProductFavorite(item) {
  if (item == null) return "";
  if (typeof item === "string" || typeof item === "number") {
    return String(item);
  }
  if (typeof item === "object") {
    const productId = String(item.product_id ?? item.id ?? "");
    const sourceTag = normalizeSourceTag(item.source_tag ?? item.sourceTag ?? item.source);
    return sourceTag ? `${sourceTag}:${productId}` : productId;
  }
  return "";
}

function parseSourceTaggedProductId(raw) {
  const value = String(raw ?? "");
  const separatorIndex = value.indexOf(":");
  if (separatorIndex <= 0) {
    return { source: null, id: value };
  }

  const prefix = value.slice(0, separatorIndex);
  const candidate = normalizeSourceTag(prefix);
  const id = value.slice(separatorIndex + 1);
  if (!candidate) {
    return { source: null, id: value };
  }

  return { source: candidate, id };
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
    favorites: Array.isArray(user.favorites)
      ? user.favorites.map(serializeProductFavorite).filter(Boolean)
      : [],
    scan_history: Array.isArray(user.scan_history)
      ? user.scan_history.map((entry) => {
          const productId = String(entry.product_id ?? entry.productId ?? "");
          const sourceTag = normalizeSourceTag(entry.source_tag ?? entry.sourceTag ?? entry.source);
          return {
            product_id: sourceTag ? `${sourceTag}:${productId}` : productId,
            source_tag: sourceTag,
            timestamp: entry.timestamp ?? entry.scanned_at,
            was_alternative_chosen: Boolean(entry.was_alternative_chosen),
          };
        })
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

async function fetchOpenFoodFactsJson(path, queryParams = {}) {
  const url = new URL(`https://world.openfoodfacts.org${path}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Ethico/1.0 (m.doblibennani@esisa.ac.ma)",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Open Food Facts request failed: ${response.status} ${text}`);
  }

  return response.json();
}

const offCsvCandidates = [
  path.resolve(__dirname, "../../../Datasets/en.openfoodfacts.org.products.csv"),
  path.resolve(__dirname, "../../../Datasets/openfoodfactsfirst10rows.csv"),
];
const offCsvPath = offCsvCandidates.find((candidate) => fs.existsSync(candidate));
if (!offCsvPath) {
  throw new Error(
    "Open Food Facts CSV data file not found. Place en.openfoodfacts.org.products.csv or openfoodfactsfirst10rows.csv in the repository Datasets folder."
  );
}

const commentsJsonPath = path.resolve(__dirname, "../../../Datasets/final_products_with_comments.json");
let commentsByProductId = new Map();

function loadProductComments() {
  try {
    if (!fs.existsSync(commentsJsonPath)) {
      return;
    }

    const raw = fs.readFileSync(commentsJsonPath, "utf-8");
    const parsed = JSON.parse(raw);
    const products = Array.isArray(parsed.products) ? parsed.products : [];

    commentsByProductId = new Map(
      products.map((product) => [String(product.id), Array.isArray(product.comments) ? product.comments : []])
    );
  } catch (error) {
    console.warn("Failed to load product comments:", error.message);
  }
}

function attachComments(product) {
  if (!product) return product;

  const productId = String(product.id ?? product._id ?? "");
  const comments = commentsByProductId.get(productId) || product.comments || [];
  return {
    ...product,
    comments,
  };
}

loadProductComments();

function detectCsvEncoding(filePath) {
  const header = Buffer.alloc(4);
  const fd = fs.openSync(filePath, "r");
  try {
    const { bytesRead } = fs.readSync(fd, header, 0, header.length, 0);
    if (bytesRead >= 2) {
      if (header[0] === 0xff && header[1] === 0xfe) {
        return "utf16le";
      }
      if (header[0] === 0xfe && header[1] === 0xff) {
        return "utf16le"; // treat big-endian data as UTF-16LE by swapping if needed
      }
    }
    return "utf8";
  } finally {
    fs.closeSync(fd);
  }
}

let offCsvHeaderIndexes = null;

async function loadOpenFoodFactsCsvHeader() {
  if (offCsvHeaderIndexes) {
    return offCsvHeaderIndexes;
  }

  const CHUNK_SIZE = 128 * 1024;
  const encoding = detectCsvEncoding(offCsvPath);
  const fileHandle = await fs.promises.open(offCsvPath, "r");
  try {
    let bytesRead = 0;
    let headerText = "";
    let buffer = Buffer.alloc(CHUNK_SIZE);

    while (headerText.indexOf("\n") === -1) {
      const readResult = await fileHandle.read(buffer, 0, CHUNK_SIZE, bytesRead);
      if (readResult.bytesRead === 0) {
        break;
      }

      headerText += buffer.slice(0, readResult.bytesRead).toString(encoding);
      bytesRead += readResult.bytesRead;
      if (bytesRead >= 4 * CHUNK_SIZE) {
        break;
      }
    }

    const newlineIndex = headerText.indexOf("\n");
    if (newlineIndex < 0) {
      throw new Error("Unable to read Open Food Facts CSV header.");
    }

    const headerLine = headerText.slice(0, newlineIndex).replace(/^\ufeff/, "").replace(/\r$/, "");
    const headers = headerLine.split("\t");
    offCsvHeaderIndexes = {
      code: headers.indexOf("code"),
      product_name: headers.indexOf("product_name"),
      generic_name: headers.indexOf("generic_name"),
      brands: headers.indexOf("brands"),
      image_url: headers.indexOf("image_url"),
      ecoscore_grade: headers.indexOf("ecoscore_grade"),
      ingredients_text: headers.indexOf("ingredients_text"),
      categories_tags: headers.indexOf("categories_tags"),
      countries_tags: headers.indexOf("countries_tags"),
      labels: headers.indexOf("labels"),
    };
  } finally {
    await fileHandle.close();
  }

  if (!offCsvHeaderIndexes) {
    throw new Error("Unable to read Open Food Facts CSV header.");
  }

  return offCsvHeaderIndexes;
}

async function searchOpenFoodFactsCsv(query, pageSize) {
  const indexes = await loadOpenFoodFactsCsvHeader();
  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const normalizedQuery = normalize(query);
  const results = [];

  return new Promise((resolve, reject) => {
    const encoding = detectCsvEncoding(offCsvPath);
    const decoder = new StringDecoder(encoding);
    const stream = fs.createReadStream(offCsvPath);
    let buffered = "";
    let isFirstLine = true;

    const getColumnValue = (columns, index) =>
      index >= 0 && index < columns.length ? String(columns[index]).trim() : "";

    stream.on("data", (chunk) => {
      buffered += decoder.write(chunk);
      let lineEndIndex;

      while ((lineEndIndex = buffered.indexOf("\n")) >= 0) {
        let line = buffered.slice(0, lineEndIndex);
        buffered = buffered.slice(lineEndIndex + 1);
        line = line.replace(/\r$/, "");

        if (isFirstLine) {
          isFirstLine = false;
          continue;
        }

        if (!line.trim()) {
          continue;
        }

        const columns = line.split("\t");
        const productName = getColumnValue(columns, indexes.product_name);
        const genericName = getColumnValue(columns, indexes.generic_name);
        const brands = getColumnValue(columns, indexes.brands);
        const categories = getColumnValue(columns, indexes.categories_tags);
        const labels = getColumnValue(columns, indexes.labels);
        const countries = getColumnValue(columns, indexes.countries_tags);
        const ingredientsText = getColumnValue(columns, indexes.ingredients_text);
        const searchableText = normalize(
          `${productName} ${genericName} ${brands} ${categories} ${labels} ${countries} ${ingredientsText}`
        );

        if (!searchableText.includes(normalizedQuery)) {
          continue;
        }

        results.push({
          code: getColumnValue(columns, indexes.code),
          product_name: productName,
          generic_name: genericName,
          brands,
          image_url: getColumnValue(columns, indexes.image_url),
          ecoscore_grade: getColumnValue(columns, indexes.ecoscore_grade),
          ingredients_text: ingredientsText,
          categories_tags: categories,
          countries_tags: countries,
          labels: labels.split(",").map((label) => label.trim()).filter(Boolean),
          source: "Open Food Facts CSV",
        });

        if (results.length >= pageSize) {
          stream.destroy();
          resolve(results);
          return;
        }
      }
    });

    stream.on("end", () => {
      if (buffered.trim()) {
        const line = buffered.replace(/\r$/, "");
        const columns = line.split("\t");
        const productName = getColumnValue(columns, indexes.product_name);
        const genericName = getColumnValue(columns, indexes.generic_name);
        const brands = getColumnValue(columns, indexes.brands);
        const categories = getColumnValue(columns, indexes.categories_tags);
        const labels = getColumnValue(columns, indexes.labels);
        const countries = getColumnValue(columns, indexes.countries_tags);
        const ingredientsText = getColumnValue(columns, indexes.ingredients_text);
        const searchableText = normalize(
          `${productName} ${genericName} ${brands} ${categories} ${labels} ${countries} ${ingredientsText}`
        );

        if (searchableText.includes(normalizedQuery)) {
          results.push({
            code: getColumnValue(columns, indexes.code),
            product_name: productName,
            generic_name: genericName,
            brands,
            image_url: getColumnValue(columns, indexes.image_url),
            ecoscore_grade: getColumnValue(columns, indexes.ecoscore_grade),
            ingredients_text: ingredientsText,
            categories_tags: categories,
            countries_tags: countries,
            labels: labels.split(",").map((label) => label.trim()).filter(Boolean),
            source: "Open Food Facts CSV",
          });
        }
      }
      resolve(results);
    });

    stream.on("error", (error) => reject(error));
  });
}

async function findOpenFoodFactsProductByBarcode(barcode) {
  const indexes = await loadOpenFoodFactsCsvHeader();
  const encoding = detectCsvEncoding(offCsvPath);
  const decoder = new StringDecoder(encoding);
  const stream = fs.createReadStream(offCsvPath);
  let buffered = "";
  let isFirstLine = true;

  return new Promise((resolve, reject) => {
    const getColumnValue = (columns, index) =>
      index >= 0 && index < columns.length ? String(columns[index]).trim() : "";

    stream.on("data", (chunk) => {
      buffered += decoder.write(chunk);
      let lineEndIndex;

      while ((lineEndIndex = buffered.indexOf("\n")) >= 0) {
        let line = buffered.slice(0, lineEndIndex);
        buffered = buffered.slice(lineEndIndex + 1);
        line = line.replace(/\r$/, "");

        if (isFirstLine) {
          isFirstLine = false;
          continue;
        }

        if (!line.trim()) {
          continue;
        }

        const columns = line.split("\t");
        const code = getColumnValue(columns, indexes.code);
        if (!code || String(code) !== barcode) {
          continue;
        }

        stream.destroy();
        resolve({
          code,
          product_name: getColumnValue(columns, indexes.product_name),
          generic_name: getColumnValue(columns, indexes.generic_name),
          brands: getColumnValue(columns, indexes.brands),
          image_url: getColumnValue(columns, indexes.image_url),
          ecoscore_grade: getColumnValue(columns, indexes.ecoscore_grade),
          ingredients_text: getColumnValue(columns, indexes.ingredients_text),
          categories_tags: getColumnValue(columns, indexes.categories_tags),
          countries_tags: getColumnValue(columns, indexes.countries_tags),
          labels: getColumnValue(columns, indexes.labels),
          source: "Open Food Facts CSV",
        });
        return;
      }
    });

    stream.on("end", () => {
      resolve(null);
    });

    stream.on("error", (error) => reject(error));
  });
}

async function findProductBySourceTaggedId(raw) {
  const { source, id } = parseSourceTaggedProductId(raw);
  if (source === "openFoodFacts") {
    return await findOpenFoodFactsProductByBarcode(id);
  }

  const numericId = parseNumericId(id);
  const query = numericId != null ? { id: numericId } : { barcode: id };
  return await productsCollection().findOne(query);
}

app.get("/api/open-food-facts/products/:barcode", async (req, res) => {
  try {
    const barcode = String(req.params.barcode || "").trim();
    if (!barcode) {
      return res.status(400).json({ message: "barcode is required" });
    }

    const product = await findOpenFoodFactsProductByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ message: "Product not found in Open Food Facts CSV" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: `Fetching Open Food Facts product failed: ${error.message}` });
  }
});

app.get("/api/open-food-facts/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.status(400).json({ message: "q is required" });
    }

    const pageSize = Math.min(Math.max(Number.parseInt(String(req.query.page_size || "20"), 10) || 20, 1), 100);
    const products = await searchOpenFoodFactsCsv(query, pageSize);

    return res.json({ products });
  } catch (error) {
    return res.status(500).json({
      message: "Local Open Food Facts search failed.",
      details: error.message,
    });
  }
});

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
    const productId = String(req.body?.productId || "").trim();
    const sourceTag = normalizeSourceTag(req.body?.sourceTag);
    if (id == null || !productId) {
      return res.status(400).json({ message: "user id and productId are required" });
    }

    const storedProductId = sourceTag ? `${sourceTag}:${productId}` : productId;
    const pullValues = [];
    if (sourceTag) {
      pullValues.push(productId);
    }

    const update = {
      $addToSet: { favorites: storedProductId },
      $set: { updated_at: new Date().toISOString() },
    };

    if (pullValues.length > 0) {
      update.$pull = { favorites: { $in: pullValues } };
    }

    await usersCollection().updateOne({ id }, update);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: `Adding favorite failed: ${error.message}` });
  }
});

app.delete("/api/users/:id/favorites/:productId", async (req, res) => {
  try {
    const id = parseNumericId(req.params.id);
    const rawProductId = String(req.params.productId || "").trim();
    if (id == null || !rawProductId) {
      return res.status(400).json({ message: "user id and productId are required" });
    }

    const { source, id: strippedId } = parseSourceTaggedProductId(rawProductId);
    const pullValues = [rawProductId];
    if (source && strippedId) {
      pullValues.push(strippedId);
    }

    await usersCollection().updateOne(
      { id },
      { $pull: { favorites: { $in: pullValues } }, $set: { updated_at: new Date().toISOString() } }
    );
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: `Removing favorite failed: ${error.message}` });
  }
});

app.post("/api/users/:id/scans", async (req, res) => {
  try {
    const id = parseNumericId(req.params.id);
    const productId = String(req.body?.productId || "").trim();
    const sourceTag = normalizeSourceTag(req.body?.sourceTag);
    const wasAlternativeChosen = Boolean(req.body?.wasAlternativeChosen);
    if (id == null || !productId) {
      return res.status(400).json({ message: "user id and productId are required" });
    }

    const storedProductId = sourceTag ? `${sourceTag}:${productId}` : productId;

    const scanEntry = {
      product_id: storedProductId,
      timestamp: new Date().toISOString(),
      was_alternative_chosen: wasAlternativeChosen,
    };
    if (sourceTag) {
      scanEntry.source_tag = sourceTag;
    }

    await usersCollection().updateOne(
      { id },
      {
        $push: { scan_history: scanEntry },
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
    const withComments = withProducers.map(attachComments);
    return res.json(withComments);
  } catch (error) {
    return res.status(500).json({ message: `Fetching products failed: ${error.message}` });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const raw = String(req.params.id || "");
    const product = await findProductBySourceTaggedId(raw);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.code && !product.id) {
      return res.status(404).json({ message: "Product not found" });
    }

    const enrichedProduct = await attachProducer(product);
    return res.json(attachComments(enrichedProduct));
  } catch (error) {
    return res.status(500).json({ message: `Fetching product failed: ${error.message}` });
  }
});

async function start() {
  await initDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
