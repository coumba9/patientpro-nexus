import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Download, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  payment_status: string;
  payment_method: string | null;
  payment_date: string | null;
  invoice_number: string | null;
  created_at: string;
  appointment: {
    date: string;
    doctor: {
      profile: {
        first_name: string;
        last_name: string;
      };
    };
  };
}

export const PaymentHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    if (!user?.id) return;
    loadPayments();
  }, [user]);

  const loadPayments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          appointment:appointment_id (
            date,
            doctor:doctor_id (
              profile:id (first_name, last_name)
            )
          )
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as any);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    // TODO: Implémenter la génération et le téléchargement de PDF
    toast.success(`Téléchargement de la facture ${invoiceNumber}...`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Payé
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'cancelled':
      case 'refunded':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            {status === 'refunded' ? 'Remboursé' : 'Annulé'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.payment_status === filter;
  });

  const totalPaid = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.payment_status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total payé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalPaid.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {totalPending.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des paiements</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={filter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('paid')}
              >
                Payés
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                En attente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun paiement trouvé
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        Dr. {payment.appointment?.doctor?.profile?.first_name}{' '}
                        {payment.appointment?.doctor?.profile?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Consultation du{' '}
                        {format(new Date(payment.appointment?.date), 'dd MMMM yyyy', {
                          locale: fr,
                        })}
                      </p>
                      {payment.payment_method && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Méthode: {payment.payment_method}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{payment.amount.toLocaleString()} FCFA</p>
                      {payment.payment_date && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(payment.payment_status)}
                      {payment.payment_status === 'paid' && payment.invoice_number && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadInvoice(payment.id, payment.invoice_number)
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Facture
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
