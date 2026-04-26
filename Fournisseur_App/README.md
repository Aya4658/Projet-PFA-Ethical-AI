Fournisseur_App
================

Brève description
- Interface fournisseur (CRUD produits)
- Upload et gestion basique de certificats (expiry, validation simulation)
- Historique d'événements simulé (stock, création, certificats) enregistré dans `localStorage`
- Import/Export CSV et export JSON de l'historique par produit

Lancer localement
1. Ouvrez PowerShell dans le dossier `Fournisseur_App` :
   cd "d:\\PFA\\Projet-PFA-Ethical-AI\\Fournisseur_App"
2. Démarrer un serveur HTTP simple :
   python -m http.server 8000
3. Ouvrir le navigateur : http://localhost:8000

Notes d'utilisation
- Ajouter un produit via "Ajouter un produit".
- Upload de certificats dans le formulaire produit : ajoute le certificat au produit si on est en mode édition, sinon il est attaché temporairement et ajouté lors de la sauvegarde du produit.
- Lorsqu'un certificat est uploadé, vous pouvez saisir une date d'expiration dans le champ "Date d'expiration" avant l'upload.
- Dans la liste produits : "Ajouter étape" enregistre une étape de production dans l'historique (simulation blockchain).
- "Exporter historique" télécharge un fichier JSON des événements liés au produit.

Données persistantes
- `localStorage` keys:
  - `produits_v1` — produits et certificats
  - `fournisseurs_v1` — fournisseurs
  - `blockchain_events_v1` — événements simulés

Pour tests
- Vider le localStorage via les outils dev du navigateur ou exécuter : `localStorage.clear()` dans la console.

Limites
- Simulation côté client uniquement (pas de back-end réel).
- Validation des certificats et blockchain sont simulées.

Si vous voulez que j'ajoute :
- Notifications par e-mail pour certificats expirés (nécessite backend)
- Export CSV enrichi avec statuts des certificats
- Meilleur UI pour gestion des certificats

