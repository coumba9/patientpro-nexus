import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-b from-sky-50 to-white py-32 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Trouvez votre médecin en quelques clics
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Prenez rendez-vous avec les meilleurs professionnels de santé, 24h/24 et 7j/7
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-5 w-5" />
            Trouver un médecin
          </Button>
          <Button size="lg" variant="outline">
            Je suis médecin
          </Button>
        </div>
      </div>
    </div>
  );
};