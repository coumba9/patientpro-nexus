
const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Tarifs</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Basique</h3>
            <p className="text-3xl font-bold mb-4">29€ <span className="text-base font-normal">/mois</span></p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>Agenda en ligne</li>
              <li>Gestion des rendez-vous</li>
              <li>Support par email</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-primary">
            <h3 className="text-xl font-semibold mb-4">Pro</h3>
            <p className="text-3xl font-bold mb-4">49€ <span className="text-base font-normal">/mois</span></p>
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
