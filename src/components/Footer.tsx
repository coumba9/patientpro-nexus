export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Qui sommes-nous
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Nos valeurs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Patients</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Trouver un médecin
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Téléconsultation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Professionnels</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Pourquoi nous rejoindre
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Inscription
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  CGU
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-gray-600">
          <p>© 2024 MediConnect. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};