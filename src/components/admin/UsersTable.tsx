
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserX, UserCheck, Mail } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "blocked";
  registeredDate: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    status: "active",
    registeredDate: "2024-01-15",
    lastLogin: "2024-04-10",
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    status: "blocked",
    registeredDate: "2024-02-20",
    lastLogin: "2024-03-28",
  },
];

export const UsersTable = () => {
  const handleStatusChange = (userId: string, newStatus: "active" | "blocked") => {
    console.log(`Changing status for user ${userId} to ${newStatus}`);
  };

  const handleContactUser = (email: string) => {
    console.log(`Contacting user at ${email}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date d'inscription</TableHead>
          <TableHead>Dernière connexion</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.status === "active" ? "success" : "destructive"}>
                {user.status === "active" ? "Actif" : "Bloqué"}
              </Badge>
            </TableCell>
            <TableCell>{user.registeredDate}</TableCell>
            <TableCell>{user.lastLogin}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status === "active" ? "blocked" : "active")}>
                    {user.status === "active" ? (
                      <>
                        <UserX className="mr-2 h-4 w-4" />
                        <span>Bloquer</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        <span>Activer</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleContactUser(user.email)}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contacter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
