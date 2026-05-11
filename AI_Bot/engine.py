import os
from google import genai
from dotenv import load_dotenv
from database import db_manager

load_dotenv()

# Setup the modern client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_ethical_analysis(user_query: str):
    # 1. RETRIEVAL: Look in Mongo first
    # We extract a simple keyword (you can make this smarter later)
    found_products = db_manager.search_products(user_query)

    # 2. "I DON'T KNOW" LOGIC: If nothing is in Mongo, don't even ask Gemini
    if not found_products:
        return "Désolé, je n'ai aucune information sur ce produit dans ma base de données éthique."

    # 3. AUGMENTATION: Prepare the context
    context = "Voici les données réelles de ma base de données :\n"
    for p in found_products:
        context += f"- Produit: {p.get('name')}, Score: {p.get('ethical_score')}/100, Pays: {p.get('origin_country')}\n"

    # 4. GENERATION: Strict Instructions
    prompt = f"""
    Tu es un assistant expert en commerce éthique. 
    Tu dois répondre UNIQUEMENT en utilisant les données fournies ci-dessous.
    Si l'utilisateur pose une question sur un produit qui n'est pas dans la liste, dis que tu ne sais pas.
    
    DONNÉES :
    {context}
    
    QUESTION UTILISATEUR :
    {user_query}
    """

    try:
        # Use 'gemini-1.5-flash' - it is the most stable
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Erreur technique (Quota ou API) : {str(e)}"