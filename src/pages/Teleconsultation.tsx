
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Video, Check, Clock, Calendar } from "lucide-react";

const Teleconsultation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Téléconsultation</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="max-w-2xl">
            <p className="text-lg text-gray-600 mb-8">
              Consultez un médecin à distance, sans vous déplacer, grâce à notre service de téléconsultation sécurisé.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-semibold mb-4">Avantages de la téléconsultation</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Consultation depuis chez vous, évitez les déplacements</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Disponible 7j/7, même le soir et le week-end</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Ordonnance électronique signée et sécurisée</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Remboursement par la sécurité sociale (si votre médecin traitant)</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">Comment ça marche ?</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">1</div>
                  <span>Prenez rendez-vous avec un médecin disponible</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">2</div>
                  <span>Recevez un lien de visioconférence sécurisé (Google Meet ou Zoom)</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">3</div>
                  <span>Consultez votre médecin par vidéo au moment du rendez-vous</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">4</div>
                  <span>Recevez votre ordonnance signée électroniquement</span>
                </li>
              </ol>
            </div>
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Video className="h-5 w-5 text-primary mr-2" />
                Prochaine disponibilité
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>Aujourd'hui à partir de 14:00</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>Demain toute la journée</span>
                </div>
                <Link to="/find-doctor?type=teleconsultation">
                  <Button className="w-full mt-4">
                    <Video className="h-4 w-4 mr-2" />
                    Prendre rendez-vous en téléconsultation
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Préparez votre consultation</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Testez votre caméra et votre microphone à l'avance</li>
                <li>• Installez-vous dans un endroit calme et bien éclairé</li>
                <li>• Préparez vos documents médicaux importants</li>
                <li>• Notez vos symptômes et vos questions</li>
                <li>• Ayez votre carte vitale à portée de main</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teleconsultation;
