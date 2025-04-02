
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
                      class User {
                        +string id
                        +string name
                        +string email
                        +string phone
                        +authenticate()
                      }
                      
                      class Patient {
                        +string[] medicalHistory
                        +Appointment[] appointments
                        +bookAppointment()
                        +viewMedicalRecords()
                      }
                      
                      class Doctor {
                        +string specialty
                        +string[] qualifications
                        +Appointment[] schedule
                        +manageAppointments()
                        +createPrescription()
                      }
                      
                      class Appointment {
                        +string id
                        +Doctor doctor
                        +Patient patient
                        +DateTime date
                        +string type
                        +string status
                        +string location
                        +number price
                        +reschedule()
                        +cancel()
                        +confirm()
                      }
                      
                      class MedicalRecord {
                        +string id
                        +Patient patient
                        +Doctor doctor
                        +string[] diagnoses
                        +DateTime date
                        +string notes
                      }
                      
                      class Prescription {
                        +string id
                        +Patient patient
                        +Doctor doctor
                        +string[] medications
                        +string dosage
                        +DateTime date
                        +string instructions
                      }
                      
                      class Ticket {
                        +string id
                        +Appointment appointment
                        +string paymentStatus
                        +string paymentMethod
                      }

                      User <|-- Patient
                      User <|-- Doctor
                      Patient "1" -- "*" Appointment
                      Doctor "1" -- "*" Appointment
                      Patient "1" -- "*" MedicalRecord
                      Doctor "1" -- "*" MedicalRecord
                      Doctor "1" -- "*" Prescription
                      Patient "1" -- "*" Prescription
                      Appointment "1" -- "1" Ticket
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
                      Doctor(["Médecin"])
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
                      UC11[Rédiger prescriptions]
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
                      
                      Doctor --- UC1
                      Doctor --- UC8
                      Doctor --- UC9
                      Doctor --- UC10
                      Doctor --- UC11
                      Doctor --- UC12
                      
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
                      participant D as Docteur
                      
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
                      S->>D: Notifie nouveau RDV
                      D->>S: Confirme RDV
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
