
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_UseCaseDiagram

left to right direction
skinparam packageStyle rectangle

actor Patient as P
actor Médecin as M
actor Administrateur as A
actor "Système" as S

rectangle "JàmmSanté - Plateforme de Santé" {

  package "Gestion Compte" {
    usecase "S'inscrire" as UC_INS
    usecase "Se connecter" as UC_CON
    usecase "Gérer profil" as UC_PROF
    usecase "Réinitialiser mot de passe" as UC_PWD
  }

  package "Rendez-vous Patient" {
    usecase "Rechercher médecin" as UC_RECH
    usecase "Filtrer par spécialité" as UC_FILT
    usecase "Filtrer par localisation" as UC_LOC
    usecase "Voir disponibilités" as UC_DISPO
    usecase "Prendre rendez-vous" as UC_RDV
    usecase "Renseigner infos médicales" as UC_MED_INFO
    usecase "Payer consultation" as UC_PAY
    usecase "Consulter tickets RDV" as UC_TICK
    usecase "Télécharger ticket PDF" as UC_TICK_PDF
    usecase "Annuler rendez-vous" as UC_ANN
    usecase "Reprogrammer rendez-vous" as UC_REP
    usecase "Recevoir rappels SMS" as UC_SMS_RAP
    usecase "Confirmer présence" as UC_CONF_PAT
  }

  package "Dossier Médical Patient" {
    usecase "Consulter dossier médical" as UC_DOS
    usecase "Voir ordonnances" as UC_ORD
    usecase "Télécharger ordonnance PDF" as UC_ORD_PDF
    usecase "Voir résultats labo" as UC_LABO
    usecase "Voir imagerie médicale" as UC_IMG
    usecase "Voir vaccinations" as UC_VAC
    usecase "Consulter historique consultations" as UC_HIST
  }

  package "Communication Patient" {
    usecase "Recevoir notifications" as UC_NOTIF
    usecase "Envoyer message médecin" as UC_MSG
    usecase "Utiliser chatbot" as UC_CHAT
    usecase "Contacter via WhatsApp" as UC_WHATS
    usecase "Noter médecin" as UC_NOTE
    usecase "Créer ticket support" as UC_SUPP
  }

  package "Paiements" {
    usecase "Payer via Wave" as UC_WAVE
    usecase "Payer via Orange Money" as UC_OM
    usecase "Payer via Free Money" as UC_FREE
    usecase "Payer par carte bancaire" as UC_CB
    usecase "Consulter historique paiements" as UC_HIST_PAY
    usecase "Télécharger facture PDF" as UC_FACT_PDF
  }

  package "Gestion Médecin" {
    usecase "Postuler comme médecin" as UC_POST
    usecase "Soumettre documents" as UC_DOC_POST
    usecase "Gérer rendez-vous" as UC_GER_RDV
    usecase "Voir infos patient avant RDV" as UC_INFO_PAT
    usecase "Confirmer rendez-vous" as UC_CONF_RDV
    usecase "Envoyer SMS confirmation" as UC_SMS_CONF
    usecase "Consulter dossier patient" as UC_DOS_PAT
    usecase "Créer dossier médical" as UC_CREER_DOS
    usecase "Rédiger ordonnance" as UC_RED_ORD
    usecase "Signer document" as UC_SIGN
    usecase "Gérer documents" as UC_GER_DOC
    usecase "Faire téléconsultation" as UC_TELE
    usecase "Consulter analytics" as UC_ANAL_MED
    usecase "Gérer disponibilités" as UC_GER_DISPO
    usecase "Définir tarifs" as UC_TARIF
  }

  package "Administration" {
    usecase "Gérer utilisateurs" as UC_USR
    usecase "Approuver demandes médecins" as UC_APPR
    usecase "Rejeter demandes médecins" as UC_REJ
    usecase "Gérer spécialités" as UC_SPEC
    usecase "Consulter analytics globales" as UC_ANAL
    usecase "Gérer file d'attente" as UC_FILE
    usecase "Configurer rappels SMS" as UC_CONF_SMS
    usecase "Gérer politiques annulation" as UC_POL_ANN
    usecase "Modérer rapports" as UC_MOD
    usecase "Superviser transactions" as UC_TRANS
    usecase "Gérer contenu site" as UC_CONT
    usecase "Gérer FAQ" as UC_FAQ
    usecase "Envoyer notifications globales" as UC_NOTIF_GLOB
  }

  package "Système Automatique" {
    usecase "Programmer rappels 24h" as UC_PROG_RAP
    usecase "Envoyer SMS automatiques" as UC_ENV_SMS
    usecase "Traiter paiements" as UC_TRAIT_PAY
    usecase "Générer notifications" as UC_GEN_NOTIF
    usecase "Calculer métriques" as UC_METR
    usecase "Exécuter cron jobs" as UC_CRON
  }
}

' Relations Patient
P --> UC_INS
P --> UC_CON
P --> UC_PROF
P --> UC_PWD
P --> UC_RECH
P --> UC_FILT
P --> UC_LOC
P --> UC_DISPO
P --> UC_RDV
P --> UC_MED_INFO
P --> UC_PAY
P --> UC_TICK
P --> UC_TICK_PDF
P --> UC_ANN
P --> UC_REP
P --> UC_SMS_RAP
P --> UC_CONF_PAT
P --> UC_DOS
P --> UC_ORD
P --> UC_ORD_PDF
P --> UC_LABO
P --> UC_IMG
P --> UC_VAC
P --> UC_HIST
P --> UC_NOTIF
P --> UC_MSG
P --> UC_CHAT
P --> UC_WHATS
P --> UC_NOTE
P --> UC_SUPP
P --> UC_WAVE
P --> UC_OM
P --> UC_FREE
P --> UC_CB
P --> UC_HIST_PAY
P --> UC_FACT_PDF

' Relations Médecin
M --> UC_CON
M --> UC_PROF
M --> UC_POST
M --> UC_DOC_POST
M --> UC_GER_RDV
M --> UC_INFO_PAT
M --> UC_CONF_RDV
M --> UC_SMS_CONF
M --> UC_DOS_PAT
M --> UC_CREER_DOS
M --> UC_RED_ORD
M --> UC_SIGN
M --> UC_GER_DOC
M --> UC_TELE
M --> UC_ANAL_MED
M --> UC_GER_DISPO
M --> UC_TARIF
M --> UC_MSG
M --> UC_NOTIF

' Relations Admin
A --> UC_CON
A --> UC_USR
A --> UC_APPR
A --> UC_REJ
A --> UC_SPEC
A --> UC_ANAL
A --> UC_FILE
A --> UC_CONF_SMS
A --> UC_POL_ANN
A --> UC_MOD
A --> UC_TRANS
A --> UC_CONT
A --> UC_FAQ
A --> UC_NOTIF_GLOB

' Relations Système
S --> UC_PROG_RAP
S --> UC_ENV_SMS
S --> UC_TRAIT_PAY
S --> UC_GEN_NOTIF
S --> UC_METR
S --> UC_CRON

' Include relations
UC_RDV ..> UC_MED_INFO : <<include>>
UC_RDV ..> UC_PAY : <<include>>
UC_PAY ..> UC_WAVE : <<extend>>
UC_PAY ..> UC_OM : <<extend>>
UC_PAY ..> UC_FREE : <<extend>>
UC_PAY ..> UC_CB : <<extend>>
UC_RDV ..> UC_PROG_RAP : <<include>>
UC_CONF_RDV ..> UC_SMS_CONF : <<include>>
UC_POST ..> UC_DOC_POST : <<include>>

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_UseCaseDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const UseCaseDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme de Cas d'Utilisation</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre tous les cas d'utilisation pour Patient, Médecin, Administrateur et Système automatisé, 
        incluant les rappels SMS, paiements multi-méthodes, et workflow d'approbation médecin.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            flowchart TD
              %% Acteurs
              Patient["👤 Patient"]
              Medecin["👨‍⚕️ Médecin"]
              Admin["👑 Administrateur"]
              Systeme["🤖 Système"]
              
              %% Cas d'utilisation Patient - Rendez-vous
              UC1["S'inscrire/Se connecter"]
              UC2["Rechercher médecin"]
              UC3["Prendre rendez-vous"]
              UC3a["Renseigner infos médicales"]
              UC4["Consulter tickets RDV"]
              UC5["Annuler/Reprogrammer RDV"]
              UC6["Recevoir rappels SMS"]
              
              %% Patient - Dossier médical
              UC7["Consulter dossier médical"]
              UC8["Voir ordonnances"]
              UC9["Télécharger facture PDF"]
              UC10["Noter médecin"]
              
              %% Patient - Paiement
              UC11["Payer via Wave"]
              UC12["Payer via Orange Money"]
              UC13["Payer via Free Money"]
              UC14["Payer par carte bancaire"]
              
              %% Patient - Communication
              UC15["Envoyer message"]
              UC16["Utiliser chatbot"]
              UC17["Contacter WhatsApp"]
              
              %% Médecin
              UC18["Postuler comme médecin"]
              UC19["Soumettre documents"]
              UC20["Gérer rendez-vous"]
              UC21["Voir infos patient avant RDV"]
              UC22["Confirmer RDV + SMS"]
              UC23["Consulter dossier patient"]
              UC24["Créer ordonnance"]
              UC25["Signer documents"]
              UC26["Téléconsultation"]
              UC27["Consulter analytics"]
              
              %% Admin
              UC28["Gérer utilisateurs"]
              UC29["Approuver/Rejeter médecins"]
              UC30["Gérer spécialités"]
              UC31["Consulter analytics"]
              UC32["Configurer rappels SMS"]
              UC33["Gérer politiques annulation"]
              UC34["Modérer rapports"]
              
              %% Système
              UC35["Programmer rappels 24h"]
              UC36["Envoyer SMS automatiques"]
              UC37["Traiter paiements"]
              UC38["Générer notifications"]
              
              %% Relations Patient
              Patient --> UC1
              Patient --> UC2
              Patient --> UC3
              UC3 --> UC3a
              Patient --> UC4
              Patient --> UC5
              Patient --> UC6
              Patient --> UC7
              Patient --> UC8
              Patient --> UC9
              Patient --> UC10
              Patient --> UC11
              Patient --> UC12
              Patient --> UC13
              Patient --> UC14
              Patient --> UC15
              Patient --> UC16
              Patient --> UC17
              
              %% Relations Médecin
              Medecin --> UC1
              Medecin --> UC18
              UC18 --> UC19
              Medecin --> UC20
              Medecin --> UC21
              Medecin --> UC22
              Medecin --> UC23
              Medecin --> UC24
              Medecin --> UC25
              Medecin --> UC26
              Medecin --> UC27
              
              %% Relations Admin
              Admin --> UC1
              Admin --> UC28
              Admin --> UC29
              Admin --> UC30
              Admin --> UC31
              Admin --> UC32
              Admin --> UC33
              Admin --> UC34
              
              %% Relations Système
              Systeme --> UC35
              Systeme --> UC36
              Systeme --> UC37
              Systeme --> UC38
              
              %% Styling
              classDef actorStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
              classDef patientUC fill:#c8e6c9,stroke:#2e7d32,stroke-width:1px
              classDef medecinUC fill:#fff3e0,stroke:#ef6c00,stroke-width:1px
              classDef adminUC fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
              classDef systemeUC fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
              
              class Patient,Medecin,Admin,Systeme actorStyle
              class UC1,UC2,UC3,UC3a,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14,UC15,UC16,UC17 patientUC
              class UC18,UC19,UC20,UC21,UC22,UC23,UC24,UC25,UC26,UC27 medecinUC
              class UC28,UC29,UC30,UC31,UC32,UC33,UC34 adminUC
              class UC35,UC36,UC37,UC38 systemeUC
          `}
        </div>
      </div>
    </div>
  );
};
