import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const PaymentSequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Séquence - Paiement</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre le processus de paiement complet avec PayTech.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant P as Patient
              participant S as Système
              participant PT as PayTech
              participant EF as Edge Function
              participant DB as Base de Données
              participant N as Service Notification
              
              P->>S: Sélectionne mode paiement
              S->>P: Affiche options PayTech
              
              P->>S: Confirme le paiement
              S->>EF: Appelle secure-paytech
              
              EF->>PT: Initie transaction
              Note over EF,PT: Envoie montant, réf, items
              PT->>EF: Retourne token & URL
              
              EF->>S: Retourne données paiement
              S->>P: Redirige vers PayTech
              
              P->>PT: Effectue paiement
              Note over P,PT: Wave, Orange Money, Free Money, CB
              PT->>P: Confirmation paiement
              
              PT->>EF: Callback IPN
              Note over PT,EF: Notification statut paiement
              
              P->>S: Retour depuis PayTech
              S->>EF: Vérifie statut paiement
              EF->>PT: Requête statut transaction
              PT->>EF: Statut confirmé
              
              EF->>DB: Crée rendez-vous
              EF->>DB: Génère ticket
              EF->>N: Crée notifications
              
              N->>P: Envoie confirmation email
              N->>P: Envoie ticket RDV
              
              S->>P: Affiche confirmation
              P->>S: Consulte ticket RDV
          `}
        </div>
      </div>
    </div>
  );
};
