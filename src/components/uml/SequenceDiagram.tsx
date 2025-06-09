
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
      <h2 className="text-2xl font-bold mb-4">Diagramme de Séquence - Prise de Rendez-vous Complète</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre la séquence complète d'actions lors de la prise d'un rendez-vous médical, incluant le paiement et les notifications.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant P as Patient
              participant S as Système
              participant M as Médecin
              participant Pay as Service Paiement
              participant N as Service Notification
              participant R as Service Rappel
              
              P->>S: Se connecte
              S->>P: Authentification réussie
              
              P->>S: Recherche un médecin
              S->>P: Liste des médecins disponibles
              
              P->>S: Sélectionne un médecin
              S->>P: Affiche disponibilités et tarifs
              
              P->>S: Choisit créneau et type consultation
              P->>S: Remplit informations médicales
              
              P->>S: Sélectionne mode paiement
              S->>Pay: Initie transaction
              Pay->>P: Interface de paiement
              P->>Pay: Effectue paiement
              Pay->>S: Confirmation paiement
              
              S->>S: Crée rendez-vous
              S->>S: Génère ticket RDV
              
              S->>N: Crée notification pour patient
              S->>N: Crée notification pour médecin
              N->>P: Envoie confirmation patient
              N->>M: Notifie nouveau RDV
              
              M->>S: Confirme disponibilité
              S->>N: Met à jour statut RDV
              N->>P: Envoie confirmation finale
              
              S->>R: Programme rappels automatiques
              
              Note over R: 24h avant RDV
              R->>N: Envoie rappel patient
              N->>P: Notification rappel
              
              Note over R: 2h avant RDV
              R->>N: Envoie rappel final
              N->>P: SMS/Email rappel
              N->>M: Rappel médecin
              
              Note over P,M: Jour du RDV
              P->>S: Présente ticket
              M->>S: Confirme consultation
              S->>N: Met à jour statut
          `}
        </div>
      </div>
    </div>
  );
};
