
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const SequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Séquence - Prise de Rendez-vous</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre le processus simplifié de prise d'un rendez-vous médical.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant P as Patient
              participant S as Système
              participant M as Médecin
              participant Pay as Paiement
              participant N as Notification
              
              P->>S: Se connecte
              S->>P: Interface utilisateur
              
              P->>S: Recherche médecin
              S->>P: Liste des médecins
              
              P->>S: Sélectionne médecin et créneau
              S->>P: Affiche tarifs
              
              P->>S: Confirme réservation
              S->>Pay: Traite paiement
              Pay->>S: Confirmation
              
              S->>S: Crée rendez-vous
              S->>N: Envoie notifications
              N->>P: Confirmation patient
              N->>M: Notification médecin
              
              M->>S: Confirme disponibilité
              S->>N: Rappel automatique
              
              Note over P,M: Jour du RDV
              P->>M: Consultation
          `}
        </div>
      </div>
    </div>
  );
};
