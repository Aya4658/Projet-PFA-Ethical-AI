import csv
import json
import os
import re
from pathlib import Path
from typing import TextIO, Tuple
from groq import Groq
from dotenv import load_dotenv
from database import db_manager

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_keywords(user_query: str) -> list:
    """Remove French stop words and return meaningful keywords."""
    stop_words = {
        "quel", "quelle", "quels", "quelles", "est", "sont", "le", "la",
        "les", "l", "du", "de", "des", "un", "une", "pour", "avec", "sur",
        "dans", "je", "veux", "cherche", "trouve", "donne", "moi", "me",
        "tu", "il", "elle", "nous", "vous", "ils", "elles", "mon", "ma",
        "mes", "ton", "ta", "ses", "produit", "score", "éthique", "ethique",
        "information", "prix", "marque", "bonjour", "merci", "stp", "svp",
        "aide", "comment", "combien", "quoi", "qui", "ou", "quand", "quel",
        "y", "a", "au", "aux", "par", "pas", "ne", "se", "si", "ce", "cet",
        "cette", "ces", "avoir", "être", "faire", "savoir", "vouloir"
    }
    clean = user_query.lower()
    for ch in ["?", "!", ".", ",", ":", ";"]:
        clean = clean.replace(ch, "")
    words = clean.split()
    return [w for w in words if w not in stop_words and len(w) > 2]


def is_greeting(message: str) -> bool:
    """Detect simple French/English greetings so the bot can reply conversationally."""
    greeting_patterns = [
        r"^\s*(bonjour|salut|coucou|hello|hi|hey|bonsoir)\b",
        r"\b(merci|merci beaucoup|thanks|thank you)\b",
        r"\b(ça va|ca va|comment ça va|comment ca va)\b",
    ]
    normalized = message.lower().strip()
    for pattern in greeting_patterns:
        if re.search(pattern, normalized):
            return True
    return False


DATASET_CSV_PATHS = [
    Path(__file__).resolve().parent.parent / "Datasets" / "en.openfoodfacts.org.products.csv",
    Path(__file__).resolve().parent.parent.parent / "Datasets" / "en.openfoodfacts.org.products.csv",
    Path(__file__).resolve().parent.parent / "Datasets" / "openfoodfactsfirst10rows.csv",
    Path(__file__).resolve().parent.parent.parent / "Datasets" / "openfoodfactsfirst10rows.csv",
]

PRODUCTS_CSV_PATH = next((p for p in DATASET_CSV_PATHS if p.exists()), None)
if PRODUCTS_CSV_PATH is None:
    raise FileNotFoundError(
        "Open Food Facts CSV file not found. Place 'en.openfoodfacts.org.products.csv' or 'openfoodfactsfirst10rows.csv' in the Datasets folder."
    )

CSV_HEADER_INDEXES = None


def _open_csv_reader() -> Tuple[TextIO, object]:
    """Open the products CSV using a list of encodings and return (file, reader).

    The caller is responsible for closing the returned file handle.
    """
    for enc in ("utf-8", "latin-1", "utf-16-le"):
        f = None
        try:
            f = PRODUCTS_CSV_PATH.open("r", encoding=enc, newline="")
            reader = csv.reader(f, delimiter="\t")
            return f, reader
        except UnicodeDecodeError:
            try:
                if f is not None:
                    f.close()
            except Exception:
                pass
            continue

    # Last resort: open without specifying encoding
    f = PRODUCTS_CSV_PATH.open("r", newline="")
    reader = csv.reader(f, delimiter="\t")
    return f, reader


def load_csv_header_indexes() -> dict:
    global CSV_HEADER_INDEXES
    if CSV_HEADER_INDEXES is not None:
        return CSV_HEADER_INDEXES
    # Open CSV and read headers using helper
    csvfile, reader = _open_csv_reader()
    try:
        headers = next(reader, [])
    except Exception:
        headers = []

    if headers and headers[0].startswith("\ufeff"):
        headers[0] = headers[0].lstrip("\ufeff")

    CSV_HEADER_INDEXES = {
        "code": headers.index("code") if "code" in headers else -1,
        "product_name": headers.index("product_name") if "product_name" in headers else -1,
        "generic_name": headers.index("generic_name") if "generic_name" in headers else -1,
        "brands": headers.index("brands") if "brands" in headers else -1,
        "image_url": headers.index("image_url") if "image_url" in headers else -1,
        "ecoscore_grade": headers.index("ecoscore_grade") if "ecoscore_grade" in headers else -1,
        "ingredients_text": headers.index("ingredients_text") if "ingredients_text" in headers else -1,
        "categories_tags": headers.index("categories_tags") if "categories_tags" in headers else -1,
        "countries_tags": headers.index("countries_tags") if "countries_tags" in headers else -1,
        "labels": headers.index("labels") if "labels" in headers else -1,
    }

    try:
        csvfile.close()
    except Exception:
        pass

    return CSV_HEADER_INDEXES


def fetch_open_food_facts(query_text: str, page_size: int = 3) -> list:
    indexes = load_csv_header_indexes()
    normalized_query = query_text.lower()
    products = []
    # Open CSV with encoding fallback using helper
    csvfile, reader = _open_csv_reader()
    try:
        # skip header
        next(reader, None)

        for row in reader:
            if len(row) == 0:
                continue

            name = (row[indexes["product_name"]] if indexes["product_name"] >= 0 else "")
            generic_name = (row[indexes["generic_name"]] if indexes["generic_name"] >= 0 else "")
            brands = (row[indexes["brands"]] if indexes["brands"] >= 0 else "")
            searchable = " ".join([name, generic_name, brands]).lower()

            if normalized_query not in searchable:
                continue

            categories = []
            if indexes["categories_tags"] >= 0:
                categories = [c for c in row[indexes["categories_tags"]].split(",") if c.strip()]
            countries = []
            if indexes["countries_tags"] >= 0:
                countries = [c for c in row[indexes["countries_tags"]].split(",") if c.strip()]
            labels = []
            if indexes["labels"] >= 0 and row[indexes["labels"]].strip():
                labels = [label.strip() for label in row[indexes["labels"]].split(",") if label.strip()]

            products.append({
                "name": name or generic_name or brands,
                "brand": brands or "Inconnu",
                "category": ", ".join(categories) if categories else "N/A",
                "origin_country": ", ".join(countries) if countries else "N/A",
                "nutri_score": row[indexes["ecoscore_grade"]] if indexes["ecoscore_grade"] >= 0 else "N/A",
                "labels": labels,
                "source": "Open Food Facts CSV",
            })

            if len(products) >= page_size:
                break
    finally:
        # close file handle
        try:
            csvfile.close()
        except Exception:
            pass

    return products


def get_ethical_analysis(user_query: str, allow_csv: bool = False):
    keywords = extract_keywords(user_query)

    found_products = []
    # If the user only sent a greeting or small chit-chat phrase, reply conversationally.
    if is_greeting(user_query):
        return "Bonjour ! Je suis là pour vous aider à trouver des informations sur les produits éthiques. Que voulez-vous savoir ?"

    for keyword in keywords:
        results = db_manager.search_products(keyword)
        if results:
            for product in results:
                product["source"] = "Base éthique interne"
            found_products = results
            break

    open_food_facts_products = []
    if allow_csv:
        if not found_products:
            search_text = " ".join(keywords) if keywords else user_query
            open_food_facts_products = fetch_open_food_facts(search_text)
            found_products = open_food_facts_products
        else:
            search_text = " ".join(keywords)
            open_food_facts_products = fetch_open_food_facts(search_text, page_size=2)
    else:
        # CSV lookups disabled for this request; rely only on DB results
        open_food_facts_products = []

    if not found_products:
        return "Désolé, je n'ai aucune information sur ce produit dans ma base de données éthique ni sur Open Food Facts."

    context = "Voici les données réelles de mes bases de données :\n"
    for p in found_products:
        labels = p.get("labels", [])
        labels_str = ", ".join(labels) if isinstance(labels, list) else str(labels)
        price = p.get("price")
        price_str = f"{price} MAD" if price is not None else "N/A"
        context += (
            f"- Produit: {p.get('name', 'N/A')}, "
            f"Marque: {p.get('brand', 'N/A')}, "
            f"Catégorie: {p.get('category', 'N/A')}, "
            f"Score: {p.get('ethical_score', p.get('nutri_score', 'N/A'))}, "
            f"Prix: {price_str}, "
            f"Pays: {p.get('origin_country', 'N/A')}, "
            f"Labels: {labels_str}, "
            f"Source: {p.get('source', 'N/A')}\n"
        )

    if open_food_facts_products and found_products is not open_food_facts_products:
        context += "\nVoici également quelques produits Open Food Facts potentiellement liés :\n"
        for p in open_food_facts_products:
            labels = p.get("labels", [])
            labels_str = ", ".join(labels) if isinstance(labels, list) else str(labels)
            context += (
                f"- Produit: {p.get('name', 'N/A')}, "
                f"Marque: {p.get('brand', 'N/A')}, "
                f"Catégorie: {p.get('category', 'N/A')}, "
                f"Nutri-Score: {p.get('nutri_score', 'N/A')}, "
                f"Pays: {p.get('origin_country', 'N/A')}, "
                f"Labels: {labels_str}, "
                f"Source: {p.get('source', 'N/A')}\n"
            )

    prompt = f"""
    Tu es un assistant expert en commerce éthique.
    Tu dois répondre UNIQUEMENT en utilisant les données fournies ci-dessous.
    Tu dois mentionner explicitement la base de données source pour chaque produit cité :
    "Base éthique interne" ou "Open Food Facts".
    Si l'utilisateur pose une question sur un produit qui n'est pas dans les données,
    dis que tu ne sais pas.

    DONNÉES :
    {context}

    QUESTION UTILISATEUR :
    {user_query}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Erreur technique (Quota ou API) : {str(e)}"
