import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, LifeBuoy, Phone, Mail } from "lucide-react";
import { SupportAssistant } from "@/components/patient/SupportAssistant";
import { SupportTickets } from "@/components/patient/SupportTickets";

export const PatientSupport = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Aide & Assistance</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Obtenez une réponse immédiate avec l'assistant, ou contactez notre équipe.
        </p>
      </div>

      <Tabs defaultValue="assistant" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Assistant
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4" />
            Contacter le support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="space-y-4">
          <SupportAssistant />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Urgence médicale</p>
                  <p className="text-xs text-muted-foreground">Appelez le 15 (SAMU) immédiatement</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">support@jammsante.sn</p>
                  <p className="text-xs text-muted-foreground">Réponse sous 24h ouvrées</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
};
