
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

interface NavigationHeaderProps {
  isHomePage: boolean;
  onBack: () => void;
}

export const NavigationHeader = ({ isHomePage, onBack }: NavigationHeaderProps) => {
  return (
    <div className="mb-6 flex items-center gap-4">
      {!isHomePage && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      )}
      <Link to="/patient">
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
  );
};
