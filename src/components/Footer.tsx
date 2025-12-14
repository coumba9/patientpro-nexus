import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowUp, Shield, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useParallax } from "@/hooks/useParallax";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const parallaxOffset = useParallax(0.1);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <footer className="bg-gradient-to-b from-card to-background border-t border-border/30 relative overflow-hidden">
      {/* Decorative Elements with Parallax */}
      <div 
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate(-50%, calc(-50% + ${parallaxOffset * 0.5}px))` }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-medical-mint/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
        style={{ transform: `translate(50%, calc(50% - ${parallaxOffset * 0.3}px))` }}
      />
      <div 
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-medical-coral/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate(-50%, calc(-50% + ${parallaxOffset * 0.2}px))` }}
      />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Medical Crosses */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 opacity-5"
      >
        <svg className="w-20 h-20 text-primary" viewBox="0 0 100 100" fill="currentColor">
          <rect x="40" y="10" width="20" height="80" rx="4" />
          <rect x="10" y="40" width="80" height="20" rx="4" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-40 left-20 opacity-5"
      >
        <svg className="w-16 h-16 text-medical-teal" viewBox="0 0 100 100" fill="currentColor">
          <rect x="40" y="10" width="20" height="80" rx="4" />
          <rect x="10" y="40" width="80" height="20" rx="4" />
        </svg>
      </motion.div>

      <div className="container relative py-16 md:py-24">
        {/* Stats Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-medical-mint/10 to-medical-coral/10 border border-border/30 backdrop-blur-sm"
        >
          {[
            { icon: Users, value: "10,000+", label: "Patients satisfaits" },
            { icon: Heart, value: "500+", label: "Médecins certifiés" },
            { icon: Clock, value: "24/7", label: "Support disponible" },
            { icon: Shield, value: "100%", label: "Données sécurisées" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl md:text-3xl font-display font-bold gradient-text">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">JàmmSanté</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Votre plateforme de santé digitale au Sénégal. Prenez rendez-vous avec les meilleurs médecins en toute simplicité et sécurité.
            </p>
            
            {/* Contact Info with hover effects */}
            <div className="space-y-4">
              {[
                { icon: Phone, href: "tel:+221338001234", text: "+221 33 800 12 34" },
                { icon: Mail, href: "mailto:contact@jammsante.sn", text: "contact@jammsante.sn" },
                { icon: MapPin, href: null, text: "Dakar, Sénégal" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.text}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Social Links with enhanced styling */}
            <div className="flex gap-3 pt-2">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Instagram, href: "#", label: "Instagram" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="p-3 rounded-xl bg-muted hover:bg-gradient-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-soft"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {[
            {
              title: "À propos",
              links: [
                { to: "/about", label: "Qui sommes-nous" },
                { to: "/values", label: "Nos valeurs" },
                { to: "/contact", label: "Contact" },
                { to: "/join-us", label: "Nous rejoindre" },
              ]
            },
            {
              title: "Patients",
              links: [
                { to: "/how-it-works", label: "Comment ça marche" },
                { to: "/find-doctor", label: "Trouver un médecin" },
                { to: "/teleconsultation", label: "Téléconsultation" },
                { to: "/login", label: "Mon compte" },
              ]
            },
            {
              title: "Professionnels",
              links: [
                { to: "/register?type=doctor", label: "Devenir médecin" },
                { to: "/pricing", label: "Tarifs" },
                { to: "/login", label: "Espace médecin" },
              ]
            }
          ].map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            >
              <h3 className="font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: linkIndex * 0.05 }}
                  >
                    <Link 
                      to={link.to} 
                      className="text-muted-foreground hover:text-primary transition-colors hover:pl-2 duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-8 border-t border-border/30"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-sm">
              © {currentYear} JàmmSanté. Tous droits réservés.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { to: "/terms", label: "CGU" },
                { to: "/privacy", label: "Confidentialité" },
                { to: "/legal", label: "Mentions légales" },
                { to: "/uml-diagrams", label: "Documentation" },
              ].map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Scroll to top button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
              aria-label="Retour en haut"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
