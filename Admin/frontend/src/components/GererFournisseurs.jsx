import { useState } from "react";
import "./GererFournisseurs.css";

export default function GererFournisseurs() {
  const [data, setData] = useState([
    { nom: "Ferme Azul", statut: "Actif" },
    { nom: "Bio Sahara", statut: "Attente" },
  ]);

  return (
    <div className="fournisseurs">
      <h2>Gérer les fournisseurs</h2>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Statut</th>
          </tr>
        </thead>

        <tbody>
          {data.map((f, i) => (
            <tr key={i}>
              <td>{f.nom}</td>
              <td>{f.statut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}