import os
from google import genai
from dotenv import load_dotenv
from database import db_manager

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

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


def get_ethical_analysis(user_query: str):
    # 1. RETRIEVAL: Extract keywords then search MongoDB
    keywords = extract_keywords(user_query)
    
    found_products = []
    # Try each keyword individually, stop at first match
    for keyword in keywords:
        results = db_manager.search_products(keyword)
        if results:
            found_products = results
            break

    # 2. I DON'T KNOW LOGIC
    if not found_products:
        return "Désolé, je n'ai aucune information sur ce produit dans ma base de données éthique."

    # 3. AUGMENTATION: Build context for Gemini
    context = "Voici les données réelles de ma base de données :\n"
    for p in found_products:
        labels = p.get('labels', [])
        if isinstance(labels, list):
            labels_str = ", ".join(labels)
        else:
            labels_str = str(labels)
        context += (
            f"- Produit: {p.get('name', 'N/A')}, "
            f"Catégorie: {p.get('category', 'N/A')}, "
            f"Score: {p.get('ethical_score', 'N/A')}/100, "
            f"Prix: {p.get('price', 'N/A')} MAD, "
            f"Pays: {p.get('origin_country', 'N/A')}, "
            f"Labels: {labels_str}\n"
        )

    # 4. GENERATION: Ask Gemini with strict instructions
    prompt = f"""
    Tu es un assistant expert en commerce éthique.
    Tu dois répondre UNIQUEMENT en utilisant les données fournies ci-dessous.
    Si l'utilisateur pose une question sur un produit qui n'est pas dans la liste,
    dis que tu ne sais pas.

    DONNÉES :
    {context}

    QUESTION UTILISATEUR :
    {user_query}
    """

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Erreur technique (Quota ou API) : {str(e)}"