
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Clock, MapPin, FileText, ClipboardList } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: string;
  notes?: string;
  diagnosis?: string;
  prescriptions?: string[];
}

export const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // Exemple de données
    const exampleAppointments: Appointment[] = [
      {
        id: "1",
        doctor: "Dr. Sarah Martin",
        specialty: "Cardiologie",
        date: "2024-02-15",
        time: "10:30",
        location: "Clinique Centrale",
        type: "Consultation",
        status: "completed",
        notes: "Patient présentant des douleurs thoraciques légères et intermittentes.",
        diagnosis: "Hypertension artérielle de stade 1",
        prescriptions: ["Amlodipine 5mg - 1 comprimé par jour"]
      },
      {
        id: "2",
        doctor: "Dr. Thomas Bernard",
        specialty: "Médecine générale",
        date: "2024-01-05",
        time: "09:00",
        location: "Cabinet médical du centre",
        type: "Suivi",
        status: "completed",
        notes: "Contrôle de routine, pas de symptômes particuliers.",
        diagnosis: "Bonne santé générale",
        prescriptions: ["Vitamine D3 1000UI - 1 comprimé par jour pendant 3 mois"]
      },
      {
        id: "3",
        doctor: "Dr. Marie Dupont",
        specialty: "Dermatologie",
        date: "2023-12-20",
        time: "14:15",
        location: "Teleconsultation",
        type: "Consultation",
        status: "completed",
        notes: "Éruption cutanée sur l'avant-bras gauche, démangeaisons.", 
        diagnosis: "Dermatite de contact",
        prescriptions: ["Hydrocortisone 1% - Appliquer 2 fois par jour pendant 7 jours"]
      }
    ];

    setAppointments(exampleAppointments);
  }, []);

  const viewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Historique des rendez-vous</h3>
        <p className="text-gray-500 mb-4">
          Consultez vos rendez-vous médicaux passés et leurs résultats.
        </p>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Aucun rendez-vous passé à afficher.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDate(appointment.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.doctor}</p>
                        <p className="text-xs text-gray-500">{appointment.specialty}</p>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {appointment.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewDetails(appointment)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Date et heure</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedAppointment.date)} à {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Médecin</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedAppointment.doctor}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Spécialité</p>
                <p className="font-medium">{selectedAppointment.specialty}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Lieu</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selectedAppointment.location}
                </p>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="bg-gray-50 p-2 rounded-md text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
              
              {selectedAppointment.diagnosis && (
                <div>
                  <p className="text-sm text-gray-500">Diagnostic</p>
                  <p className="font-medium">{selectedAppointment.diagnosis}</p>
                </div>
              )}
              
              {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Prescriptions</p>
                  <ul className="list-disc list-inside text-sm pl-2">
                    {selectedAppointment.prescriptions.map((prescription, index) => (
                      <li key={index}>{prescription}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
