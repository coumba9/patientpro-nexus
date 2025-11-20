
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PaymentOverview } from "@/components/admin/payments/PaymentOverview";
import { TransactionsList } from "@/components/admin/payments/TransactionsList";
import { PaymentSettings } from "@/components/admin/payments/PaymentSettings";
import { useAdminPayments } from "@/hooks/useAdminPayments";

const PaymentManagement = () => {
  const { stats, loading } = useAdminPayments();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Gestion des paiements</h1>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenus du mois
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.monthlyRevenue.toLocaleString()} FCFA
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% par rapport au mois dernier
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                    <p className="text-xs text-muted-foreground">
                      Ce mois-ci
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux de succès
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.successRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Des paiements réussis
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clients payants
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.payingCustomers}</div>
                    <p className="text-xs text-muted-foreground">
                      Ce mois-ci
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <PaymentOverview />
            </TabsContent>
            
            <TabsContent value="transactions">
              <TransactionsList />
            </TabsContent>
            
            <TabsContent value="settings">
              <PaymentSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
