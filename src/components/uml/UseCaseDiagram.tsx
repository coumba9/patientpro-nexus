
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const UseCaseDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Cas d'Utilisation</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre tous les cas d'utilisation pour les différents acteurs du système MediConnect.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            flowchart TD
              %% Acteurs
              Patient["👤 Patient"]
              Medecin["👨‍⚕️ Médecin"]
              Admin["👑 Administrateur"]
              Systeme["🤖 Système"]
              
              %% Cas d'utilisation Patient
              UC1["S'inscrire/Se connecter"]
              UC2["Rechercher un médecin"]
              UC3["Prendre un rendez-vous"]
              UC4["Consulter tickets de RDV"]
              UC5["Accéder au dossier médical"]
              UC6["Téléconsultation"]
              UC7["Gérer son profil"]
              UC8["Payer consultation"]
              UC9["Recevoir notifications"]
              UC10["Consulter ordonnances"]
              UC11["Rejoindre file d'attente"]
              UC12["Annuler/Reprogrammer RDV"]
              
              %% Cas d'utilisation Médecin
              UC13["Gérer les rendez-vous"]
              UC14["Consulter dossier patient"]
              UC15["Faire des téléconsultations"]
              UC16["Rédiger ordonnances"]
              UC17["Gérer disponibilité"]
              UC18["Gérer documents médicaux"]
              UC19["Définir tarifs consultation"]
              UC20["Envoyer messages patients"]
              UC21["Signer documents"]
              UC22["Consulter analytics consultations"]
              
              %% Cas d'utilisation Administrateur
              UC23["Gérer utilisateurs"]
              UC24["Modérer contenus"]
              UC25["Consulter analytics globales"]
              UC26["Gérer spécialités médicales"]
              UC27["Gérer système de paiements"]
              UC28["Configurer notifications"]
              UC29["Gérer file d'attente patients"]
              UC30["Gérer système de rappels"]
              UC31["Gérer contenu du site"]
              UC32["Gérer FAQ"]
              UC33["Superviser transactions"]
              UC34["Gérer politiques annulation"]
              UC35["Modérer rapports utilisateurs"]
              
              %% Cas d'utilisation Système
              UC36["Envoyer rappels automatiques"]
              UC37["Traiter paiements"]
              UC38["Générer notifications"]
              UC39["Calculer métriques"]
              UC40["Gérer authentification"]
              
              %% Relations Patient
              Patient --> UC1
              Patient --> UC2
              Patient --> UC3
              Patient --> UC4
              Patient --> UC5
              Patient --> UC6
              Patient --> UC7
              Patient --> UC8
              Patient --> UC9
              Patient --> UC10
              Patient --> UC11
              Patient --> UC12
              
              %% Relations Médecin
              Medecin --> UC1
              Medecin --> UC13
              Medecin --> UC14
              Medecin --> UC15
              Medecin --> UC16
              Medecin --> UC17
              Medecin --> UC18
              Medecin --> UC19
              Medecin --> UC20
              Medecin --> UC21
              Medecin --> UC22
              
              %% Relations Administrateur
              Admin --> UC1
              Admin --> UC23
              Admin --> UC24
              Admin --> UC25
              Admin --> UC26
              Admin --> UC27
              Admin --> UC28
              Admin --> UC29
              Admin --> UC30
              Admin --> UC31
              Admin --> UC32
              Admin --> UC33
              Admin --> UC34
              Admin --> UC35
              
              %% Relations Système
              Systeme --> UC36
              Systeme --> UC37
              Systeme --> UC38
              Systeme --> UC39
              Systeme --> UC40
              
              %% Styling
              classDef actorStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
              classDef usecaseStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:1px
              
              class Patient,Medecin,Admin,Systeme actorStyle
              class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14,UC15,UC16,UC17,UC18,UC19,UC20,UC21,UC22,UC23,UC24,UC25,UC26,UC27,UC28,UC29,UC30,UC31,UC32,UC33,UC34,UC35,UC36,UC37,UC38,UC39,UC40 usecaseStyle
          `}
        </div>
      </div>
    </div>
  );
};
