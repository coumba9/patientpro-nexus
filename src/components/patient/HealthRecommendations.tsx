
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Dumbbell, Coffee, Salad, Brain, Sun, Zap, BedDouble } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  priority: "high" | "medium" | "low";
}

export const HealthRecommendations = () => {
  const recommendations: Recommendation[] = [
    {
      id: "1",
      title: "Activité physique régulière",
      description: "Pratique d'au moins 30 minutes d'activité physique modérée par jour pour maintenir votre santé cardiovasculaire.",
      icon: <Dumbbell className="h-6 w-6 text-blue-500" />,
      priority: "high"
    },
    {
      id: "2",
      title: "Alimentation équilibrée",
      description: "Consommation quotidienne de fruits et légumes frais, limitation des aliments transformés et riches en sucres.",
      icon: <Salad className="h-6 w-6 text-green-500" />,
      priority: "high"
    },
    {
      id: "3",
      title: "Hydratation adéquate",
      description: "Boire entre 1.5 et 2 litres d'eau par jour pour maintenir une bonne hydratation.",
      icon: <Coffee className="h-6 w-6 text-blue-400" />,
      priority: "medium"
    },
    {
      id: "4",
      title: "Sommeil réparateur",
      description: "Viser 7-8 heures de sommeil par nuit dans un environnement calme et confortable.",
      icon: <BedDouble className="h-6 w-6 text-indigo-500" />,
      priority: "medium"
    },
    {
      id: "5",
      title: "Gestion du stress",
      description: "Pratiquer des techniques de relaxation comme la méditation ou la respiration profonde quotidiennement.",
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      priority: "medium"
    },
    {
      id: "6",
      title: "Exposition au soleil",
      description: "15-20 minutes d'exposition au soleil par jour pour favoriser la production de vitamine D.",
      icon: <Sun className="h-6 w-6 text-yellow-500" />,
      priority: "low"
    },
    {
      id: "7",
      title: "Bilan de santé régulier",
      description: "Effectuer un bilan de santé complet une fois par an pour le suivi préventif.",
      icon: <Heart className="h-6 w-6 text-red-500" />,
      priority: "high"
    },
    {
      id: "8",
      title: "Maintien d'une vie sociale active",
      description: "Entretenir des relations sociales positives pour le bien-être mental et émotionnel.",
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      priority: "low"
    }
  ];

  // Trier les recommandations par priorité
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Recommandations santé</h3>
        <p className="text-gray-500 mb-4">
          Recommandations personnalisées pour améliorer votre bien-être quotidien.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className={`
            border-l-4 
            ${recommendation.priority === 'high' ? 'border-l-red-500' : 
              recommendation.priority === 'medium' ? 'border-l-yellow-500' : 
              'border-l-green-500'}
          `}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {recommendation.icon}
                <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{recommendation.description}</p>
              <div className="mt-2 flex items-center">
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${recommendation.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'}
                `}>
                  {recommendation.priority === 'high' ? 'Priorité élevée' : 
                   recommendation.priority === 'medium' ? 'Priorité moyenne' : 
                   'Priorité basse'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
