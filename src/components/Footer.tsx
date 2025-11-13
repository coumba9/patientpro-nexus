import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link to="/values" className="text-gray-600 hover:text-primary">
                  Nos valeurs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/uml-diagrams" className="text-gray-600 hover:text-primary opacity-50 text-sm">
                  Diagrammes UML
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-primary">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/find-doctor" className="text-gray-600 hover:text-primary">
                  Trouver un médecin
                </Link>
              </li>
              <li>
                <Link to="/teleconsultation" className="text-gray-600 hover:text-primary">
                  Téléconsultation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Professionnels</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/join-us" className="text-gray-600 hover:text-primary">
                  Pourquoi nous rejoindre
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-primary">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary">
                  CGU
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-gray-600 hover:text-primary">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-gray-600">
          <p>© 2024 JàmmSanté. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
