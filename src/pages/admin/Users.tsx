
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users as UsersIcon, UserCheck, UserX, Trash2, Mail, Filter, Download, UserPlus, RefreshCw } from "lucide-react";
import UsersTable from "@/components/admin/UsersTable";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import UserStats from "@/components/admin/UserStats";
import { CreateUserDialog } from "@/components/admin/moderation/CreateUserDialog";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedUserType, setSelectedUserType] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const handleBulkAction = (action: string) => {
    toast.success(`Action ${action} appliquée avec succès`);
  };

  const handleExportUsers = () => {
    toast.success("Export des utilisateurs en cours...");
  };

  const handleRefreshData = () => {
    toast.success("Actualisation des données en cours...");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Gestion des utilisateurs</h1>

        {/* Statistiques des utilisateurs */}
        <UserStats />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Liste des utilisateurs</CardTitle>
              <CardDescription>
                Gérez les utilisateurs de la plateforme, leurs rôles et leurs permissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefreshData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportUsers}>
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtres et recherche */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger className="w-40">
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        <span>
                          {selectedUserType === "all" ? "Tous types" : 
                           selectedUserType === "patient" ? "Patients" : 
                           selectedUserType === "doctor" ? "Médecins" : "Admin"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="patient">Patients</SelectItem>
                      <SelectItem value="doctor">Médecins</SelectItem>
                      <SelectItem value="admin">Administrateurs</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="recent">
                    <SelectTrigger className="w-40">
                      <span>Trier par</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Plus récents</SelectItem>
                      <SelectItem value="oldest">Plus anciens</SelectItem>
                      <SelectItem value="a-z">A à Z</SelectItem>
                      <SelectItem value="z-a">Z à A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Onglets de statut */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>Tous</span>
                    <Badge variant="secondary">42</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Actifs</span>
                    <Badge variant="secondary">36</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="blocked" className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    <span>Bloqués</span>
                    <Badge variant="secondary">6</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>En attente</span>
                    <Badge variant="secondary">3</Badge>
                  </TabsTrigger>
                </TabsList>
              
                {/* Actions en lot */}
                <div className="flex items-center justify-between py-4 border-t border-b mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">0</span> utilisateurs sélectionnés
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction("email")} disabled>
                      <Mail className="h-4 w-4 mr-1" />
                      Envoyer un email
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction("block")} disabled>
                      <UserX className="h-4 w-4 mr-1" />
                      Bloquer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")} disabled>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                <TabsContent value="all">
                  <UsersTable />
                </TabsContent>
                <TabsContent value="active">
                  <UsersTable />
                </TabsContent>
                <TabsContent value="blocked">
                  <UsersTable />
                </TabsContent>
                <TabsContent value="pending">
                  <UsersTable />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogue pour ajouter un utilisateur */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Users;
