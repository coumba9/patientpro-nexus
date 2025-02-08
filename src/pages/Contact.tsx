
const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-8">Contactez-nous</h1>
        <div className="max-w-xl">
          <p className="text-lg text-gray-600 mb-8">
            Notre équipe est à votre disposition pour répondre à toutes vos questions.
          </p>
          <div className="space-y-4">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Email:</span> contact@mediconnect.fr
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Téléphone:</span> +33 1 23 45 67 89
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Adresse:</span> 123 rue de la Santé, 75000 Paris
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
