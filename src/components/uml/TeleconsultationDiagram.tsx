
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_TeleconsultationDiagram

title Diagramme de Séquence - Téléconsultation

actor Patient as P
participant "Interface Patient" as UIP
participant "Système JàmmSanté" as S
participant "Base de Données" as DB
participant "Service Vidéo" as V
participant "Service Notification" as N
participant "Service SMS" as SMS
participant "Interface Médecin" as UIM
actor Médecin as M

== Prise de RDV Téléconsultation ==
P -> UIP : Sélectionne RDV mode "téléconsultation"
UIP -> S : POST /appointments (mode='teleconsultation')
note right: Même flux paiement\\nque présentiel

S -> DB : INSERT appointment
DB --> S : RDV créé

S -> N : Notifications
N -> P : "RDV téléconsultation confirmé"
N -> M : "Nouveau RDV téléconsultation"

== Préparation Consultation ==
note over S,DB: 24h avant
S -> SMS : Envoyer rappel avec lien
SMS -> P : "Rappel: Téléconsultation demain. Lien: ..."

note over S,DB: 15 min avant
S -> N : Notification préparation
N -> P : "Préparez-vous pour votre téléconsultation"
N -> M : "Téléconsultation dans 15 min"

== Lancement Téléconsultation ==
M -> UIM : Ouvre interface téléconsultation
UIM -> S : GET /appointments/{id}/teleconsultation
S -> V : Créer session vidéo
V --> S : Session ID + tokens
S --> UIM : Lien consultation médecin
UIM --> M : Salle d'attente virtuelle

P -> UIP : Clique sur lien téléconsultation
UIP -> S : GET /appointments/{id}/join
S -> V : Rejoindre session
V --> S : Token patient
S --> UIP : Accès salle vidéo
UIP --> P : Salle d'attente

== Consultation Vidéo ==
M -> UIM : Démarre consultation
UIM -> V : Start video stream
V -> UIP : Connexion établie
UIP -> P : Vidéo médecin visible

P <-> M : Échange vidéo/audio

note over M,P: Pendant consultation
M -> UIM : Consulte dossier patient
UIM -> S : GET /patients/{id}/medical-records
S -> DB : Query dossier
DB --> S : Historique médical
S --> UIM : Dossier patient
UIM --> M : Affiche antécédents

M -> UIM : Prend notes
UIM -> S : POST /notes
S -> DB : INSERT note

== Fin Consultation ==
M -> UIM : Termine téléconsultation
UIM -> V : End session
V --> UIP : Déconnexion

M -> UIM : Rédige ordonnance
UIM -> S : POST /medical-records
S -> DB : INSERT medical_record

M -> UIM : Signe ordonnance numériquement
UIM -> S : PUT /documents/{id}/sign
S -> DB : UPDATE is_signed=true

S -> N : Notification
N -> P : "Ordonnance disponible"

== Post-Téléconsultation ==
P -> UIP : Consulte ordonnance
UIP -> S : GET /documents?type=prescription
S -> DB : Query prescriptions
DB --> S : Liste ordonnances
S --> UIP : Ordonnance signée
UIP --> P : Affiche ordonnance PDF

P -> UIP : Note médecin
UIP -> S : POST /ratings
S -> DB : INSERT rating
DB --> S : Évaluation enregistrée

P -> UIP : Télécharge facture
UIP -> S : GET /invoices/{id}/pdf
S --> UIP : Facture PDF

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_TeleconsultationDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const TeleconsultationDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme de Séquence - Téléconsultation</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le flux complet de téléconsultation: prise de RDV, préparation, 
        session vidéo, rédaction ordonnance et post-consultation.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant P as Patient
              participant UIP as Interface Patient
              participant S as Système
              participant V as Service Vidéo
              participant DB as Base de Données
              participant SMS as SMS
              participant N as Notifications
              participant UIM as Interface Médecin
              participant M as Médecin
              
              rect rgb(230, 245, 255)
                Note over P,M: Prise de RDV Téléconsultation
                P->>UIP: Sélectionne mode téléconsultation
                UIP->>S: POST /appointments (mode=teleconsultation)
                S->>DB: INSERT appointment
                S->>N: Notifications
                N->>P: "RDV téléconsultation confirmé"
                N->>M: "Nouveau RDV téléconsultation"
              end
              
              rect rgb(255, 250, 230)
                Note over S,P: Préparation (24h avant)
                S->>SMS: Rappel avec lien
                SMS->>P: "Rappel: Téléconsultation demain"
              end
              
              rect rgb(230, 255, 230)
                Note over M,P: Lancement Session
                M->>UIM: Ouvre interface téléconsultation
                UIM->>S: GET /teleconsultation
                S->>V: Créer session vidéo
                V-->>S: Session ID
                S-->>UIM: Lien consultation
                
                P->>UIP: Clique lien téléconsultation
                UIP->>S: JOIN /teleconsultation
                S->>V: Rejoindre session
                V-->>UIP: Accès salle vidéo
              end
              
              rect rgb(240, 255, 240)
                Note over M,P: Consultation Vidéo
                M->>V: Start video
                V->>P: Connexion établie
                P<<->>M: Échange vidéo/audio
                
                M->>S: Consulte dossier patient
                S->>DB: Query historique
                DB-->>M: Antécédents médicaux
              end
              
              rect rgb(255, 245, 230)
                Note over M,P: Fin Consultation
                M->>V: Termine session
                V-->>P: Déconnexion
                
                M->>S: Rédige ordonnance
                S->>DB: INSERT medical_record
                M->>S: Signe numériquement
                S->>DB: UPDATE is_signed
                
                S->>N: Notification
                N->>P: "Ordonnance disponible"
              end
              
              rect rgb(245, 240, 255)
                Note over P,S: Post-Téléconsultation
                P->>S: Télécharge ordonnance
                S-->>P: PDF ordonnance signée
                P->>S: Note médecin ⭐
                P->>S: Télécharge facture
                S-->>P: PDF facture
              end
          `}
        </div>
      </div>
    </div>
  );
};
