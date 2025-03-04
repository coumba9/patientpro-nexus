
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export const NavigationButtons = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6 flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
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
  );
};
