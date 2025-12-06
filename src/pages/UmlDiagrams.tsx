import React from "react";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { useNavigate } from "react-router-dom";
import { ClassDiagram } from "@/components/uml/ClassDiagram";
import { UseCaseDiagram } from "@/components/uml/UseCaseDiagram";
import { SequenceDiagram } from "@/components/uml/SequenceDiagram";
import { AdminSequenceDiagram } from "@/components/uml/AdminSequenceDiagram";
import { PaymentSequenceDiagram } from "@/components/uml/PaymentSequenceDiagram";
import { StateDiagram } from "@/components/uml/StateDiagram";
import { ActivityDiagram } from "@/components/uml/ActivityDiagram";
import { TeleconsultationDiagram } from "@/components/uml/TeleconsultationDiagram";
import { ERDiagram } from "@/components/uml/ERDiagram";
import { DiagramInitializer } from "@/components/uml/DiagramInitializer";
import { MDJExportButton } from "@/components/uml/MDJExportButton";

const UmlDiagrams = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DiagramInitializer />
      <div className="container py-8">
        <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-primary">Diagrammes UML de JàmmSanté</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Cette page présente les diagrammes UML complets pour visualiser l'architecture de l'application JàmmSanté, 
            incluant toutes les fonctionnalités : gestion des rendez-vous, paiements, notifications, administration, 
            téléconsultations, et gestion de contenu.
          </p>

          <MDJExportButton />

          <div className="space-y-12">
            <ERDiagram />
            <ClassDiagram />
            <UseCaseDiagram />
            <StateDiagram />
            <ActivityDiagram />
            <SequenceDiagram />
            <TeleconsultationDiagram />
            <PaymentSequenceDiagram />
            <AdminSequenceDiagram />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UmlDiagrams;
