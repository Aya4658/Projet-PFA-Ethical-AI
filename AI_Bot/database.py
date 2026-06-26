import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


class MongoManager:
    def __init__(self):
        uri = os.getenv("MONGO_URI")
        db_name = os.getenv("DB_NAME", "ethical_commerce_db")
        self.client = None
        self.db = None
        self.products = None

        # Keep API startup resilient when .env has placeholders or unreachable DB.
        if not uri:
            return

        try:
            self.client = MongoClient(uri)
            self.db = self.client[db_name]
            collections = self.db.list_collection_names()
            if "products" in collections:
                self.products = self.db["products"]
            elif "Products" in collections:
                self.products = self.db["Products"]
            else:
                matched = [name for name in collections if name.lower() == "products"]
                self.products = self.db[matched[0]] if matched else None
        except Exception:
            self.client = None
            self.db = None
            self.products = None

    def search_products(self, query_text):
        if self.products is None:
            return []

        # On cherche si le texte apparaît dans plusieurs champs
        search_filter = {
            "$or": [
                {"name": {"$regex": query_text, "$options": "i"}},
                {"category": {"$regex": query_text, "$options": "i"}},
                {"origin_country": {"$regex": query_text, "$options": "i"}},
                {"labels": {"$regex": query_text, "$options": "i"}}
            ]
        }

        try:
            # On récupère les 5 meilleurs résultats
            return list(self.products.find(search_filter).limit(5))
        except Exception:
            return []

    def get_budget_products(self, max_price):
        if self.products is None:
            return []

        # Filtre spécifique pour le budget
        try:
            return list(self.products.find({"price": {"$lte": max_price}}).sort("ethical_score", -1).limit(3))
        except Exception:
            return []

    def get_top_ethical(self):
        if self.products is None:
            return []

        # Pour les questions sur la "meilleure qualité/éthique"
        try:
            return list(self.products.find().sort("ethical_score", -1).limit(3))
        except Exception:
            return []


db_manager = MongoManager()
