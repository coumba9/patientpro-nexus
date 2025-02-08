
const Legal = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Éditeur du site</h2>
            <p className="text-gray-600 mb-6">
              MediConnect SAS<br />
              123 rue de la Santé<br />
              75000 Paris<br />
              France
            </p>
            <h2 className="text-2xl font-semibold mb-4">Hébergement</h2>
            <p className="text-gray-600 mb-6">
              Le site est hébergé par un hébergeur agréé pour les données de santé.
            </p>
            {/* Ajoutez d'autres sections selon vos besoins */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
