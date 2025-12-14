import { CalendarDays, Search, Stethoscope, Video, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Medical cross SVG component
const MedicalCross = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
  </svg>
);

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Trouvez le bon professionnel de santé selon vos besoins et votre localisation",
    step: "01",
    color: "from-primary to-medical-mint"
  },
  {
    icon: CalendarDays,
    title: "Réservez",
    description: "Choisissez un créneau qui vous convient en quelques clics, 24h/24",
    step: "02",
    color: "from-medical-mint to-primary"
  },
  {
    icon: Video,
    title: "Consultez",
    description: "En cabinet ou en téléconsultation selon vos préférences",
    step: "03",
    color: "from-secondary to-medical-coral"
  },
  {
    icon: Stethoscope,
    title: "Suivez",
    description: "Gérez votre santé avec votre espace personnel sécurisé",
    step: "04",
    color: "from-primary to-primary-dark"
  },
];

export const HowItWorks = () => {
  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-72 h-72 bg-medical-mint/10 rounded-full blur-3xl"
        />
        
        {/* Floating medical crosses */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20"
        >
          <MedicalCross className="w-8 h-8 text-primary/10" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-16"
        >
          <MedicalCross className="w-6 h-6 text-medical-mint/10" />
        </motion.div>
        
        {/* Decorative circles */}
        <div className="absolute top-1/2 left-10 w-3 h-3 bg-primary/20 rounded-full" />
        <div className="absolute top-1/3 right-20 w-4 h-4 bg-secondary/20 rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-medical-mint/30 rounded-full" />
      </div>
      
      <div className="container max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6 shadow-soft"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Simple et rapide</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4"
          >
            Comment <span className="gradient-text">ça marche</span> ?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Prenez rendez-vous en 4 étapes simples
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative text-center group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                  className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent origin-left" 
                />
              )}
              
              {/* Step number */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 text-6xl font-display font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-300"
              >
                {step.step}
              </motion.div>
              
              {/* Icon with gradient background */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`relative w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-strong transition-all duration-300`}
              >
                <step.icon className="w-9 h-9 text-primary-foreground" />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              
              <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
