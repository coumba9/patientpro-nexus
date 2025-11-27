import { Calendar, Search, Stethoscope, Video } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Search,
    title: "Recherche simplifiée",
    description: "Trouvez rapidement le bon professionnel de santé selon vos besoins",
  },
  {
    icon: Calendar,
    title: "Prise de RDV facile",
    description: "Réservez votre consultation en quelques clics, 24h/24 et 7j/7",
  },
  {
    icon: Video,
    title: "Téléconsultation",
    description: "Consultez à distance avec nos médecins certifiés",
  },
  {
    icon: Stethoscope,
    title: "Suivi personnalisé",
    description: "Accédez à votre historique médical et gérez vos documents",
  },
];

export const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="py-24 px-4 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-30" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Pourquoi choisir{" "}
            <span className="text-transparent bg-clip-text bg-[var(--gradient-primary)]">
              JàmmSanté
            </span>
            ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Une plateforme moderne et sécurisée pour tous vos besoins de santé
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-card border-2 border-border rounded-3xl p-8 hover:shadow-strong hover:border-primary/30 transition-all duration-300"
            >
              <div className="mb-6 p-5 bg-[var(--gradient-hero)] rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-soft">
                <feature.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};
