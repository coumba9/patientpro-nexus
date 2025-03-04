
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
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
        
        <h1 className="text-4xl font-bold mb-8">Tarifs</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Basique</h3>
            <p className="text-3xl font-bold mb-4">15 000 <span className="text-base font-normal">CFA /mois</span></p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>Agenda en ligne</li>
              <li>Gestion des rendez-vous</li>
              <li>Support par email</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-primary">
            <h3 className="text-xl font-semibold mb-4">Pro</h3>
            <p className="text-3xl font-bold mb-4">25 000 <span className="text-base font-normal">CFA /mois</span></p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>Tout le plan Basique</li>
              <li>Téléconsultation</li>
              <li>Support prioritaire</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
            <p className="text-3xl font-bold mb-4">Sur mesure</p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>Tout le plan Pro</li>
              <li>API personnalisée</li>
              <li>Account manager dédié</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
