
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const SequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.renderAll();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Séquence - Prise de Rendez-vous</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre la séquence d'actions lors de la prise d'un rendez-vous médical.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant P as Patient
              participant S as Système
              participant M as Médecin
              
              P->>S: Se connecte
              S->>P: Authentification réussie
              P->>S: Recherche un médecin
              S->>P: Liste des médecins
              P->>S: Sélectionne un médecin
              S->>P: Affiche disponibilités
              P->>S: Choisit créneau
              P->>S: Remplit infos médicales
              P->>S: Sélectionne mode paiement
              P->>S: Confirme et paie
              S->>P: Génère ticket RDV
              S->>M: Notifie nouveau RDV
              M->>S: Confirme RDV
              S->>P: Envoie confirmation
          `}
        </div>
      </div>
    </div>
  );
};
