
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

const plantUMLCode = `@startuml JammSante_ActivityDiagram

title Diagramme d'Activité - Processus Complet de Consultation (3 modes paiement)

|Patient|
start
:Rechercher un médecin;
:Filtrer par spécialité/localisation;
:Consulter disponibilités;

if (Créneaux disponibles?) then (oui)
  :Sélectionner créneau;
  :Renseigner informations médicales;
  
  |Système|
  :Vérifier disponibilité créneau;
  
  if (Créneau encore libre?) then (oui)
    |Patient|
    :Choisir mode de paiement;
    
    if (Mode choisi?) then (En ligne)
      fork
        :Wave;
      fork again
        :Orange Money;
      fork again
        :Free Money;
      fork again
        :Carte Bancaire;
      end fork
      
      |Système PayTech|
      :Traiter paiement;
      
      if (Paiement réussi?) then (oui)
        |Système|
        :Créer rendez-vous (payment_status=paid);
      else (non - Paiement échoué)
        |Patient|
        :Afficher erreur paiement;
        :Proposer réessayer;
        stop
      endif
      
    else (Sur place)
      |Système|
      :Créer rendez-vous (payment_status=on_site);
      note right
        Pas de paiement en ligne
        Patient paie au cabinet
        le jour du rendez-vous
      end note
    endif
    
    :Programmer rappel SMS 24h;
    :Envoyer notifications;
    
    fork
      |Patient|
      :Recevoir confirmation;
      :Accéder ticket RDV;
    fork again
      |Médecin|
      :Recevoir notification nouveau RDV;
      :Consulter infos patient;
    end fork
    
    |Médecin|
    :Confirmer rendez-vous;
    
    |Système|
    :Envoyer SMS confirmation patient;
    
    |Système Cron|
    :Attendre 24h avant RDV;
    :Envoyer SMS rappel;
    
    |Jour du Rendez-vous|
    
    if (Patient présent?) then (oui)
      |Médecin|
      :Démarrer consultation;
      :Examiner patient;
      :Rédiger diagnostic;
      
      if (Ordonnance nécessaire?) then (oui)
        :Créer ordonnance;
        :Signer numériquement;
      else (non)
      endif
      
      :Créer dossier médical;
      :Terminer consultation;
      
      |Système|
      :Générer facture PDF;
      :Notifier patient;
      
      |Patient|
      :Télécharger ordonnance;
      :Télécharger facture;
      :Noter médecin (1-5 étoiles);
      
    else (non - Absent)
      |Système|
      :Marquer comme absent;
      :Vérifier politique absence;
      
      if (Excuse valide dans délai?) then (oui)
        :Permettre reprogrammation gratuite;
      else (non)
        :Appliquer pénalité;
      endif
    endif
    
  else (non - Créneau pris)
    |Système|
    :Afficher message créneau indisponible;
    |Patient|
    :Sélectionner autre créneau;
  endif
  
else (non)
  |Système|
  :Proposer file d'attente;
  
  |Patient|
  if (Rejoindre file?) then (oui)
    :S'inscrire en file d'attente;
    |Système|
    :Notifier quand créneau disponible;
  else (non)
    :Rechercher autre médecin;
  endif
endif

stop

@enduml`;

const mermaidCode = `flowchart TD
  A[Patient recherche médecin] --> B[Filtrer spécialité/localisation]
  B --> C{Créneaux disponibles?}
  
  C -->|Oui| D[Sélectionner créneau]
  C -->|Non| Q[Proposer file d'attente]
  
  D --> E[Renseigner infos médicales]
  E --> F{Créneau encore libre?}
  
  F -->|Non| D
  F -->|Oui| G[Choisir mode de paiement]
  
  G --> G1{Mode de paiement}
  
  G1 -->|En ligne| H1[Wave]
  G1 -->|En ligne| H2[Orange Money]
  G1 -->|En ligne| H3[Free Money]
  G1 -->|En ligne| H4[Carte Bancaire]
  G1 -->|Sur place| ONSITE[Paiement sur place au cabinet]
  
  H1 & H2 & H3 & H4 --> I{Paiement réussi?}
  
  I -->|Non| J[Erreur - Réessayer]
  J --> G
  
  I -->|Oui| K[Créer RDV - payment_status=paid]
  ONSITE --> K2[Créer RDV - payment_status=on_site]
  
  K & K2 --> L[Programmer rappel SMS 24h]
  K & K2 --> M[Notifier Patient + Médecin]
  
  M --> N[Médecin confirme RDV]
  N --> O[SMS confirmation envoyé]
  
  L --> P[24h avant: SMS rappel]
  
  P --> R{Jour J: Patient présent?}
  
  R -->|Oui| S[Consultation en cours]
  R -->|Non| T[Marqué absent]
  
  S --> U[Médecin rédige diagnostic]
  U --> V{Ordonnance nécessaire?}
  
  V -->|Oui| W[Créer + signer ordonnance]
  V -->|Non| X[Créer dossier médical]
  W --> X
  
  X --> Y[Consultation terminée]
  Y --> Z[Générer facture PDF]
  Z --> AA[Patient télécharge documents]
  AA --> AB[Patient note médecin]
  
  T --> AC{Excuse valide?}
  AC -->|Oui| AD[Reprogrammation gratuite]
  AC -->|Non| AE[Pénalité appliquée]
  
  Q --> AF{Rejoindre file?}
  AF -->|Oui| AG[Inscription file d'attente]
  AF -->|Non| B
  
  AG --> AH[Notifié quand disponible]
  
  style A fill:#e3f2fd
  style K fill:#c8e6c9
  style K2 fill:#c8e6c9
  style ONSITE fill:#fff9c4
  style Y fill:#c8e6c9
  style J fill:#ffcdd2
  style T fill:#ffcdd2
  style AE fill:#fff3e0`;

export const ActivityDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Diagramme d'Activité - Processus de Consultation</h2>
        <DiagramExportButtons
          plantUMLCode={plantUMLCode}
          mermaidCode={mermaidCode}
          diagramName="JammSante_ActivityDiagram"
        />
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le processus complet incluant les 3 modes de paiement (en ligne, mobile, sur place),
        la gestion des absences, file d'attente et notifications.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {mermaidCode}
        </div>
      </div>
    </div>
  );
};
