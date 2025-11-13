
const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24 pb-32">
      <div className="container">
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Politique de confidentialité
        </h1>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Protection de vos données</h2>
              <p className="text-gray-600">
                Chez JàmmSanté, la protection de vos données personnelles et médicales est notre priorité absolue. Nous mettons en œuvre les mesures techniques et organisationnelles les plus strictes pour garantir la sécurité de vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Collecte des données</h2>
              <p className="text-gray-600">
                Nous collectons uniquement les données nécessaires à la fourniture de nos services médicaux :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                <li>Informations d'identification</li>
                <li>Données de santé</li>
                <li>Historique des rendez-vous</li>
                <li>Informations de contact</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Utilisation des données</h2>
              <p className="text-gray-600">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                <li>La gestion de vos rendez-vous médicaux</li>
                <li>La communication avec les professionnels de santé</li>
                <li>L'amélioration de nos services</li>
                <li>Le respect de nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Vos droits</h2>
              <p className="text-gray-600">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-gray-600">
                Pour toute question concernant vos données personnelles, contactez notre Délégué à la Protection des Données :<br />
                Email : dpo@jammsante.fr<br />
                Téléphone : +33 1 23 45 67 89
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
