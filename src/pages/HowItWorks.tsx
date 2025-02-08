
const HowItWorks = () => {
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
