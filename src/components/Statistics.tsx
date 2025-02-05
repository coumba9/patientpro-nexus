const stats = [
  {
    number: "100k+",
    label: "Patients satisfaits",
  },
  {
    number: "10k+",
    label: "Médecins certifiés",
  },
  {
    number: "500k+",
    label: "Rendez-vous pris",
  },
  {
    number: "24/7",
    label: "Support disponible",
  },
];

export const Statistics = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};