
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const AdminSequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Séquence - Administration</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre les principales tâches administratives de la plateforme.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant A as Admin
              participant S as Système
              participant DB as Base de Données
              participant U as Utilisateurs
              
              A->>S: Connexion admin
              S->>A: Dashboard
              
              Note over A,S: Gestion Utilisateurs
              A->>S: Consulte utilisateurs
              S->>DB: Récupère données
              DB->>S: Liste utilisateurs
              S->>A: Affiche tableau
              
              A->>S: Modère utilisateur
              S->>DB: Met à jour statut
              S->>U: Notifie utilisateur
              
              Note over A,S: Analytics
              A->>S: Consulte métriques
              S->>DB: Calcule statistiques
              DB->>S: Données analytics
              S->>A: Graphiques et rapports
              
              Note over A,S: Gestion Contenu
              A->>S: Modifie contenu
              S->>DB: Sauvegarde
              S->>A: Confirmation
          `}
        </div>
      </div>
    </div>
  );
};
