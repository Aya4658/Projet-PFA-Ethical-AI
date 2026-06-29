# AI Bot — Changements et améliorations (Branch: AIchat)

> Auteur : Aya Adlouni  
> Date : Mai 2026  
> Branch GitHub : `AIchat`  
> Dossier concerné : `AI_Bot/`

---

## Contexte du projet

Ce bot est un **assistant éthique** (RAG — Retrieval-Augmented Generation) :
1. L'utilisateur pose une question en français.
2. Le bot extrait les mots-clés de la question.
3. Il cherche les produits correspondants dans MongoDB.
4. Il envoie les données réelles à un LLM (Groq / Llama 3.3 70B) pour générer une réponse précise.

---

## 1. Bug critique corrigé — `engine.py`

### Problème
Le bot répondait toujours :
> *"Désolé, je n'ai aucune information sur ce produit dans ma base de données éthique."*

...même pour des produits qui existaient réellement dans MongoDB.

### Cause
La fonction `get_ethical_analysis()` envoyait la **phrase complète** de l'utilisateur directement à MongoDB comme mot-clé de recherche.  
Une phrase comme `"Quel est le score éthique du produit Nike ?"` ne correspond à aucun document — il fallait en extraire uniquement `"nike"`.

### Solution — Extraction de mots-clés (stop words)
Ajout d'une fonction `extract_keywords()` qui :
- Passe la phrase en minuscules
- Supprime la ponctuation
- Filtre les mots vides français (`quel`, `est`, `le`, `du`, `produit`, `score`, `éthique`, etc.)
- Retourne uniquement les mots significatifs

```python
# Avant (bug)
results = db_manager.search_products(user_query)  # phrase entière → aucun résultat

# Après (corrigé)
keywords = extract_keywords(user_query)   # ["nike"]
for keyword in keywords:
    results = db_manager.search_products(keyword)  # trouve "Nike Air Max"
    if results:
        break
```

---

## 2. Remplacement de l'API Gemini par Groq

### Problème
- Clé API Gemini exposée dans le chat VS Code → Google l'a révoquée automatiquement (quota `limit: 0`).
- La nouvelle clé était du même projet bloqué → toujours inutilisable.
- Google demandait une carte bancaire pour débloquer.

### Solution — Migration vers Groq (gratuit)
- Inscription sur [https://console.groq.com](https://console.groq.com) (login GitHub/Google, sans carte).
- 14 400 requêtes/jour gratuites.
- Modèle choisi : **Llama 3.3 70B Versatile** (`llama-3.3-70b-versatile`) — le meilleur pour le français.

```python
# Avant
from google import genai
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
response = client.models.generate_content(model="gemini-2.0-flash", ...)

# Après
from groq import Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
response = client.chat.completions.create(model="llama-3.3-70b-versatile", ...)
```

Variables `.env` mises à jour :
```
# Avant
GEMINI_API_KEY=...

# Après
GROQ_API_KEY=gsk_...
```

---

## 3. CORS ajouté — `main.py`

### Problème
L'interface HTML (`test_ui.html`) ne pouvait pas contacter le backend depuis le navigateur :
> *"Impossible de contacter le serveur"*

Le navigateur bloquait les requêtes cross-origin (origine `file://` vers `http://127.0.0.1`).

### Solution
Ajout du middleware CORS dans `main.py` :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 4. Base de données MongoDB — Seeding

### Problème
La collection `products` était **vide** → le bot répondait toujours "désolé" même avec le bug corrigé.

### Solution
Insertion de 5 produits de test dans `ethical_commerce_db.products` :

| Nom | Catégorie | Score | Prix | Pays | Labels |
|-----|-----------|-------|------|------|--------|
| Cafe Bio Equitable | Alimentation | 87/100 | 12.99 MAD | Colombie | Bio, Fair Trade, Rainforest Alliance |
| T-Shirt Coton Bio | Vêtements | 74/100 | 35.00 MAD | Inde | Bio, GOTS, Commerce Equitable |
| Nike Air Max | Chaussures | 32/100 | 120.00 MAD | Vietnam | Recycle |
| Chocolat Noir Bio | Alimentation | 91/100 | 4.50 MAD | Ghana | Bio, Fair Trade, Vegan |
| Savon Artisanal Local | Cosmétiques | 95/100 | 8.00 MAD | France | Bio, Local, Vegan, Zero Dechet |

---

## 5. Sécurité — `.gitignore`

### Problème
Le fichier `.env` (contenant les clés API et l'URI MongoDB) n'était **pas ignoré** par git → risque de push accidentel de secrets.

### Solution
Ajout dans `.gitignore` :
```
.env
*.env
```

---

## 6. Tests automatisés — `tests/test_bot.py`

13 tests créés et validés (6 API + 7 UI Playwright) :

### Tests API (`TestAPIDirectly`)
| Test | Vérifie |
|------|---------|
| `test_server_is_running` | Le serveur répond sur le bon port |
| `test_chat_returns_valid_json` | `/chat` retourne `{"reply": "..."}` |
| `test_known_product_returns_info` | Nike → infos réelles (pas "introuvable") |
| `test_unknown_product_returns_sorry` | Produit inexistant → refus poli |
| `test_empty_message_handled` | Message vide → pas de crash |
| `test_french_question_with_stop_words` | Phrase complète → extraction fonctionne |

### Tests UI Playwright (`TestUIWithPlaywright`)
| Test | Vérifie |
|------|---------|
| `test_page_title_visible` | La page HTML se charge |
| `test_input_field_exists` | Le champ de saisie existe |
| `test_send_button_exists` | Le bouton Envoyer est actif |
| `test_clear_button_clears_chat` | Effacer vide bien le chat |
| `test_send_message_via_button` | Clic Envoyer → réponse affichée |
| `test_send_message_via_enter_key` | Touche Entrée → réponse affichée |
| `test_known_product_in_ui` | Produit connu → pas "introuvable" dans l'UI |

**Résultat : 13/13 PASSED ✅**

---

## 7. Résumé des fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `AI_Bot/engine.py` | Extraction mots-clés + migration Gemini → Groq (Llama 3.3 70B) |
| `AI_Bot/main.py` | Ajout CORSMiddleware |
| `AI_Bot/database.py` | Connexion MongoDB rendue résiliente (try/except) |
| `AI_Bot/tests/test_bot.py` | 13 tests API + Playwright créés |
| `AI_Bot/test_ui.html` | URL API corrigée vers port 8001 |
| `.gitignore` | `.env` et `*.env` exclus du versioning |

---

## 8. Architecture finale du bot

```
[Utilisateur] 
     ↓ question en français
[extract_keywords()]
     ↓ mots-clés ["nike"]
[MongoDB Atlas — search_products()]
     ↓ produits trouvés (avec score, prix, labels...)
[Groq API — llama-3.3-70b-versatile]
     ↓ réponse contextualisée en français
[Utilisateur]
```

---

## Comment lancer le projet en local

```bash
# 1. Installer les dépendances
cd AI_Bot
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn pymongo python-dotenv groq pytest pytest-playwright requests playwright
playwright install chromium

# 2. Configurer le .env (ne jamais committer ce fichier !)
# AI_Bot/.env :
GROQ_API_KEY=gsk_...        # depuis https://console.groq.com
MONGO_URI=mongodb+srv://...  # URI MongoDB Atlas
DB_NAME=ethical_commerce_db

# 3. Lancer le serveur
uvicorn main:app --host 127.0.0.1 --port 8001

# 4. Lancer les tests
pytest tests/test_bot.py -v
```

---

*Documentation rédigée par Aya Adlouni — Projet PFA Ethical AI — ESISA 2026*
