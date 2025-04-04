
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const UseCaseDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.renderAll();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Cas d'Utilisation</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre les cas d'utilisation principaux pour les différents acteurs du système.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            graph TD
              Patient(["Patient"])
              Medecin(["Médecin"])
              Admin(["Administrateur"])
              
              UC1[S'inscrire/Se connecter]
              UC2[Rechercher un médecin]
              UC3[Prendre un rendez-vous]
              UC4[Consulter tickets de RDV]
              UC5[Accéder au dossier médical]
              UC6[Téléconsultation]
              UC7[Gérer son profil]
              
              UC8[Gérer les rendez-vous]
              UC9[Consulter dossier patient]
              UC10[Faire des téléconsultations]
              UC11[Rédiger ordonnances]
              UC12[Gérer disponibilité]
              
              UC13[Gérer utilisateurs]
              UC14[Modérer contenus]
              UC15[Consulter statistiques]
              
              Patient --- UC1
              Patient --- UC2
              Patient --- UC3
              Patient --- UC4
              Patient --- UC5
              Patient --- UC6
              Patient --- UC7
              
              Medecin --- UC1
              Medecin --- UC8
              Medecin --- UC9
              Medecin --- UC10
              Medecin --- UC11
              Medecin --- UC12
              
              Admin --- UC1
              Admin --- UC13
              Admin --- UC14
              Admin --- UC15
          `}
        </div>
      </div>
    </div>
  );
};
