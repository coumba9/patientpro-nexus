
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_UseCaseDiagram

left to right direction
skinparam packageStyle rectangle

actor Patient as P
actor Medecin as M
actor Administrateur as A
actor "Systeme" as S

rectangle "JammSante - Plateforme de Sante" {

  package "Gestion Compte" {
    usecase "S'inscrire" as UC_INS
    usecase "Se connecter" as UC_CON
    usecase "Gerer profil" as UC_PROF
    usecase "Reinitialiser mot de passe" as UC_PWD
  }

  package "Rendez-vous Patient" {
    usecase "Rechercher medecin" as UC_RECH
    usecase "Filtrer par specialite" as UC_FILT
    usecase "Filtrer par localisation" as UC_LOC
    usecase "Voir disponibilites" as UC_DISPO
    usecase "Prendre rendez-vous" as UC_RDV
    usecase "Renseigner infos medicales" as UC_MED_INFO
    usecase "Payer consultation" as UC_PAY
    usecase "Consulter tickets RDV" as UC_TICK
    usecase "Telecharger ticket PDF" as UC_TICK_PDF
    usecase "Annuler rendez-vous" as UC_ANN
    usecase "Reprogrammer rendez-vous" as UC_REP
    usecase "Recevoir rappels SMS" as UC_SMS_RAP
  }

  package "Dossier Medical Patient" {
    usecase "Consulter dossier medical" as UC_DOS
    usecase "Voir ordonnances" as UC_ORD
    usecase "Telecharger ordonnance PDF" as UC_ORD_PDF
    usecase "Voir resultats labo" as UC_LABO
    usecase "Voir imagerie medicale" as UC_IMG
    usecase "Voir vaccinations" as UC_VAC
    usecase "Consulter historique consultations" as UC_HIST
  }

  package "Communication Patient" {
    usecase "Recevoir notifications" as UC_NOTIF
    usecase "Envoyer message medecin" as UC_MSG
    usecase "Utiliser chatbot IA" as UC_CHAT
    usecase "Noter medecin" as UC_NOTE
    usecase "Creer ticket support" as UC_SUPP
  }

  package "Paiements" {
    usecase "Payer via Wave" as UC_WAVE
    usecase "Payer via Orange Money" as UC_OM
    usecase "Payer via Free Money" as UC_FREE
    usecase "Payer par carte bancaire" as UC_CB
    usecase "Payer sur place au cabinet" as UC_SURPLACE
    usecase "Consulter historique paiements" as UC_HIST_PAY
    usecase "Telecharger facture PDF" as UC_FACT_PDF
  }

  package "Gestion Medecin" {
    usecase "Postuler comme medecin" as UC_POST
    usecase "Soumettre documents" as UC_DOC_POST
    usecase "Gerer rendez-vous" as UC_GER_RDV
    usecase "Voir infos patient avant RDV" as UC_INFO_PAT
    usecase "Confirmer rendez-vous" as UC_CONF_RDV
    usecase "Consulter dossier patient" as UC_DOS_PAT
    usecase "Creer dossier medical" as UC_CREER_DOS
    usecase "Rediger ordonnance" as UC_RED_ORD
    usecase "Signer document" as UC_SIGN
    usecase "Gerer documents" as UC_GER_DOC
    usecase "Faire teleconsultation" as UC_TELE
    usecase "Consulter analytics" as UC_ANAL_MED
    usecase "Gerer disponibilites" as UC_GER_DISPO
  }

  package "Administration" {
    usecase "Gerer utilisateurs" as UC_USR
    usecase "Approuver demandes medecins" as UC_APPR
    usecase "Rejeter demandes medecins" as UC_REJ
    usecase "Gerer specialites" as UC_SPEC
    usecase "Consulter analytics globales" as UC_ANAL
    usecase "Gerer file d'attente" as UC_FILE
    usecase "Configurer rappels SMS" as UC_CONF_SMS
    usecase "Gerer politiques annulation" as UC_POL_ANN
    usecase "Moderer rapports" as UC_MOD
    usecase "Superviser transactions" as UC_TRANS
    usecase "Gerer contenu site (Pages)" as UC_CONT
    usecase "Gerer FAQ" as UC_FAQ
    usecase "Envoyer notifications globales" as UC_NOTIF_GLOB
    usecase "Consulter journal audit" as UC_AUDIT
  }

  package "Systeme Automatique" {
    usecase "Programmer rappels 24h" as UC_PROG_RAP
    usecase "Envoyer SMS automatiques" as UC_ENV_SMS
    usecase "Traiter paiements" as UC_TRAIT_PAY
    usecase "Generer notifications" as UC_GEN_NOTIF
    usecase "Calculer metriques" as UC_METR
    usecase "Executer cron jobs" as UC_CRON
    usecase "Logger actions admin" as UC_LOG_AUDIT
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
P --> UC_NOTE
P --> UC_SUPP
P --> UC_WAVE
P --> UC_OM
P --> UC_FREE
P --> UC_CB
P --> UC_SURPLACE
P --> UC_HIST_PAY
P --> UC_FACT_PDF

' Relations Medecin
M --> UC_CON
M --> UC_PROF
M --> UC_POST
M --> UC_DOC_POST
M --> UC_GER_RDV
M --> UC_INFO_PAT
M --> UC_CONF_RDV
M --> UC_DOS_PAT
M --> UC_CREER_DOS
M --> UC_RED_ORD
M --> UC_SIGN
M --> UC_GER_DOC
M --> UC_TELE
M --> UC_ANAL_MED
M --> UC_GER_DISPO
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
A --> UC_AUDIT

' Relations Systeme
S --> UC_PROG_RAP
S --> UC_ENV_SMS
S --> UC_TRAIT_PAY
S --> UC_GEN_NOTIF
S --> UC_METR
S --> UC_CRON
S --> UC_LOG_AUDIT

' Include relations
UC_RDV ..> UC_MED_INFO : <<include>>
UC_RDV ..> UC_PAY : <<include>>
UC_PAY ..> UC_WAVE : <<extend>>
UC_PAY ..> UC_OM : <<extend>>
UC_PAY ..> UC_FREE : <<extend>>
UC_PAY ..> UC_CB : <<extend>>
UC_RDV ..> UC_PROG_RAP : <<include>>
UC_POST ..> UC_DOC_POST : <<include>>

@enduml`;

const mermaidCodeUC = `flowchart TD
  Patient["Patient"]
  Medecin["Medecin"]
  Admin["Administrateur"]
  Systeme["Systeme"]
  UC3["Prendre rendez-vous"]
  UC11["Payer via Wave"]
  UC12["Payer via Orange Money"]
  UC13["Payer via Free Money"]
  UC14["Payer par carte bancaire"]
  UC14b["Payer sur place au cabinet"]
  Patient --> UC3
  Patient --> UC11
  Patient --> UC12
  Patient --> UC13
  Patient --> UC14
  Patient --> UC14b`;

export const UseCaseDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Diagramme de Cas d'Utilisation</h2>
        <DiagramExportButtons
          plantUMLCode={plantUMLCode}
          mermaidCode={mermaidCodeUC}
          diagramName="JammSante_UseCaseDiagram"
        />
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre tous les cas d'utilisation pour Patient, Medecin, Administrateur et Systeme automatise, 
        incluant les rappels SMS, paiements multi-methodes, chatbot IA, gestion FAQ/Pages et journal d'audit.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            flowchart TD
              Patient["Patient"]
              Medecin["Medecin"]
              Admin["Administrateur"]
              Systeme["Systeme"]
              
              UC1["S'inscrire/Se connecter"]
              UC2["Rechercher medecin"]
              UC3["Prendre rendez-vous"]
              UC3a["Renseigner infos medicales"]
              UC4["Consulter tickets RDV"]
              UC5["Annuler/Reprogrammer RDV"]
              UC6["Recevoir rappels SMS"]
              
              UC7["Consulter dossier medical"]
              UC8["Voir ordonnances"]
              UC9["Telecharger facture PDF"]
              UC10["Noter medecin"]
              
              UC11["Payer via Wave"]
              UC12["Payer via Orange Money"]
              UC13["Payer via Free Money"]
              UC14["Payer par carte bancaire"]
              
              UC15["Envoyer message"]
              UC16["Utiliser chatbot IA"]
              UC17["Creer ticket support"]
              
              UC18["Postuler comme medecin"]
              UC19["Soumettre documents"]
              UC20["Gerer rendez-vous"]
              UC21["Voir infos patient avant RDV"]
              UC22["Confirmer RDV"]
              UC23["Consulter dossier patient"]
              UC24["Creer ordonnance"]
              UC25["Signer documents"]
              UC26["Teleconsultation"]
              UC27["Consulter analytics"]
              
              UC28["Gerer utilisateurs"]
              UC29["Approuver/Rejeter medecins"]
              UC30["Gerer specialites"]
              UC31["Consulter analytics globales"]
              UC32["Configurer rappels SMS"]
              UC33["Gerer politiques annulation"]
              UC34["Moderer rapports"]
              UC35["Gerer FAQ"]
              UC36["Gerer pages contenu"]
              UC37["Consulter journal audit"]
              
              UC38["Programmer rappels 24h"]
              UC39["Envoyer SMS automatiques"]
              UC40["Traiter paiements"]
              UC41["Generer notifications"]
              UC42["Logger actions audit"]
              
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
              
              Admin --> UC1
              Admin --> UC28
              Admin --> UC29
              Admin --> UC30
              Admin --> UC31
              Admin --> UC32
              Admin --> UC33
              Admin --> UC34
              Admin --> UC35
              Admin --> UC36
              Admin --> UC37
              
              Systeme --> UC38
              Systeme --> UC39
              Systeme --> UC40
              Systeme --> UC41
              Systeme --> UC42
              
              classDef actorStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
              classDef patientUC fill:#c8e6c9,stroke:#2e7d32,stroke-width:1px
              classDef medecinUC fill:#fff3e0,stroke:#ef6c00,stroke-width:1px
              classDef adminUC fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
              classDef systemeUC fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
              
              class Patient,Medecin,Admin,Systeme actorStyle
              class UC1,UC2,UC3,UC3a,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14,UC15,UC16,UC17 patientUC
              class UC18,UC19,UC20,UC21,UC22,UC23,UC24,UC25,UC26,UC27 medecinUC
              class UC28,UC29,UC30,UC31,UC32,UC33,UC34,UC35,UC36,UC37 adminUC
              class UC38,UC39,UC40,UC41,UC42 systemeUC
          `}
        </div>
      </div>
    </div>
  );
};
