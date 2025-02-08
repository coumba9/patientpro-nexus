
const Settings = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Paramètres</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Informations personnelles</h3>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Notifications</h3>
          <p className="text-gray-600">Configurez vos préférences de notification</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Sécurité</h3>
          <p className="text-gray-600">Modifiez votre mot de passe et vos paramètres de sécurité</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
