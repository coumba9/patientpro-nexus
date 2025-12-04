
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility  
const plantUMLCode = `@startuml JammSante_AdminSequenceDiagram

title Diagramme de Séquence - Workflow Approbation Médecin

actor "Candidat Médecin" as C
participant "Interface Web" as UI
participant "Système JàmmSanté" as S
participant "Base de Données" as DB
participant "Storage" as ST
participant "Service Email\\n(Resend)" as E
actor Administrateur as A

== Soumission Candidature ==
C -> UI : Accède formulaire inscription médecin
UI -> C : Affiche formulaire avec champs requis

C -> UI : Remplit informations personnelles
note right: Nom, prénom, email\\nSpécialité, N° licence\\nAnnées d'expérience

C -> UI : Upload documents
note right: Diplôme, Licence\\nAutres documents

UI -> S : POST /doctor-applications
S -> ST : Upload documents vers storage
ST --> S : URLs des documents

S -> DB : INSERT doctor_applications (status='pending')
DB --> S : Application créée

S -> E : Envoyer email confirmation candidat
E -> C : "Votre candidature a été reçue"

S --> UI : Confirmation soumission
UI --> C : "Candidature envoyée, en attente de validation"

== Notification Admin ==
DB ->> S : Trigger: nouvelle application
S -> DB : Query admins
DB --> S : Liste admins

loop Pour chaque admin
  S -> DB : INSERT notification
  note right: type='doctor_application'\\npriority='high'
end

== Revue par Admin ==
A -> UI : Se connecte en tant qu'admin
UI -> S : GET /admin/doctor-applications
S -> DB : SELECT * FROM doctor_applications WHERE status='pending'
DB --> S : Liste candidatures

S --> UI : Candidatures en attente
UI --> A : Affiche liste avec badges

A -> UI : Sélectionne une candidature
UI -> S : GET /doctor-applications/{id}
S -> DB : Query détails + documents
S -> ST : Get documents URLs
ST --> S : URLs signées

S --> UI : Détails complets
UI --> A : Affiche formulaire revue

A -> UI : Consulte documents
UI -> ST : Télécharge documents
ST --> UI : Documents
UI --> A : Affiche documents (PDF viewer)

== Décision: Approbation ==
alt Approbation
  A -> UI : Clique "Approuver"
  UI -> S : POST /approve-doctor-application
  
  S -> DB : Vérifier email existe dans auth.users
  
  alt Utilisateur n'existe pas
    S -> DB : auth.admin.createUser()
    note right: Génère mot de passe temporaire\\nEnvoie email invitation
    DB --> S : Nouveau user créé
  else Utilisateur existe
    S -> DB : Récupère user existant
  end
  
  S -> DB : INSERT doctors (is_verified=true)
  S -> DB : INSERT user_roles (role='doctor')
  S -> DB : UPDATE doctor_applications (status='approved')
  
  S -> E : Envoyer email approbation
  E -> C : "Félicitations! Votre candidature approuvée"
  note right: Inclut lien connexion\\nInstructions démarrage
  
  S --> UI : Succès
  UI --> A : "Médecin approuvé avec succès"

== Décision: Rejet ==
else Rejet
  A -> UI : Clique "Rejeter"
  UI --> A : Modal raison de rejet
  
  A -> UI : Saisit raison détaillée
  UI -> S : POST /reject-doctor-application
  
  S -> DB : UPDATE doctor_applications
  note right: status='rejected'\\nrejection_reason='...'\\nreviewed_by=admin_id
  
  S -> E : Envoyer email rejet
  E -> C : "Candidature non retenue"
  note right: Inclut raisons détaillées\\nPossibilité de resoumettre
  
  S --> UI : Succès
  UI --> A : "Candidature rejetée"
end

== Post-Approbation ==
C -> UI : Reçoit email + se connecte
UI -> S : Login avec credentials
S -> DB : Vérifier is_verified=true
DB --> S : Médecin vérifié

S --> UI : Token JWT (role=doctor)
UI --> C : Accès dashboard médecin

C -> UI : Configure profil
note right: Disponibilités\\nTarifs\\nAdresse cabinet
UI -> S : PUT /doctors/{id}
S -> DB : UPDATE doctors
DB --> S : Profil mis à jour

S --> UI : Succès
UI --> C : "Profil configuré, prêt à recevoir patients"

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_AdminSequenceDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const AdminSequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme de Séquence - Approbation Médecin</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le workflow complet d'approbation des médecins: soumission candidature, 
        upload documents, revue admin, approbation/rejet avec emails automatiques.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant C as Candidat Médecin
              participant UI as Interface Web
              participant S as Système
              participant DB as Base de Données
              participant ST as Storage
              participant E as Service Email
              participant A as Administrateur
              
              rect rgb(230, 240, 250)
                Note over C,DB: Soumission Candidature
                C->>UI: Remplit formulaire inscription
                C->>UI: Upload documents (diplôme, licence)
                UI->>S: POST /doctor-applications
                S->>ST: Upload documents
                ST-->>S: URLs documents
                S->>DB: INSERT doctor_applications
                S->>E: Email confirmation
                E->>C: "Candidature reçue"
              end
              
              rect rgb(255, 245, 230)
                Note over DB,A: Notification Admin
                DB->>S: Trigger nouvelle application
                S->>DB: INSERT notification (admin)
                Note right of A: Badge "Nouvelle candidature"
              end
              
              rect rgb(240, 250, 240)
                Note over A,ST: Revue par Admin
                A->>UI: Consulte candidatures
                UI->>S: GET /admin/doctor-applications
                S->>DB: SELECT pending applications
                S-->>UI: Liste candidatures
                A->>UI: Ouvre détails candidature
                UI->>ST: Télécharge documents
                A->>UI: Examine diplôme, licence
              end
              
              alt Approbation
                rect rgb(220, 250, 220)
                  A->>UI: Clique "Approuver"
                  UI->>S: POST /approve-doctor-application
                  S->>DB: CREATE user + doctor + role
                  S->>DB: UPDATE status='approved'
                  S->>E: Email approbation
                  E->>C: "Félicitations! Compte créé"
                  Note right of C: Reçoit credentials
                end
              else Rejet
                rect rgb(255, 230, 230)
                  A->>UI: Clique "Rejeter"
                  A->>UI: Saisit raison rejet
                  UI->>S: POST /reject-doctor-application
                  S->>DB: UPDATE status='rejected'
                  S->>E: Email rejet avec raisons
                  E->>C: "Candidature non retenue"
                end
              end
              
              rect rgb(230, 245, 255)
                Note over C,DB: Post-Approbation
                C->>UI: Se connecte
                S->>DB: Vérifie is_verified
                UI->>C: Accès dashboard médecin
                C->>UI: Configure profil et disponibilités
              end
          `}
        </div>
      </div>
    </div>
  );
};
