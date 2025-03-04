
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface LoginPromptProps {
  doctorName: string | null;
  specialty: string | null;
}

export const LoginPrompt = ({ doctorName, specialty }: LoginPromptProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-lg mb-6">
        Vous devez être connecté pour prendre un rendez-vous
      </p>
      <Link to={`/login?redirect=/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`}>
        <Button className="w-full sm:w-auto">
          <LogIn className="mr-2 h-5 w-5" />
          Se connecter
        </Button>
      </Link>
    </div>
  );
};
