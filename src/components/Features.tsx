import { Calendar, Search, Stethoscope, Video, Shield, CreditCard, Heart } from "lucide-react";
import { motion } from "framer-motion";

// Medical cross SVG component
const MedicalCross = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
  </svg>
);

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
      
      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-medical-mint/10 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.1, 0.03] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" 
      />
      
      {/* Floating medical crosses */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[8%]"
      >
        <MedicalCross className="w-10 h-10 text-primary/10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 right-[10%]"
      >
        <MedicalCross className="w-8 h-8 text-medical-mint/10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 right-[5%]"
      >
        <MedicalCross className="w-6 h-6 text-primary/5" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-1/4 left-[15%]"
      >
        <Heart className="w-8 h-8 text-secondary/10" />
      </motion.div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 right-[20%] w-3 h-3 bg-primary/15 rounded-full" />
      <div className="absolute bottom-1/3 left-[25%] w-4 h-4 bg-medical-mint/15 rounded-full" />
      <div className="absolute top-2/3 right-[30%] w-2 h-2 bg-secondary/20 rounded-full" />
      <div className="absolute top-1/2 left-[5%] w-3 h-3 bg-primary/10 rounded-full" />
      
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6 shadow-soft"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
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
              className="group medical-card hover:border-primary/20 relative"
            >
              {/* Decorative gradient corner */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-5 rounded-bl-[50px] -z-10`} />
              
              {/* Icon */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${feature.color} w-fit shadow-soft transition-all duration-300`}
              >
                <feature.icon className="h-7 w-7 text-primary-foreground" />
              </motion.div>
              
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
