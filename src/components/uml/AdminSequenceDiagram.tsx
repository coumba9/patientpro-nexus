
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
      <h2 className="text-2xl font-bold mb-4">Diagramme de Séquence - Gestion Administrative</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre les interactions administratives pour la gestion de la plateforme.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant A as Administrateur
              participant S as Système
              participant DB as Base de Données
              participant N as Service Notification
              participant P as Service Paiement
              participant U as Utilisateurs
              
              A->>S: Se connecte (admin)
              S->>A: Dashboard administrateur
              
              Note over A,S: Gestion des utilisateurs
              A->>S: Consulte liste utilisateurs
              S->>DB: Requête utilisateurs
              DB->>S: Données utilisateurs
              S->>A: Affiche tableau utilisateurs
              
              A->>S: Modère utilisateur
              S->>DB: Met à jour statut
              S->>N: Crée notification
              N->>U: Informe utilisateur
              
              Note over A,S: Gestion des paiements
              A->>S: Consulte transactions
              S->>P: Récupère données paiements
              P->>S: Historique transactions
              S->>A: Analytics paiements
              
              A->>S: Configure tarifs
              S->>DB: Met à jour tarification
              S->>N: Notifie médecins concernés
              
              Note over A,S: Gestion du contenu
              A->>S: Modifie contenu site
              S->>DB: Sauvegarde modifications
              S->>A: Confirmation publication
              
              A->>S: Gère FAQ
              S->>DB: Met à jour FAQ
              S->>A: Contenu mis à jour
              
              Note over A,S: Gestion des notifications
              A->>S: Configure système rappels
              S->>DB: Met à jour paramètres
              S->>N: Reconfigure service
              
              A->>S: Gère file d'attente
              S->>DB: Consulte patients en attente
              DB->>S: Liste file d'attente
              S->>A: Affiche patients en attente
              
              A->>S: Assigne créneaux
              S->>DB: Crée rendez-vous
              S->>N: Notifie patient et médecin
              N->>U: Confirmation créneau assigné
          `}
        </div>
      </div>
    </div>
  );
};
