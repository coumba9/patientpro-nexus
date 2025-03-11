
const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24 pb-32">
      <div className="container">
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Conditions Générales d'Utilisation
        </h1>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
              <p className="text-gray-600">
                Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'utilisation de la plateforme MediConnect, service de mise en relation entre patients et professionnels de santé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Services proposés</h2>
              <p className="text-gray-600">
                MediConnect propose les services suivants :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                <li>Prise de rendez-vous médicaux en ligne</li>
                <li>Téléconsultation</li>
                <li>Gestion du dossier médical</li>
                <li>Échange sécurisé de documents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Inscription et compte</h2>
              <p className="text-gray-600">
                L'utilisation de certains services nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir ses informations à jour.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Responsabilités</h2>
              <p className="text-gray-600">
                MediConnect ne peut être tenu responsable :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                <li>Des annulations de rendez-vous par les praticiens</li>
                <li>Des problèmes techniques indépendants de notre volonté</li>
                <li>De l'exactitude des informations fournies par les utilisateurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Paiements</h2>
              <p className="text-gray-600">
                Les paiements sont sécurisés et conformes aux normes en vigueur. Les tarifs sont clairement indiqués avant chaque transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Modification des CGU</h2>
              <p className="text-gray-600">
                MediConnect se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications importantes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
