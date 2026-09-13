import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users as UsersIcon, UserCheck, UserX, Trash2, Mail, Filter, Download, UserPlus, RefreshCw } from "lucide-react";
import UsersTable from "@/components/admin/UsersTable";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import UserStats from "@/components/admin/UserStats";
import { CreateUserDialog } from "@/components/admin/moderation/CreateUserDialog";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedUserType, setSelectedUserType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"block" | "delete" | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);

  const {
    users,
    loading,
    refetch,
    updateRole,
    updateStatus,
    updateProfile,
    deleteUser,
    createUser,
  } = useAdminUsers();

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => u.status === "active").length,
      blocked: users.filter((u) => u.status === "blocked").length,
      pending: users.filter((u) => u.status === "pending").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const tokens = normalize(searchQuery).split(/\s+/).filter(Boolean);

    const result = users.filter((user) => {
      if (selectedTab !== "all" && user.status !== selectedTab) return false;
      if (selectedUserType !== "all" && user.role !== selectedUserType) return false;
      if (tokens.length === 0) return true;
      const haystack = normalize(
        [user.first_name, user.last_name, user.email, user.phone_number].filter(Boolean).join(" ")
      );
      return tokens.every((token) => haystack.includes(token));
    });

    const sorted = [...result];
    sorted.sort((a, b) => {
      const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
      const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "a-z":
          return nameA.localeCompare(nameB);
        case "z-a":
          return nameB.localeCompare(nameA);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return sorted;
  }, [users, searchQuery, selectedTab, selectedUserType, sortBy]);

  const runBulk = async () => {
    if (!bulkAction) return;
    setBulkRunning(true);
    let done = 0;
    let failed = 0;
    for (const id of selectedUsers) {
      try {
        if (bulkAction === "block") await updateStatus(id, true);
        else await deleteUser(id);
        done++;
      } catch {
        failed++;
      }
    }
    setBulkRunning(false);
    setBulkAction(null);
    setSelectedUsers([]);
    if (done) toast.success(`${done} utilisateur(s) traité(s)`);
    if (failed) toast.error(`${failed} échec(s)`);
  };

  const handleBulkEmail = () => {
    const emails = users
      .filter((u) => selectedUsers.includes(u.id) && u.email)
      .map((u) => u.email)
      .join(",");
    if (!emails) {
      toast.error("Aucune adresse email disponible pour la sélection");
      return;
    }
    window.location.href = `mailto:?bcc=${emails}`;
  };

  const handleExportUsers = () => {
    if (filteredUsers.length === 0) {
      toast.error("Aucun utilisateur à exporter");
      return;
    }
    const header = ["Prénom", "Nom", "Email", "Téléphone", "Rôle", "Statut", "Inscription", "Dernière connexion"];
    const rows = filteredUsers.map((u) => [
      u.first_name || "",
      u.last_name || "",
      u.email || "",
      u.phone_number || "",
      u.role,
      u.status,
      u.created_at ? new Date(u.created_at).toLocaleString("fr-FR") : "",
      u.last_login ? new Date(u.last_login).toLocaleString("fr-FR") : "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export terminé");
  };

  const handleRefreshData = async () => {
    await refetch();
    toast.success("Données actualisées");
  };

  const tableProps = {
    users: filteredUsers,
    loading,
    selectedUsers,
    onSelectionChange: setSelectedUsers,
    onUpdateStatus: updateStatus,
    onUpdateRole: updateRole,
    onUpdateProfile: updateProfile,
    onDeleteUser: deleteUser,
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Gestion des utilisateurs</h1>

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
                          {selectedUserType === "all"
                            ? "Tous types"
                            : selectedUserType === "patient"
                            ? "Patients"
                            : selectedUserType === "doctor"
                            ? "Médecins"
                            : "Admin"}
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

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Trier par" />
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

              <Tabs
                value={selectedTab}
                onValueChange={(value) => {
                  setSelectedTab(value);
                  setSelectedUsers([]);
                }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>Tous</span>
                    <Badge variant="secondary">{counts.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Actifs</span>
                    <Badge variant="secondary">{counts.active}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="blocked" className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    <span>Bloqués</span>
                    <Badge variant="secondary">{counts.blocked}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>En attente</span>
                    <Badge variant="secondary">{counts.pending}</Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center justify-between py-4 border-t border-b mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{selectedUsers.length}</span> utilisateur(s) sélectionné(s)
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkEmail}
                      disabled={selectedUsers.length === 0}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Envoyer un email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkAction("block")}
                      disabled={selectedUsers.length === 0}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Bloquer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkAction("delete")}
                      disabled={selectedUsers.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                <TabsContent value="all">
                  <UsersTable {...tableProps} />
                </TabsContent>
                <TabsContent value="active">
                  <UsersTable {...tableProps} />
                </TabsContent>
                <TabsContent value="blocked">
                  <UsersTable {...tableProps} />
                </TabsContent>
                <TabsContent value="pending">
                  <UsersTable {...tableProps} />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={createUser}
      />

      <AlertDialog open={!!bulkAction} onOpenChange={(open) => !open && setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "delete" ? "Supprimer les comptes sélectionnés ?" : "Bloquer les comptes sélectionnés ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUsers.length} compte(s) concerné(s).{" "}
              {bulkAction === "delete"
                ? "Cette action est irréversible."
                : "Les personnes bloquées ne pourront plus se connecter."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkRunning}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                runBulk();
              }}
              disabled={bulkRunning}
              className={bulkAction === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
            >
              {bulkRunning ? "Traitement..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
