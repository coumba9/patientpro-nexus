
const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              La protection de vos données personnelles est notre priorité.
            </p>
            <h2 className="text-2xl font-semibold mb-4">1. Collecte des données</h2>
            <p className="text-gray-600 mb-6">
              Nous collectons uniquement les données nécessaires à la fourniture de nos services.
            </p>
            <h2 className="text-2xl font-semibold mb-4">2. Utilisation des données</h2>
            <p className="text-gray-600 mb-6">
              Vos données sont utilisées exclusivement dans le cadre de nos services médicaux.
            </p>
            {/* Ajoutez d'autres sections selon vos besoins */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
