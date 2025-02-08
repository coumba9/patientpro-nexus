
import { Button } from "@/components/ui/button";
import { LogIn, Search, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-b from-sky-50 to-white py-32 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Trouvez votre médecin en quelques clics
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Prenez rendez-vous avec les meilleurs professionnels de santé, 24h/24 et
          7j/7
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/find-doctor">
            <Button size="lg" className="w-full sm:w-auto">
              <Search className="mr-2 h-5 w-5" />
              Trouver un médecin
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-5 w-5" />
              Je suis patient
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <LogIn className="mr-2 h-5 w-5" />
              Connexion
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          <Link to="/register?type=doctor" className="text-primary hover:text-primary/90">
            Vous êtes médecin ? Rejoignez-nous
          </Link>
        </div>
      </div>
    </div>
  );
};
