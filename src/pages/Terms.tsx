
const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              En utilisant MediConnect, vous acceptez les conditions générales suivantes.
            </p>
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p className="text-gray-600 mb-6">
              Les présentes CGU définissent les modalités d'utilisation de la plateforme MediConnect.
            </p>
            <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
            <p className="text-gray-600 mb-6">
              MediConnect propose une plateforme de mise en relation entre patients et professionnels de santé.
            </p>
            {/* Ajoutez d'autres sections selon vos besoins */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
