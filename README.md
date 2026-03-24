# Projet-PFA-Ethical-AI

## **User Stories – Application Mobile (Consommateurs)**

### 1. Scan et Analyse
- En tant que consommateur, je veux scanner un produit pour obtenir instantanément son score éthique et environnemental.  
- En tant que consommateur, je veux consulter un résumé clair du score du produit pour comprendre rapidement sa qualité.  
- En tant que consommateur, je veux consulter les détails du score (traçabilité, impact carbone, certifications, conditions de travail).

### 2. Fiche Produit
- En tant que consommateur, je veux consulter la fiche complète d’un produit après un scan ou une recherche.  
- En tant que consommateur, je veux visualiser les étapes de la chaîne d’approvisionnement sous forme de timeline ou de carte.  
- En tant que consommateur, je veux consulter les certifications vérifiées du producteur.

### 3. Recommandations et Alternatives
- En tant que consommateur, je veux recevoir des alternatives plus éthiques si un produit a un mauvais score.  
- En tant que consommateur, je veux recevoir des recommandations personnalisées selon mes préférences.

### 4. Profil et Préférences
- En tant que consommateur, je veux définir mes préférences (bio, local, vegan, équitable).  
- En tant que consommateur, je veux consulter mon historique de scans.  
- En tant que consommateur, je veux sauvegarder des produits dans une liste de favoris.

### 5. Notifications
- En tant que consommateur, je veux recevoir des notifications lorsque le score d’un produit que j’ai scanné change.  
- En tant que consommateur, je veux être informé des nouveaux produits correspondant à mes préférences.

### 6. Avis et Signalements
- En tant que consommateur, je veux laisser un avis sur un produit.  
- En tant que consommateur, je veux signaler un produit suspect ou non conforme.

---

## **User Stories – Site Web Producteurs / Fournisseurs**

### 1. Gestion des Produits
- En tant que producteur, je veux ajouter un nouveau produit avec toutes ses informations.  
- En tant que producteur, je veux modifier les informations d’un produit existant.  
- En tant que producteur, je veux supprimer un produit qui n’est plus commercialisé.

### 2. Gestion des Stocks
- En tant que producteur, je veux mettre à jour les niveaux de stock de mes produits.  
- En tant que producteur, je veux recevoir une alerte lorsque le stock d’un produit est faible.  
- En tant que producteur, je veux consulter un tableau de bord regroupant mes stocks.

### 3. Traçabilité et Blockchain
- En tant que producteur, je veux enregistrer chaque étape de production sur la blockchain.  
- En tant que producteur, je veux ajouter des preuves (documents, photos, certificats) pour chaque étape de la chaîne d’approvisionnement.  
- En tant que producteur, je veux consulter l’historique blockchain de mes produits.

### 4. Certifications
- En tant que producteur, je veux uploader mes certifications officielles.  
- En tant que producteur, je veux consulter le statut de validation de mes certifications.  
- En tant que producteur, je veux être notifié lorsqu’une certification arrive à expiration.

### 5. Statistiques et Insights
- En tant que producteur, je veux consulter le nombre de scans de mes produits.  
- En tant que producteur, je veux consulter les avis laissés par les consommateurs.  
- En tant que producteur, je veux analyser les tendances de consultation et d’intérêt pour mes produits.

### 6. Gestion du Compte
- En tant que producteur, je veux gérer les informations de mon entreprise.  
- En tant que producteur, je veux gérer les membres de mon équipe ayant accès au tableau de bord.

---

## **User Stories – Administrateurs**

### 1. Gestion des Utilisateurs
- En tant qu’administrateur, je veux gérer les comptes des consommateurs et des producteurs.  
- En tant qu’administrateur, je veux attribuer des rôles et permissions aux utilisateurs.

### 2. Validation et Contrôle
- En tant qu’administrateur, je veux valider les comptes producteurs avant qu’ils puissent publier des produits.  
- En tant qu’administrateur, je veux vérifier les certifications uploadées par les producteurs.  
- En tant qu’administrateur, je veux modérer les avis et signalements des consommateurs.

### 3. Supervision
- En tant qu’administrateur, je veux consulter les statistiques globales de la plateforme.  
- En tant qu’administrateur, je veux détecter les anomalies dans les données de traçabilité ou les produits.

---

## **User Stories Techniques**

### 1. Blockchain
- En tant que système, je dois enregistrer les données de traçabilité sur la blockchain pour garantir leur immutabilité.  
- En tant que système, je dois générer un identifiant unique pour chaque produit enregistré.

### 2. IA et Recommandations
- En tant que système, je dois analyser les préférences des utilisateurs pour proposer des recommandations pertinentes.  
- En tant que système, je dois détecter automatiquement les incohérences dans les données de traçabilité.

### 3. Sécurité
- En tant que système, je dois assurer une authentification sécurisée pour tous les utilisateurs.  
- En tant que système, je dois permettre une double authentification pour les producteurs et administrateurs.

### 4. Recherche et Filtrage
- En tant que système, je dois permettre une recherche avancée avec filtres (certifications, impact, catégorie, origine).  

### 5. Paiements
- En tant que système, je dois intégrer un service de paiement sécurisé pour permettre l’achat de produits.