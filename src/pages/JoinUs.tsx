
const JoinUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Rejoignez-nous</h1>
        <div className="max-w-2xl">
          <p className="text-lg text-gray-600 mb-8">
            Développez votre activité en rejoignant notre réseau de professionnels de santé.
          </p>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Avantages</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Gestion simplifiée de votre agenda</li>
                <li>Plus de visibilité auprès des patients</li>
                <li>Réduction des rendez-vous non honorés</li>
                <li>Support technique dédié</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinUs;
