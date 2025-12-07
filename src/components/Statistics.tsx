import { motion } from "framer-motion";
import { Users, Stethoscope, Calendar, HeartHandshake } from "lucide-react";

const stats = [
  { number: "100k+", label: "Patients satisfaits", icon: Users },
  { number: "10k+", label: "Médecins certifiés", icon: Stethoscope },
  { number: "500k+", label: "Rendez-vous pris", icon: Calendar },
  { number: "24/7", label: "Support disponible", icon: HeartHandshake },
];

export const Statistics = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')]" />
      
      <div className="container relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary-foreground/20">
                <stat.icon className="w-8 h-8 text-primary-foreground/80 mx-auto mb-4" />
                <div className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
