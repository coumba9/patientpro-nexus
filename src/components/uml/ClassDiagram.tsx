
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const ClassDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Classes Simplifié</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre les principales classes de l'application MediConnect et leurs relations essentielles.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            classDiagram
              class Utilisateur {
                +String id
                +String nom
                +String email
                +String role
                +authentifier()
              }
              
              class Patient {
                +String dateNaissance
                +String[] allergies
                +prendreRendezVous()
                +consulterDossier()
              }
              
              class Medecin {
                +String specialite
                +String numeroLicence
                +gererRendezVous()
                +creerOrdonnance()
              }
              
              class Administrateur {
                +gererUtilisateurs()
                +consulterAnalytics()
              }
              
              class RendezVous {
                +String id
                +DateTime date
                +String statut
                +Number prix
                +confirmer()
                +annuler()
              }
              
              class DossierMedical {
                +String id
                +String[] diagnostics
                +String notes
                +consulter()
              }
              
              class Ordonnance {
                +String id
                +String[] medicaments
                +String posologie
                +genererPDF()
              }
              
              class Transaction {
                +String id
                +Number montant
                +String statut
                +traiter()
              }
              
              class Notification {
                +String id
                +String message
                +Boolean estLue
                +envoyer()
              }

              Utilisateur <|-- Patient
              Utilisateur <|-- Medecin
              Utilisateur <|-- Administrateur
              
              Patient "1" -- "*" RendezVous
              Medecin "1" -- "*" RendezVous
              Patient "1" -- "*" DossierMedical
              Medecin "1" -- "*" Ordonnance
              RendezVous "1" -- "1" Transaction
              RendezVous "1" -- "*" Notification
          `}
        </div>
      </div>
    </div>
  );
};
