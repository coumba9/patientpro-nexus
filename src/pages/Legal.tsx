
const Legal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24 pb-32">
      <div className="container">
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Mentions légales
        </h1>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Éditeur du site</h2>
              <p className="text-gray-600">
                MediConnect SAS<br />
                Capital social : 100 000 €<br />
                RCS Paris B 123 456 789<br />
                123 rue de la Santé<br />
                75000 Paris<br />
                France
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Hébergement</h2>
              <p className="text-gray-600">
                Les données de santé sont hébergées par un hébergeur agréé pour les données de santé (HDS) conformément aux dispositions de l'article L.1111-8 du Code de la Santé Publique.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Protection des données</h2>
              <p className="text-gray-600">
                Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
              <p className="text-gray-600">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez à tout moment désactiver ces cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
              <p className="text-gray-600">
                L'ensemble du contenu de ce site est protégé par le droit d'auteur. Toute reproduction, même partielle, est soumise à notre autorisation préalable.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
