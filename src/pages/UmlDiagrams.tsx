
import React, { useEffect, useRef } from "react";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { useNavigate } from "react-router-dom";
import mermaid from "mermaid";

const UmlDiagrams = () => {
  const navigate = useNavigate();
  const classDiagramRef = useRef<HTMLDivElement>(null);
  const useCaseDiagramRef = useRef<HTMLDivElement>(null);
  const sequenceDiagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
    });
    
    // Render all diagrams after component mounts
    setTimeout(() => {
      mermaid.contentLoaded();
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-8">
        <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-primary">Diagrammes UML de l'application</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Cette page présente les diagrammes UML pour visualiser l'architecture de l'application MediConnect.
          </p>

          <div className="space-y-12">
            {/* Diagramme de Classes */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Diagramme de Classes</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ce diagramme illustre les principales classes de l'application et leurs relations.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                <div ref={classDiagramRef} className="mermaid">
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

            {/* Diagramme de Cas d'Utilisation */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Diagramme de Cas d'Utilisation</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ce diagramme illustre les cas d'utilisation principaux pour les différents acteurs du système.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                <div ref={useCaseDiagramRef} className="mermaid">
                  {`
                    graph TD
                      Patient(["Patient"])
                      Medecin(["Médecin"])
                      Admin(["Administrateur"])
                      
                      UC1[S'inscrire/Se connecter]
                      UC2[Rechercher un médecin]
                      UC3[Prendre un rendez-vous]
                      UC4[Consulter tickets de RDV]
                      UC5[Accéder au dossier médical]
                      UC6[Téléconsultation]
                      UC7[Gérer son profil]
                      
                      UC8[Gérer les rendez-vous]
                      UC9[Consulter dossier patient]
                      UC10[Faire des téléconsultations]
                      UC11[Rédiger ordonnances]
                      UC12[Gérer disponibilité]
                      
                      UC13[Gérer utilisateurs]
                      UC14[Modérer contenus]
                      UC15[Consulter statistiques]
                      
                      Patient --- UC1
                      Patient --- UC2
                      Patient --- UC3
                      Patient --- UC4
                      Patient --- UC5
                      Patient --- UC6
                      Patient --- UC7
                      
                      Medecin --- UC1
                      Medecin --- UC8
                      Medecin --- UC9
                      Medecin --- UC10
                      Medecin --- UC11
                      Medecin --- UC12
                      
                      Admin --- UC1
                      Admin --- UC13
                      Admin --- UC14
                      Admin --- UC15
                  `}
                </div>
              </div>
            </div>

            {/* Diagramme de Séquence */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Diagramme de Séquence - Prise de Rendez-vous</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ce diagramme illustre la séquence d'actions lors de la prise d'un rendez-vous médical.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                <div ref={sequenceDiagramRef} className="mermaid">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UmlDiagrams;
