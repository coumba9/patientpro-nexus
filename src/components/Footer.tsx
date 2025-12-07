import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-border/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-medical-mint/3 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container relative py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">JàmmSanté</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Votre plateforme de santé digitale au Sénégal. Prenez rendez-vous avec les meilleurs médecins en toute simplicité.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+221338001234" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <span>+221 33 800 12 34</span>
              </a>
              <a href="mailto:contact@jammsante.sn" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span>contact@jammsante.sn</span>
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Instagram, href: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-2.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-5">À propos</h3>
            <ul className="space-y-3">
              {[
                { to: "/about", label: "Qui sommes-nous" },
                { to: "/values", label: "Nos valeurs" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-foreground mb-5">Patients</h3>
            <ul className="space-y-3">
              {[
                { to: "/how-it-works", label: "Comment ça marche" },
                { to: "/find-doctor", label: "Trouver un médecin" },
                { to: "/teleconsultation", label: "Téléconsultation" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-foreground mb-5">Professionnels</h3>
            <ul className="space-y-3">
              {[
                { to: "/join-us", label: "Nous rejoindre" },
                { to: "/pricing", label: "Tarifs" },
                { to: "/register", label: "Inscription" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} JàmmSanté. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                CGU
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <Link to="/legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Mentions légales
              </Link>
              <Link to="/uml-diagrams" className="text-sm text-muted-foreground/50 hover:text-primary transition-colors">
                UML
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
