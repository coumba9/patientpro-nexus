
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

const plantUMLCode = `@startuml JammSante_PaymentSequenceDiagram

title Diagramme de Séquence - Paiement Flexible (3 modes)

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

P -> UI : Choisit mode de paiement
note right: 3 options:\\n1. En ligne (Wave/OM/Free/CB)\\n2. Sur place au cabinet

== Option 1: Paiement En Ligne ==
alt Paiement En Ligne
  UI -> S : POST /initiate-payment
  S -> EF : Invoke secure-paytech
  EF -> PT : POST /payment/request-payment
  
  alt PayTech Success
    PT --> EF : { success: true, redirect_url, token }
    EF --> S : Payment URL + token
    S --> UI : Redirect URL
    
    UI -> P : Redirect vers PayTech
    P -> PT : Interface paiement sécurisée
    
    alt Wave
      P -> PT : Scan QR Code Wave
    else Orange Money
      P -> PT : Code Orange Money
    else Free Money
      P -> PT : Code Free Money
    else Carte Bancaire
      P -> PT : Infos carte + 3D Secure
    end
    
    PT --> P : Redirect success_url
    
    P -> UI : Retour après paiement
    UI -> S : GET /payment-confirmation
    S -> EF : Check payment status
    EF -> PT : GET /check-status
    PT --> EF : status: completed
    
    S -> DB : INSERT appointment (payment_status='paid')
    S -> N : Notifications
    N -> P : "RDV confirmé, paiement reçu"
    
  else PayTech Error
    PT --> EF : { success: false }
    S --> UI : Affiche erreur
    UI --> P : "Erreur paiement, réessayez"
  end

== Option 2: Paiement Sur Place ==
else Paiement Sur Place
  note over P,UI: Aucune redirection paiement
  UI -> S : POST /appointments (payment_method=on-site)
  S -> DB : INSERT appointment (payment_status='on_site')
  note right: RDV créé directement\\nSans paiement en ligne\\nPatient paie au cabinet
  
  S -> N : Notifications
  N -> P : "RDV confirmé - Paiement sur place"
  S --> UI : Success + ticket data
  UI --> P : Affiche ticket RDV
end

== IPN Webhook (Asynchrone - paiements en ligne uniquement) ==
note over PT,S: Notification asynchrone PayTech
PT -> S : POST /verify-payment (IPN)
S -> EF : Verify signature
EF -> DB : Update payment status
EF --> PT : 200 OK

@enduml`;

const mermaidCode = `sequenceDiagram
  participant P as Patient
  participant UI as Interface Web
  participant S as Système
  participant EF as Edge Function
  participant PT as PayTech API
  participant DB as Base de Données
  participant N as Notifications
  
  rect rgb(240, 248, 255)
    Note over P,UI: Sélection du mode de paiement
    P->>UI: Choisit créneau RDV
    UI->>P: Récapitulatif + montant
    P->>UI: Choisit mode de paiement
    Note right of P: 1. En ligne (Wave/OM/Free/CB)<br/>2. Sur place au cabinet
  end
  
  alt Paiement en ligne
    rect rgb(255, 250, 240)
      Note over UI,PT: Initiation Paiement PayTech
      UI->>S: POST /initiate-payment
      S->>EF: Invoke secure-paytech
      EF->>PT: POST /payment/request-payment
      PT-->>EF: redirect_url + token
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
      Note over P,DB: Confirmation paiement
      P->>UI: Retour après paiement
      UI->>S: GET /payment-confirmation
      S->>EF: Check status
      EF->>PT: GET /check-status
      PT-->>EF: status: completed
      
      S->>DB: INSERT appointment (paid)
      S->>N: Notifications
      N->>P: "RDV confirmé, paiement reçu"
    end
    
  else Paiement sur place
    rect rgb(255, 255, 230)
      Note over P,DB: Création directe sans paiement
      UI->>S: POST /appointments (on-site)
      S->>DB: INSERT appointment (on_site)
      Note right of DB: Pas de redirection paiement
      S->>N: Notifications
      N->>P: "RDV confirmé - Paiement sur place"
      S-->>UI: Ticket RDV
    end
  end
  
  rect rgb(255, 245, 245)
    Note over PT,DB: Webhook IPN (async - en ligne uniquement)
    PT->>S: POST /verify-payment
    S->>EF: Verify signature
    EF->>DB: Update status
    EF-->>PT: 200 OK
  end`;

export const PaymentSequenceDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Diagramme de Séquence - Paiement Flexible (3 modes)</h2>
        <DiagramExportButtons
          plantUMLCode={plantUMLCode}
          mermaidCode={mermaidCode}
          diagramName="JammSante_PaymentSequenceDiagram"
        />
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre les 3 modes de paiement: en ligne (Wave, Orange Money, Free Money, carte bancaire),
        et paiement sur place au cabinet. Le webhook IPN ne s'applique qu'aux paiements en ligne.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {mermaidCode}
        </div>
      </div>
    </div>
  );
};
