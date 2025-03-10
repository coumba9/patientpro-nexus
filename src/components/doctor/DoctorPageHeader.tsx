
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface DoctorPageHeaderProps {
  onBack: () => void;
}

const DoctorPageHeader: React.FC<DoctorPageHeaderProps> = ({ onBack }) => {
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">Trouver un médecin</h1>
    </>
  );
};

export default DoctorPageHeader;
