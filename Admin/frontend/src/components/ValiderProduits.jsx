import { useState } from "react";
import "./ValiderProduits.css";

export default function ValiderProduits() {
  const [produits, setProduits] = useState([
    { nom: "Savon Argan", statut: "Attente" },
    { nom: "Tisane", statut: "En revue" },
  ]);

  return (
    <div className="produits">
      <h2>Valider les produits</h2>

      {produits.map((p, i) => (
        <div key={i} className="card">
          <span>{p.nom}</span>
          <span>{p.statut}</span>
        </div>
      ))}
    </div>
  );
}