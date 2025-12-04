
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_SequenceDiagram

title Diagramme de Séquence - Prise de Rendez-vous avec Rappels SMS

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

P -> UI : Sélectionne médecin
UI -> S : GET /doctors/{id}/availability
S -> DB : Query disponibilités
DB --> S : Créneaux disponibles
S --> UI : Calendrier disponible
UI --> P : Affiche créneaux

== Réservation ==
P -> UI : Choisit créneau + infos médicales
UI -> S : POST /appointments
S -> DB : Vérifier disponibilité créneau
DB --> S : Créneau disponible

== Paiement ==
S -> Pay : Initier paiement (Wave/OM/FreeMoney/CB)
Pay --> UI : Interface paiement
P -> Pay : Effectue paiement
Pay -> S : Webhook confirmation
S -> DB : UPDATE appointment (payment_status=paid)

== Création RDV et Rappels ==
S -> DB : INSERT appointment
DB --> S : RDV créé

note over DB : Trigger automatique\\nschedule_appointment_reminder()
DB -> DB : INSERT reminder (24h avant)

S -> N : Créer notification patient
S -> N : Créer notification médecin
N --> P : Notification "RDV créé"
N --> M : Notification "Nouveau RDV"

== Confirmation Médecin ==
M -> UI : Consulte nouveau RDV
UI -> S : GET /appointments
S -> DB : Query RDV
DB --> S : Liste RDV
S --> UI : RDV avec infos patient
UI --> M : Affiche détails patient

M -> UI : Confirme RDV
UI -> S : PUT /appointments/{id}/confirm
S -> DB : UPDATE status='awaiting_patient_confirmation'

S -> SMS : Envoyer SMS confirmation
SMS -> P : "Votre RDV avec Dr X confirmé pour..."
SMS -> DB : INSERT sms_logs

S -> N : Notification patient
N --> P : "Médecin a confirmé votre RDV"

== Rappels Automatiques (24h avant) ==
note over Cron : Cron job toutes les minutes
Cron -> S : GET /process-reminders
S -> DB : SELECT reminders WHERE scheduled_for <= NOW()
DB --> S : Rappels à envoyer

loop Pour chaque rappel
  S -> DB : GET patient phone_number
  DB --> S : Numéro téléphone
  
  S -> SMS : Envoyer SMS rappel
  SMS -> P : "Rappel: RDV demain à Xh..."
  SMS -> DB : INSERT sms_logs
  
  S -> N : Créer notification rappel
  N --> P : Notification rappel
  
  S -> DB : UPDATE reminder (status='sent')
end

== Jour du RDV ==
P -> UI : Consulte ticket RDV
UI -> S : GET /appointments/{id}
S -> DB : Query RDV + documents
DB --> S : Détails complets
S --> UI : Ticket avec QR code
UI --> P : Affiche ticket

M -> UI : Démarre consultation
UI -> S : PUT /appointments/{id}/complete
S -> DB : UPDATE status='completed'

S -> DB : Auto-update reminders (cancelled)
S -> N : Notification "Consultation terminée"
N --> P : "Consultation terminée"

== Post-Consultation ==
M -> UI : Ajoute dossier médical
UI -> S : POST /medical_records
S -> DB : INSERT medical_record
DB --> S : Dossier créé

S -> N : Notification patient
N --> P : "Nouveau dossier médical disponible"

P -> UI : Télécharge facture PDF
UI -> S : GET /invoices/{id}/pdf
S --> UI : Facture PDF
UI --> P : Téléchargement

P -> UI : Note médecin
UI -> S : POST /ratings
S -> DB : INSERT rating
DB --> S : Évaluation enregistrée

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_SequenceDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const SequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme de Séquence - Rendez-vous Complet avec SMS</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le flux complet: prise de RDV, paiement PayTech, confirmation médecin avec SMS, 
        rappels automatiques 24h avant, et suivi post-consultation.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
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
                Note over P,Pay: Paiement sécurisé
                P->>S: Sélectionne paiement (Wave/OM/Free/CB)
                S->>Pay: Initie transaction
                Pay->>P: Interface paiement
                P->>Pay: Effectue paiement
                Pay->>S: Confirmation paiement
              end
              
              rect rgb(200, 200, 230)
                Note over S,DB: Création RDV + Rappel automatique
                S->>DB: INSERT appointment
                DB->>DB: Trigger: schedule_appointment_reminder()
                DB->>DB: INSERT reminder (24h avant)
              end
              
              S->>N: Crée notifications
              N->>P: Notification confirmation
              N->>M: Notification nouveau RDV
              
              rect rgb(230, 220, 200)
                Note over M,SMS: Confirmation médecin + SMS
                M->>S: Consulte infos patient avant RDV
                M->>S: Confirme RDV
                S->>SMS: Envoie SMS confirmation
                SMS->>P: SMS "RDV confirmé avec Dr X..."
                S->>DB: Log SMS
              end
              
              rect rgb(255, 230, 200)
                Note over Cron,SMS: Rappels automatiques 24h avant
                Cron->>S: Process reminders (cron)
                S->>DB: Query rappels à envoyer
                DB->>S: Liste rappels
                S->>SMS: Envoie SMS rappel
                SMS->>P: SMS "Rappel: RDV demain..."
                S->>DB: UPDATE reminder status=sent
              end
              
              Note over P,M: Jour du RDV
              P->>S: Présente ticket
              M->>S: Confirme consultation terminée
              S->>N: Met à jour statut + notifie
              
              rect rgb(220, 240, 220)
                Note over M,P: Post-consultation
                M->>S: Ajoute dossier médical
                S->>N: Notifie patient
                P->>S: Télécharge facture PDF
                P->>S: Note le médecin
              end
          `}
        </div>
      </div>
    </div>
  );
};
