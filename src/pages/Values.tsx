
const Values = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Nos valeurs</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Excellence</h3>
            <p className="text-gray-600">Nous nous efforçons d'offrir le meilleur service possible à nos utilisateurs.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Innovation</h3>
            <p className="text-gray-600">Nous utilisons les dernières technologies pour améliorer l'expérience de santé.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Confiance</h3>
            <p className="text-gray-600">La confidentialité et la sécurité sont au cœur de nos préoccupations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Values;
