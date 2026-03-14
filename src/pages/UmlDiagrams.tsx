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
import { DeploymentDiagram } from "@/components/uml/DeploymentDiagram";
import { DiagramInitializer } from "@/components/uml/DiagramInitializer";
import { MDJExportButton } from "@/components/uml/MDJExportButton";
import { PDFExportButton } from "@/components/uml/PDFExportButton";

const UmlDiagrams = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DiagramInitializer />
      <div className="container py-8">
        <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-primary">Diagrammes UML de JammSante</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Cette page presente les diagrammes UML complets et conformes a l'application JammSante en production,
            incluant toutes les fonctionnalites : gestion des rendez-vous, paiements, notifications, administration, 
            teleconsultations, gestion de contenu, FAQ, journal d'audit et architecture de deploiement.
          </p>

          <MDJExportButton />

          <div className="space-y-12">
            <DeploymentDiagram />
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
