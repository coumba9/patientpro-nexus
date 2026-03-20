
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

const plantUMLCode = `@startuml JammSante_SequenceDiagram

title Diagramme de Séquence - Prise de Rendez-vous (3 modes de paiement)

actor Patient as P
participant "Interface Web" as UI
participant "Système JàmmSanté" as S
participant "Base de Données" as DB
participant "Service Paiement\\n(PayTech)" as Pay
participant "Service SMS\\n(Dexchange)" as SMS
participant "Service Notification" as N
participant "Cron Job\\nRappels" as Cron
actor Médecin as M

== Authentification ==
P -> UI : Se connecte
UI -> S : Vérifier credentials
S -> DB : Valider utilisateur
DB --> S : Utilisateur valide
S --> UI : Token JWT
UI --> P : Connexion réussie

== Recherche et Sélection ==
P -> UI : Recherche médecin
UI -> S : GET /doctors?specialty=X
S -> DB : Query médecins disponibles
DB --> S : Liste médecins
S --> UI : Médecins avec créneaux
UI --> P : Affiche résultats

P -> UI : Sélectionne médecin + créneau
UI -> S : GET /doctors/{id}/availability
S -> DB : Query disponibilités
DB --> S : Créneaux disponibles
S --> UI : Calendrier disponible
UI --> P : Affiche créneaux

== Réservation ==
P -> UI : Choisit créneau + infos médicales
UI -> S : POST /appointments

== Choix du Mode de Paiement ==
P -> UI : Sélectionne mode de paiement

alt Paiement en ligne (Wave/OM/Free Money/CB)
  S -> Pay : Initier paiement PayTech
  Pay --> UI : Interface paiement
  P -> Pay : Effectue paiement
  Pay -> S : Webhook confirmation
  S -> DB : INSERT appointment (payment_status='paid')
  
else Paiement sur place au cabinet
  S -> DB : INSERT appointment (payment_status='on_site')
  note right: Pas de redirection paiement\\nRDV créé directement\\nPaiement au cabinet le jour J
end

== Création RDV et Rappels ==
note over DB : Trigger automatique\\nschedule_appointment_reminder()
DB -> DB : INSERT reminder (24h avant)

S -> N : Créer notification patient
S -> N : Créer notification médecin
N --> P : Notification "RDV créé"
N --> M : Notification "Nouveau RDV"

== Confirmation Médecin ==
M -> UI : Consulte nouveau RDV
M -> UI : Confirme RDV
S -> SMS : Envoyer SMS confirmation
SMS -> P : "Votre RDV avec Dr X confirmé pour..."

== Rappels Automatiques (24h avant) ==
Cron -> S : GET /process-reminders
S -> DB : SELECT reminders WHERE scheduled_for <= NOW()

loop Pour chaque rappel
  S -> SMS : Envoyer SMS rappel
  SMS -> P : "Rappel: RDV demain à Xh..."
  S -> DB : UPDATE reminder (status='sent')
end

== Jour du RDV ==
P -> UI : Consulte ticket RDV
M -> UI : Démarre consultation
S -> DB : UPDATE status='completed'

== Post-Consultation ==
M -> UI : Ajoute dossier médical
P -> UI : Télécharge facture PDF
P -> UI : Note le médecin

@enduml`;

const mermaidCode = `sequenceDiagram
  participant P as Patient
  participant S as Système
  participant DB as Base de Données
  participant M as Médecin
  participant Pay as PayTech
  participant SMS as Dexchange SMS
  participant N as Notifications
  participant Cron as Cron Rappels
  
  P->>S: Se connecte
  S->>P: Authentification réussie
  
  P->>S: Recherche un médecin
  S->>P: Liste des médecins disponibles
  
  P->>S: Sélectionne créneau
  P->>S: Remplit infos médicales
  
  rect rgb(200, 230, 200)
    Note over P,Pay: Choix du mode de paiement
    P->>S: Choisit mode de paiement
    
    alt Paiement en ligne (Wave/OM/Free/CB)
      S->>Pay: Initie transaction PayTech
      Pay->>P: Interface paiement
      P->>Pay: Effectue paiement
      Pay->>S: Confirmation paiement
      S->>DB: INSERT appointment (paid)
    else Paiement sur place
      S->>DB: INSERT appointment (on_site)
      Note right of DB: Pas de paiement en ligne
    end
  end
  
  rect rgb(200, 200, 230)
    Note over S,DB: Création RDV + Rappel automatique
    DB->>DB: Trigger: schedule_appointment_reminder()
    DB->>DB: INSERT reminder (24h avant)
  end
  
  S->>N: Crée notifications
  N->>P: Notification confirmation
  N->>M: Notification nouveau RDV
  
  rect rgb(230, 220, 200)
    Note over M,SMS: Confirmation médecin + SMS
    M->>S: Confirme RDV
    S->>SMS: Envoie SMS confirmation
    SMS->>P: SMS "RDV confirmé avec Dr X..."
  end
  
  rect rgb(255, 230, 200)
    Note over Cron,SMS: Rappels automatiques 24h avant
    Cron->>S: Process reminders (cron)
    S->>DB: Query rappels à envoyer
    S->>SMS: Envoie SMS rappel
    SMS->>P: SMS "Rappel: RDV demain..."
  end
  
  Note over P,M: Jour du RDV
  P->>S: Présente ticket
  M->>S: Confirme consultation terminée
  
  rect rgb(220, 240, 220)
    Note over M,P: Post-consultation
    M->>S: Ajoute dossier médical
    P->>S: Télécharge facture PDF
    P->>S: Note le médecin
  end`;

export const SequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Diagramme de Séquence - Rendez-vous (3 modes paiement)</h2>
        <DiagramExportButtons
          plantUMLCode={plantUMLCode}
          mermaidCode={mermaidCode}
          diagramName="JammSante_SequenceDiagram"
        />
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le flux complet: prise de RDV avec 3 options de paiement (en ligne, mobile, sur place), 
        confirmation médecin avec SMS, rappels automatiques 24h avant, et suivi post-consultation.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {mermaidCode}
        </div>
      </div>
    </div>
  );
};
