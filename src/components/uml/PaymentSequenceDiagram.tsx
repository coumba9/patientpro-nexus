
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_PaymentSequenceDiagram

title Diagramme de Séquence - Paiement Multi-Méthodes (PayTech)

actor Patient as P
participant "Interface Web" as UI
participant "Système JàmmSanté" as S
participant "Edge Function\\nsecure-paytech" as EF
participant "PayTech API" as PT
participant "Base de Données" as DB
participant "Service Notification" as N

== Sélection Mode Paiement ==
P -> UI : Sélectionne créneau RDV
UI -> P : Affiche récapitulatif + montant

P -> UI : Choisit méthode paiement
note right: - Wave\\n- Orange Money\\n- Free Money\\n- Carte Bancaire

== Initiation Paiement ==
UI -> S : POST /initiate-payment
note right: amount, method,\\nappointment_data

S -> EF : Invoke secure-paytech
EF -> EF : Validate request
EF -> EF : Generate unique ref

EF -> PT : POST /payment/request-payment
note right: item_name: "Consultation"\\namount: montant\\ncurrency: "XOF"\\nenv: "prod"

alt PayTech Success
  PT --> EF : { success: true, redirect_url, token }
  EF --> S : Payment URL + token
  S -> DB : Store payment_token in session
  S --> UI : Redirect URL
  
  UI -> P : Redirect vers PayTech
  P -> PT : Interface paiement sécurisée
  
  alt Wave
    P -> PT : Scan QR Code Wave
    PT -> PT : Process Wave payment
  else Orange Money
    P -> PT : Saisit code Orange Money
    PT -> PT : Process OM payment
  else Free Money
    P -> PT : Saisit code Free Money
    PT -> PT : Process Free payment
  else Carte Bancaire
    P -> PT : Saisit infos carte
    PT -> PT : 3D Secure validation
  end
  
  PT --> P : Redirect success_url
  
else PayTech Error
  PT --> EF : { success: false, error }
  EF --> S : Error response
  S --> UI : Affiche erreur
  UI --> P : "Erreur paiement, réessayez"
end

== Confirmation Paiement ==
P -> UI : Retour après paiement
UI -> S : GET /payment-confirmation?token=xxx

S -> EF : Invoke secure-paytech-status
EF -> PT : GET /payment/check-status
PT --> EF : { status: "completed", amount, ... }

alt Paiement Confirmé
  EF --> S : Payment confirmed
  
  S -> DB : INSERT appointment
  note right: status='pending'\\npayment_status='paid'\\npayment_id=token
  
  S -> DB : Trigger: schedule_reminder
  note right: Rappel SMS 24h avant
  
  S -> N : Create notifications
  N -> P : "RDV confirmé, paiement reçu"
  
  S --> UI : Success + ticket data
  UI --> P : Affiche ticket RDV + reçu
  
  P -> UI : Télécharge ticket PDF
  UI -> S : Generate PDF
  S --> P : Ticket PDF
  
else Paiement Échoué
  EF --> S : Payment failed
  S --> UI : Payment error
  UI --> P : "Paiement non abouti"
  
  P -> UI : Réessayer paiement
  note right: Retour à sélection\\nméthode paiement
end

== IPN Webhook (Asynchrone) ==
note over PT,S: Notification asynchrone PayTech
PT -> S : POST /verify-payment (IPN)
S -> EF : Verify signature
EF -> DB : Update payment status
DB --> EF : Status updated
EF --> PT : 200 OK

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_PaymentSequenceDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const PaymentSequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme de Séquence - Paiement PayTech</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le flux de paiement sécurisé via PayTech avec support Wave, Orange Money, 
        Free Money et carte bancaire, incluant la gestion des webhooks IPN.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            sequenceDiagram
              participant P as Patient
              participant UI as Interface Web
              participant S as Système
              participant EF as Edge Function
              participant PT as PayTech API
              participant DB as Base de Données
              participant N as Notifications
              
              rect rgb(240, 248, 255)
                Note over P,UI: Sélection Paiement
                P->>UI: Choisit créneau RDV
                UI->>P: Récapitulatif + montant
                P->>UI: Sélectionne méthode paiement
                Note right of P: Wave / Orange Money / Free Money / CB
              end
              
              rect rgb(255, 250, 240)
                Note over UI,PT: Initiation Paiement
                UI->>S: POST /initiate-payment
                S->>EF: Invoke secure-paytech
                EF->>PT: POST /payment/request-payment
                PT-->>EF: { redirect_url, token }
                EF-->>S: Payment URL
                S-->>UI: Redirect URL
              end
              
              rect rgb(240, 255, 240)
                Note over P,PT: Paiement Sécurisé
                UI->>P: Redirect PayTech
                
                alt Wave
                  P->>PT: Scan QR Code Wave
                else Orange Money
                  P->>PT: Code Orange Money
                else Free Money
                  P->>PT: Code Free Money
                else Carte Bancaire
                  P->>PT: Infos carte + 3D Secure
                end
                
                PT-->>P: Redirect success_url
              end
              
              rect rgb(245, 255, 250)
                Note over P,DB: Confirmation
                P->>UI: Retour après paiement
                UI->>S: GET /payment-confirmation
                S->>EF: Check payment status
                EF->>PT: GET /check-status
                PT-->>EF: status: completed
                
                EF-->>S: Payment confirmed
                S->>DB: INSERT appointment (paid)
                S->>DB: Trigger: schedule_reminder
                S->>N: Notifications
                N->>P: "RDV confirmé!"
                
                S-->>UI: Ticket data
                UI-->>P: Affiche ticket + reçu PDF
              end
              
              rect rgb(255, 245, 245)
                Note over PT,DB: Webhook IPN (async)
                PT->>S: POST /verify-payment
                S->>EF: Verify signature
                EF->>DB: Update status
                EF-->>PT: 200 OK
              end
          `}
        </div>
      </div>
    </div>
  );
};
