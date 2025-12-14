import { motion } from "framer-motion";
import { Users, Stethoscope, Calendar, HeartHandshake } from "lucide-react";

// Medical cross SVG component
const MedicalCross = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
  </svg>
);

const stats = [
  { number: "100k+", label: "Patients satisfaits", icon: Users },
  { number: "10k+", label: "Médecins certifiés", icon: Stethoscope },
  { number: "500k+", label: "Rendez-vous pris", icon: Calendar },
  { number: "24/7", label: "Support disponible", icon: HeartHandshake },
];

export const Statistics = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')]" />
      
      {/* Animated decorative elements */}
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-20 -left-20 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"
      />
      
      {/* Floating medical crosses */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-[15%]"
      >
        <MedicalCross className="w-10 h-10 text-primary-foreground/10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 left-[10%]"
      >
        <MedicalCross className="w-8 h-8 text-primary-foreground/10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-[5%]"
      >
        <MedicalCross className="w-6 h-6 text-primary-foreground/5" />
      </motion.div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/3 right-[8%] w-3 h-3 bg-primary-foreground/10 rounded-full" />
      <div className="absolute bottom-1/4 left-[20%] w-4 h-4 bg-primary-foreground/10 rounded-full" />
      <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-primary-foreground/15 rounded-full" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center"
            >
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary-foreground/20 hover:border-primary-foreground/40 hover:bg-primary-foreground/15 transition-all duration-300 group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 mx-auto mb-4 bg-primary-foreground/10 rounded-xl flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors"
                >
                  <stat.icon className="w-8 h-8 text-primary-foreground/80 group-hover:text-primary-foreground transition-colors" />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-primary-foreground/80 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
