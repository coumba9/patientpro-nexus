
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Shield,
  BarChart,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  UserCheck,
  Lock,
  ShieldCheck,
  Key,
  Edit,
  Trash,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const reports = [
  {
    id: 1,
    type: "Commentaire inapproprié",
    reporter: "Seynabou Seye",
    reported: "Dr. Ahmadou Fall",
    date: "2024-02-19",
    status: "En attente",
    content: "Contenu offensant dans un commentaire sur une question médicale. L'utilisateur a utilisé un langage agressif et des termes inappropriés envers un autre membre.",
  },
  {
    id: 2,
    type: "Comportement suspect",
    reporter: "Sophie Ndiaye",
    reported: "Dr. Amadou Faye",
    date: "2024-02-18",
    status: "En attente",
    content: "Activité suspecte détectée. Le médecin a demandé des informations personnelles qui ne semblent pas nécessaires au contexte médical et a proposé un échange hors plateforme.",
  },
  {
    id: 3,
    type: "Information erronée",
    reporter: "Ansou Fall",
    reported: "Dr. Marie Fall",
    date: "2024-02-17",
    status: "En attente",
    content: "Diffusion d'informations médicales potentiellement incorrectes concernant un traitement non validé scientifiquement, ce qui pourrait représenter un danger pour les patients.",
  },
];

const users = [
  {
    id: 1,
    name: "Aissatou Diallo",
    email: "aissatou.diallo@example.com",
    role: "Admin",
    dateAdded: "2024-01-05",
    status: "Actif",
    permissions: ["all"]
  },
  {
    id: 2,
    name: "Mamadou Sow",
    email: "mamadou.sow@example.com",
    role: "Modérateur",
    dateAdded: "2024-01-15",
    status: "Actif",
    permissions: ["moderate_content", "view_reports", "approve_doctors"]
  },
  {
    id: 3,
    name: "Fatou Ndiaye",
    email: "fatou.ndiaye@example.com",
    role: "Support",
    dateAdded: "2024-02-01",
    status: "Actif",
    permissions: ["view_users", "view_reports"]
  },
  {
    id: 4,
    name: "Omar Ba",
    email: "omar.ba@example.com",
    role: "Éditeur",
    dateAdded: "2024-02-10",
    status: "Inactif",
    permissions: ["edit_content", "view_analytics"]
  },
];

const roleFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du rôle doit contenir au moins 2 caractères",
  }),
  permissions: z.array(z.string()).min(1, {
    message: "Sélectionnez au moins une permission",
  }),
});

const roles = [
  {
    id: 1,
    name: "Admin",
    description: "Accès complet à toutes les fonctionnalités",
    permissions: ["all"],
    userCount: 1
  },
  {
    id: 2,
    name: "Modérateur",
    description: "Gère le contenu et les signalements",
    permissions: ["moderate_content", "view_reports", "approve_doctors"],
    userCount: 2
  },
  {
    id: 3,
    name: "Support",
    description: "Assiste les utilisateurs",
    permissions: ["view_users", "view_reports"],
    userCount: 3
  },
  {
    id: 4,
    name: "Éditeur",
    description: "Gère le contenu du site",
    permissions: ["edit_content", "view_analytics"],
    userCount: 1
  },
];

const availablePermissions = [
  { id: "view_users", label: "Voir les utilisateurs" },
  { id: "edit_users", label: "Modifier les utilisateurs" },
  { id: "delete_users", label: "Supprimer les utilisateurs" },
  { id: "view_reports", label: "Voir les signalements" },
  { id: "moderate_content", label: "Modérer le contenu" },
  { id: "approve_doctors", label: "Approuver les médecins" },
  { id: "edit_content", label: "Éditer le contenu" },
  { id: "view_analytics", label: "Voir les statistiques" },
  { id: "manage_roles", label: "Gérer les rôles" },
  { id: "all", label: "Toutes les permissions" },
];

const ModrationPage = () => {
  const [activeReports, setActiveReports] = useState(reports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleFormMode, setRoleFormMode] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [roleFilter, setRoleFilter] = useState("");

  const form = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const handleApprove = (reportId: number) => {
    setActiveReports(reports.filter((report) => report.id !== reportId));
    toast.success("Le signalement a été résolu et marqué comme traité");
  };

  const handleReject = (reportId: number) => {
    setActiveReports(reports.filter((report) => report.id !== reportId));
    toast.success("Le signalement a été rejeté");
  };

  const handleBan = (reportId: number) => {
    setActiveReports(reports.filter((report) => report.id !== reportId));
    toast.success("L'utilisateur a été banni");
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleUpdateUserRole = (userId, newRole) => {
    toast.success(`Rôle mis à jour avec succès pour l'utilisateur #${userId}`);
    setUserDialogOpen(false);
  };

  const handleCreateRole = () => {
    setRoleFormMode("create");
    form.reset({
      name: "",
      permissions: [],
    });
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setRoleFormMode("edit");
    setSelectedRole(role);
    form.reset({
      name: role.name,
      permissions: role.permissions,
    });
    setRoleDialogOpen(true);
  };

  const handleDeleteRole = (roleId) => {
    toast.success(`Rôle #${roleId} supprimé avec succès`);
  };

  const onRoleSubmit = (data) => {
    if (roleFormMode === "create") {
      toast.success(`Nouveau rôle "${data.name}" créé avec succès`);
    } else {
      toast.success(`Rôle "${data.name}" mis à jour avec succès`);
    }
    setRoleDialogOpen(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.role.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    if (!role) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => user.role === role);
      setFilteredUsers(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
            <h2 className="font-semibold text-lg mb-4">Administration</h2>
            <Link to="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Utilisateurs
              </Button>
            </Link>
            <Link to="/admin/moderation">
              <Button
                variant="ghost"
                className="w-full justify-start bg-gray-100"
                size="lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Modération
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <BarChart className="mr-2 h-5 w-5" />
                Statistiques
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </Link>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="reports" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Signalements
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Utilisateurs
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center">
                    <Lock className="mr-2 h-4 w-4" />
                    Rôles et Permissions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="reports">
                  <h2 className="text-2xl font-bold mb-6">Modération des signalements</h2>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Signalé par</TableHead>
                        <TableHead>Utilisateur signalé</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.type}</TableCell>
                          <TableCell>{report.reporter}</TableCell>
                          <TableCell>{report.reported}</TableCell>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 shadow-sm hover:shadow"
                                onClick={() => handleViewReport(report)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center text-red-600 hover:text-red-700"
                                onClick={() => handleReject(report.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center text-destructive hover:text-destructive"
                                onClick={() => handleBan(report.id)}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Bannir
                              </Button>
                              <Button
                                size="sm"
                                className="flex items-center bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(report.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Résoudre
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {activeReports.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Aucun signalement en attente
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-64 pl-9"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <Select value={roleFilter} onValueChange={handleRoleFilter}>
                        <SelectTrigger className="w-40">
                          <div className="flex items-center">
                            <Filter className="w-4 h-4 mr-2" />
                            <span>{roleFilter || "Filtrer par rôle"}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les rôles</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Modérateur">Modérateur</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Éditeur">Éditeur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Date d'ajout</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "Admin" ? "destructive" : user.role === "Modérateur" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.dateAdded}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "Actif" ? "outline" : "secondary"}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 shadow-sm hover:shadow"
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="roles">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Rôles et permissions</h2>
                    <Button onClick={handleCreateRole} className="flex items-center">
                      <Key className="h-4 w-4 mr-1" />
                      Nouveau rôle
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom du rôle</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Utilisateurs</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell>{role.userCount}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.includes("all") ? (
                                <Badge variant="outline" className="bg-gray-100">Toutes</Badge>
                              ) : (
                                role.permissions.map((perm) => (
                                  <Badge key={perm} variant="outline" className="bg-gray-100">
                                    {availablePermissions.find(p => p.id === perm)?.label || perm}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                                onClick={() => handleEditRole(role)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                              {role.name !== "Admin" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteRole(role.id)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Supprimer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Détails du signalement
            </DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="font-medium">{selectedReport.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p>{selectedReport.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Signalé par</p>
                      <p>{selectedReport.reporter}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Utilisateur signalé</p>
                      <p>{selectedReport.reported}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                    <div className="p-4 bg-gray-50 rounded-md text-sm">
                      {selectedReport.content}
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Fermer
            </Button>
            {selectedReport && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    handleReject(selectedReport.id);
                    setOpenDialog(false);
                  }}
                >
                  Rejeter
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedReport.id);
                    setOpenDialog(false);
                  }}
                >
                  Résoudre
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Détails de l'utilisateur
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <div className="mt-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <Badge 
                      className="mt-2" 
                      variant={selectedUser.role === "Admin" ? "destructive" : selectedUser.role === "Modérateur" ? "default" : "secondary"}
                    >
                      {selectedUser.role}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Rôle actuel</h3>
                      <Select defaultValue={selectedUser.role} onValueChange={(value) => handleUpdateUserRole(selectedUser.id, value)}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Rôles disponibles</SelectLabel>
                            <SelectItem value="Admin">Administrateur</SelectItem>
                            <SelectItem value="Modérateur">Modérateur</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                            <SelectItem value="Éditeur">Éditeur</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Permissions</h3>
                      <div className="space-y-2">
                        {selectedUser.permissions.includes("all") ? (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Toutes les permissions</p>
                                <p className="text-sm text-gray-500">Accès complet à l'ensemble du système</p>
                              </div>
                              <ShieldCheck className="h-5 w-5 text-green-500" />
                            </div>
                          </div>
                        ) : (
                          selectedUser.permissions.map((permission) => (
                            <div key={permission} className="p-3 bg-gray-50 rounded-md">
                              <p className="font-medium">
                                {availablePermissions.find(p => p.id === permission)?.label || permission}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Statut du compte</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Compte actif</p>
                          <p className="text-sm text-gray-500">L'utilisateur peut se connecter à la plateforme</p>
                        </div>
                        <Switch checked={selectedUser.status === "Actif"} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Fermer
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              Sauvegarder les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {roleFormMode === "create" ? "Créer un nouveau rôle" : "Modifier le rôle"}
            </DialogTitle>
            <DialogDescription>
              {roleFormMode === "create" 
                ? "Définissez un nouveau rôle avec des permissions spécifiques." 
                : "Modifiez les permissions et les détails de ce rôle."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onRoleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du rôle</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Modérateur senior" {...field} />
                    </FormControl>
                    <FormDescription>
                      Un nom descriptif pour ce rôle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel className="block mb-2">Permissions</FormLabel>
                <div className="space-y-2 border rounded-md p-4">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={form.watch("permissions")?.includes(permission.id)}
                        onChange={(e) => {
                          const current = form.watch("permissions") || [];
                          if (permission.id === "all") {
                            if (e.target.checked) {
                              form.setValue("permissions", ["all"]);
                            } else {
                              form.setValue("permissions", []);
                            }
                          } else {
                            const newPermissions = e.target.checked
                              ? [...current.filter(p => p !== "all"), permission.id]
                              : current.filter(p => p !== permission.id);
                            form.setValue("permissions", newPermissions);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`permission-${permission.id}`}>{permission.label}</Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.permissions && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.permissions.message}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setRoleDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {roleFormMode === "create" ? "Créer le rôle" : "Sauvegarder les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModrationPage;
