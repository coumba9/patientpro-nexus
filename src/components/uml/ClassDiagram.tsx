
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const ClassDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      // Using the correct method: render instead of renderAll
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Classes</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre les principales classes de l'application et leurs relations.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            classDiagram
              class Utilisateur {
                +String id
                +String nom
                +String email
                +String telephone
                +authentifier()
              }
              
              class Patient {
                +String[] antecedentsMedicaux
                +RendezVous[] rendezVous
                +prendreRendezVous()
                +consulterDossierMedical()
              }
              
              class Medecin {
                +String specialite
                +String[] qualifications
                +RendezVous[] agenda
                +gererRendezVous()
                +creerOrdonnance()
              }
              
              class RendezVous {
                +String id
                +Medecin medecin
                +Patient patient
                +DateTime date
                +String type
                +String statut
                +String lieu
                +Number prix
                +reprogrammer()
                +annuler()
                +confirmer()
              }
              
              class DossierMedical {
                +String id
                +Patient patient
                +Medecin medecin
                +String[] diagnostics
                +DateTime date
                +String notes
              }
              
              class Ordonnance {
                +String id
                +Patient patient
                +Medecin medecin
                +String[] medicaments
                +String posologie
                +DateTime date
                +String instructions
              }
              
              class Ticket {
                +String id
                +RendezVous rendezVous
                +String statutPaiement
                +String methodePaiement
              }

              Utilisateur <|-- Patient
              Utilisateur <|-- Medecin
              Patient "1" -- "*" RendezVous
              Medecin "1" -- "*" RendezVous
              Patient "1" -- "*" DossierMedical
              Medecin "1" -- "*" DossierMedical
              Medecin "1" -- "*" Ordonnance
              Patient "1" -- "*" Ordonnance
              RendezVous "1" -- "1" Ticket
          `}
        </div>
      </div>
    </div>
  );
};
