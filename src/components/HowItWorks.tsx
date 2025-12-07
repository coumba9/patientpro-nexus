import { CalendarDays, Search, Stethoscope, Video, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Trouvez le bon professionnel de santé selon vos besoins et votre localisation",
    step: "01",
  },
  {
    icon: CalendarDays,
    title: "Réservez",
    description: "Choisissez un créneau qui vous convient en quelques clics, 24h/24",
    step: "02",
  },
  {
    icon: Video,
    title: "Consultez",
    description: "En cabinet ou en téléconsultation selon vos préférences",
    step: "03",
  },
  {
    icon: Stethoscope,
    title: "Suivez",
    description: "Gérez votre santé avec votre espace personnel sécurisé",
    step: "04",
  },
];

export const HowItWorks = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-medium text-primary">Simple et rapide</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prenez rendez-vous en 4 étapes simples
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              {/* Step number */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-6xl font-display font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                {step.step}
              </div>
              
              {/* Icon */}
              <div className="relative w-20 h-20 mx-auto mb-6 bg-accent rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium group-hover:scale-110 transition-all duration-300">
                <step.icon className="w-9 h-9 text-primary" />
              </div>
              
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
