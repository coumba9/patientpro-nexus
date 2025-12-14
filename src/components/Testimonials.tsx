import { Star, Quote, Heart } from "lucide-react";
import { motion } from "framer-motion";

// Medical cross SVG component
const MedicalCross = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
  </svg>
);

const testimonials = [
  {
    name: "Aminata Diallo",
    role: "Patiente",
    content: "Une plateforme qui a révolutionné ma façon de gérer ma santé. Plus besoin d'attendre des heures pour prendre rendez-vous !",
    rating: 5,
    gradient: "from-primary to-medical-mint"
  },
  {
    name: "Dr. Ibrahima Ndiaye",
    role: "Cardiologue",
    content: "Un outil professionnel qui me permet de me concentrer sur l'essentiel : mes patients. La gestion des rendez-vous n'a jamais été aussi simple.",
    rating: 5,
    gradient: "from-medical-mint to-primary"
  },
  {
    name: "Fatou Sarr",
    role: "Patiente",
    content: "J'apprécie particulièrement la fonction de téléconsultation. C'est pratique pour les suivis simples ou les renouvellements d'ordonnance.",
    rating: 5,
    gradient: "from-secondary to-medical-coral"
  },
];

export const Testimonials = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-medical-mint/10 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" 
      />
      
      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[10%]"
      >
        <MedicalCross className="w-10 h-10 text-primary/10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 left-[8%]"
      >
        <MedicalCross className="w-8 h-8 text-medical-mint/10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 left-[5%]"
      >
        <Heart className="w-6 h-6 text-secondary/15" />
      </motion.div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 right-[15%] w-3 h-3 bg-primary/20 rounded-full" />
      <div className="absolute bottom-1/3 left-[20%] w-4 h-4 bg-medical-mint/20 rounded-full" />
      <div className="absolute top-2/3 right-[25%] w-2 h-2 bg-secondary/25 rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
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
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Témoignages</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6"
          >
            Ce que disent nos <span className="gradient-text">patients</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Des milliers de patients satisfaits font confiance à JàmmSanté
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="medical-card group relative"
            >
              {/* Decorative gradient corner */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${testimonial.gradient} opacity-5 rounded-bl-[50px] -z-10`} />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Quote className="w-10 h-10 text-primary/20 mb-4 group-hover:text-primary/40 transition-colors" />
              </motion.div>
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 + i * 0.05 }}
                  >
                    <Star
                      className={`h-5 w-5 ${i < testimonial.rating ? "fill-secondary text-secondary" : "fill-muted text-muted"}`}
                    />
                  </motion.div>
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center shadow-soft`}
                >
                  <span className="text-primary-foreground font-display font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </motion.div>
                <div>
                  <p className="font-display font-bold group-hover:text-primary transition-colors">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
