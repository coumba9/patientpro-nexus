
import React from "react";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { useNavigate } from "react-router-dom";
import { ClassDiagram } from "@/components/uml/ClassDiagram";
import { UseCaseDiagram } from "@/components/uml/UseCaseDiagram";
import { SequenceDiagram } from "@/components/uml/SequenceDiagram";
import { DiagramInitializer } from "@/components/uml/DiagramInitializer";

const UmlDiagrams = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DiagramInitializer />
      <div className="container py-8">
        <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-primary">Diagrammes UML de l'application</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Cette page présente les diagrammes UML pour visualiser l'architecture de l'application MediConnect.
          </p>

          <div className="space-y-12">
            <ClassDiagram />
            <UseCaseDiagram />
            <SequenceDiagram />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UmlDiagrams;
