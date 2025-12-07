import { Calendar, Search, Stethoscope, Video, Shield, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Search,
    title: "Recherche simplifiée",
    description: "Trouvez rapidement le bon professionnel de santé selon vos besoins et votre localisation",
    color: "from-primary to-medical-mint",
  },
  {
    icon: Calendar,
    title: "Prise de RDV facile",
    description: "Réservez votre consultation en quelques clics, 24h/24 et 7j/7, sans attente téléphonique",
    color: "from-medical-mint to-primary",
  },
  {
    icon: Video,
    title: "Téléconsultation",
    description: "Consultez à distance avec nos médecins certifiés depuis le confort de votre domicile",
    color: "from-secondary to-medical-coral",
  },
  {
    icon: Stethoscope,
    title: "Suivi personnalisé",
    description: "Accédez à votre historique médical complet et gérez vos documents en toute sécurité",
    color: "from-primary to-primary-dark",
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description: "Vos informations médicales sont protégées avec un chiffrement de niveau bancaire",
    color: "from-medical-navy to-primary",
  },
  {
    icon: CreditCard,
    title: "Paiement simplifié",
    description: "Payez en ligne via Wave, Orange Money, Free Money ou carte bancaire en toute sécurité",
    color: "from-secondary to-primary",
  },
];

export const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="section-padding relative overflow-hidden bg-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-medical-mint/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6"
          >
            <span className="text-sm font-medium text-primary">Nos services</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-balance"
          >
            Pourquoi choisir{" "}
            <span className="gradient-text">JàmmSanté</span> ?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Une plateforme moderne et sécurisée pour tous vos besoins de santé au Sénégal
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group medical-card hover:border-primary/20"
            >
              {/* Icon */}
              <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${feature.color} w-fit shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <feature.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
