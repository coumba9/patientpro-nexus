
const Teleconsultation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Téléconsultation</h1>
        <div className="max-w-2xl">
          <p className="text-lg text-gray-600 mb-8">
            Consultez un médecin à distance, sans vous déplacer, grâce à notre service de téléconsultation sécurisé.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Avantages de la téléconsultation</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Consultation depuis chez vous</li>
              <li>Disponible 7j/7</li>
              <li>Ordonnance électronique sécurisée</li>
              <li>Remboursement par la sécurité sociale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teleconsultation;
