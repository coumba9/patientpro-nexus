
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Lock } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ReportsTab } from "@/components/admin/moderation/ReportsTab";
import { UsersManagementTab } from "@/components/admin/moderation/UsersManagementTab";
import { RolesPermissionsTab } from "@/components/admin/moderation/RolesPermissionsTab";

const ModerationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminSidebar />

          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="reports">
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
                    <ReportsTab />
                  </TabsContent>

                  <TabsContent value="users">
                    <UsersManagementTab />
                  </TabsContent>

                  <TabsContent value="roles">
                    <RolesPermissionsTab />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
