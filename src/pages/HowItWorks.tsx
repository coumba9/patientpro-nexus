import { usePageSEO } from "@/hooks/usePageSEO";

const HowItWorks = () => {
  usePageSEO({
    title: "Comment ça marche",
    description: "Recherchez un médecin, prenez rendez-vous en ligne et consultez en cabinet ou en téléconsultation sur JàmmSanté.",
    path: "/how-it-works",
    jsonLd: { "@type": "HowTo", name: "Comment utiliser JàmmSanté", step: [
      { "@type": "HowToStep", name: "Rechercher un médecin", text: "Utilisez le moteur de recherche pour trouver un professionnel de santé" },
      { "@type": "HowToStep", name: "Prendre rendez-vous", text: "Choisissez un créneau et réservez en ligne" },
      { "@type": "HowToStep", name: "Consulter", text: "Consultez en cabinet ou en téléconsultation" },
    ]},
  });
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Comment ça marche</h1>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">1. Recherchez un médecin</h3>
            <p className="text-gray-600">
              Utilisez notre moteur de recherche pour trouver le professionnel de santé qui vous convient.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">2. Prenez rendez-vous</h3>
            <p className="text-gray-600">
              Choisissez un créneau horaire qui vous convient et réservez en quelques clics.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">3. Consultez</h3>
            <p className="text-gray-600">
              Rendez-vous à votre consultation ou connectez-vous pour une téléconsultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
