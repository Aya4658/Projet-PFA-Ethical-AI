import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

class MongoManager:
    def __init__(self):
        uri = os.getenv("MONGO_URI")
        db_name = os.getenv("DB_NAME", "ethical_commerce_db")
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self.products = self.db["products"]

    def search_products(self, query_text):
        # On cherche si le texte apparaît dans plusieurs champs
        search_filter = {
            "$or": [
                {"name": {"$regex": query_text, "$options": "i"}},
                {"category": {"$regex": query_text, "$options": "i"}},
                {"origin_country": {"$regex": query_text, "$options": "i"}},
                {"labels": {"$regex": query_text, "$options": "i"}}
            ]
        }
        # On récupère les 5 meilleurs résultats
        return list(self.products.find(search_filter).limit(5))

    def get_budget_products(self, max_price):
        # Filtre spécifique pour le budget
        return list(self.products.find({"price": {"$lte": max_price}}).sort("ethical_score", -1).limit(3))

    def get_top_ethical(self):
        # Pour les questions sur la "meilleure qualité/éthique"
        return list(self.products.find().sort("ethical_score", -1).limit(3))
db_manager = MongoManager()