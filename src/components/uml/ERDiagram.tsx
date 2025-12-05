
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_ERDiagram

title Diagramme Entité-Relation - Base de Données JàmmSanté

entity "profiles" as profiles {
  *id : UUID <<PK>>
  --
  first_name : TEXT
  last_name : TEXT
  email : TEXT
  phone_number : TEXT
  address : TEXT
  avatar_url : TEXT
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "user_roles" as user_roles {
  *id : UUID <<PK>>
  --
  *user_id : UUID <<FK>>
  role : app_role
  created_at : TIMESTAMP
}

entity "patients" as patients {
  *id : UUID <<PK, FK>>
  --
  birth_date : DATE
  gender : TEXT
  blood_type : TEXT
  allergies : TEXT[]
  medical_history : JSONB
  beneficiaries : JSONB
  phone_number : TEXT
  is_active : BOOLEAN
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "doctors" as doctors {
  *id : UUID <<PK, FK>>
  --
  specialty_id : UUID <<FK>>
  license_number : TEXT
  years_of_experience : INTEGER
  is_verified : BOOLEAN
  address : TEXT
  latitude : DECIMAL
  longitude : DECIMAL
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "doctor_applications" as applications {
  *id : UUID <<PK>>
  --
  email : TEXT
  first_name : TEXT
  last_name : TEXT
  specialty_id : UUID <<FK>>
  license_number : TEXT
  years_of_experience : INTEGER
  diploma_url : TEXT
  license_url : TEXT
  other_documents_urls : TEXT[]
  status : TEXT
  rejection_reason : TEXT
  reviewed_by : UUID <<FK>>
  reviewed_at : TIMESTAMP
  created_at : TIMESTAMP
}

entity "specialties" as specialties {
  *id : UUID <<PK>>
  --
  name : TEXT
  description : TEXT
  total_doctors : INTEGER
  status : TEXT
  created_at : TIMESTAMP
}

entity "appointments" as appointments {
  *id : UUID <<PK>>
  --
  *doctor_id : UUID <<FK>>
  *patient_id : UUID <<FK>>
  date : DATE
  time : TIME
  type : TEXT
  mode : TEXT
  status : TEXT
  location : TEXT
  notes : TEXT
  payment_amount : DECIMAL
  payment_status : TEXT
  payment_id : TEXT
  cancelled_at : TIMESTAMP
  cancelled_by : UUID
  cancellation_reason : TEXT
  previous_date : DATE
  previous_time : TIME
  reschedule_reason : TEXT
  reschedule_count : INTEGER
  no_show_at : TIMESTAMP
  created_at : TIMESTAMP
}

entity "medical_records" as medical_records {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  *doctor_id : UUID <<FK>>
  date : DATE
  diagnosis : TEXT
  prescription : TEXT
  notes : TEXT
  created_at : TIMESTAMP
}

entity "documents" as documents {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  *doctor_id : UUID <<FK>>
  title : TEXT
  type : TEXT
  file_url : TEXT
  file_size : INTEGER
  is_signed : BOOLEAN
  signed_at : TIMESTAMP
  created_at : TIMESTAMP
}

entity "invoices" as invoices {
  *id : UUID <<PK>>
  --
  *appointment_id : UUID <<FK>>
  *patient_id : UUID <<FK>>
  *doctor_id : UUID <<FK>>
  amount : DECIMAL
  payment_status : TEXT
  payment_method : TEXT
  payment_date : TIMESTAMP
  invoice_number : TEXT
  created_at : TIMESTAMP
}

entity "ratings" as ratings {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  *doctor_id : UUID <<FK>>
  *appointment_id : UUID <<FK>>
  rating : INTEGER
  comment : TEXT
  created_at : TIMESTAMP
}

entity "notifications" as notifications {
  *id : UUID <<PK>>
  --
  *user_id : UUID <<FK>>
  appointment_id : UUID <<FK>>
  type : TEXT
  title : TEXT
  message : TEXT
  priority : TEXT
  is_read : BOOLEAN
  metadata : JSONB
  created_at : TIMESTAMP
}

entity "reminders" as reminders {
  *id : UUID <<PK>>
  --
  *appointment_id : UUID <<FK>>
  *patient_id : UUID <<FK>>
  scheduled_for : TIMESTAMP
  reminder_type : TEXT
  method : TEXT
  status : TEXT
  attempts : INTEGER
  created_at : TIMESTAMP
}

entity "sms_logs" as sms_logs {
  *id : UUID <<PK>>
  --
  *user_id : UUID <<FK>>
  phone_number : TEXT
  message : TEXT
  status : TEXT
  provider_response : JSONB
  sent_at : TIMESTAMP
  created_at : TIMESTAMP
}

entity "messages" as messages {
  *id : UUID <<PK>>
  --
  *sender_id : UUID <<FK>>
  *receiver_id : UUID <<FK>>
  appointment_id : UUID <<FK>>
  subject : TEXT
  content : TEXT
  is_read : BOOLEAN
  created_at : TIMESTAMP
}

entity "notes" as notes {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  *doctor_id : UUID <<FK>>
  title : TEXT
  content : TEXT
  date : DATE
  created_at : TIMESTAMP
}

entity "lab_results" as lab_results {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  doctor_id : UUID <<FK>>
  test_name : TEXT
  test_date : DATE
  results : TEXT
  file_url : TEXT
  notes : TEXT
  created_at : TIMESTAMP
}

entity "medical_images" as medical_images {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  doctor_id : UUID <<FK>>
  image_type : TEXT
  image_url : TEXT
  image_date : DATE
  description : TEXT
  notes : TEXT
  created_at : TIMESTAMP
}

entity "vaccinations" as vaccinations {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  vaccine_name : TEXT
  vaccination_date : DATE
  next_dose_date : DATE
  administered_by : TEXT
  notes : TEXT
  created_at : TIMESTAMP
}

entity "queue_entries" as queue {
  *id : UUID <<PK>>
  --
  *patient_id : UUID <<FK>>
  requested_doctor_id : UUID <<FK>>
  specialty_id : UUID <<FK>>
  preferred_dates : DATE[]
  urgency : TEXT
  status : TEXT
  notes : TEXT
  created_at : TIMESTAMP
}

entity "support_tickets" as tickets {
  *id : UUID <<PK>>
  --
  *user_id : UUID <<FK>>
  subject : TEXT
  category : TEXT
  description : TEXT
  status : TEXT
  priority : TEXT
  assigned_to : UUID <<FK>>
  resolved_at : TIMESTAMP
  created_at : TIMESTAMP
}

entity "moderation_reports" as reports {
  *id : UUID <<PK>>
  --
  reporter_id : UUID <<FK>>
  reported_id : UUID <<FK>>
  reason : TEXT
  details : TEXT
  status : TEXT
  resolved_by : UUID <<FK>>
  resolved_at : TIMESTAMP
  created_at : TIMESTAMP
}

entity "cancellation_policies" as cancel_policies {
  *id : UUID <<PK>>
  --
  user_type : TEXT
  minimum_hours_before : INTEGER
  created_at : TIMESTAMP
}

entity "reschedule_policies" as reschedule_policies {
  *id : UUID <<PK>>
  --
  hours_before_appointment : INTEGER
  penalty_percentage : DECIMAL
  max_reschedules : INTEGER
  created_at : TIMESTAMP
}

' Relations
profiles ||--o{ user_roles : "a"
profiles ||--o| patients : "est"
profiles ||--o| doctors : "est"

doctors }o--|| specialties : "appartient"
doctors ||--o{ appointments : "gère"
doctors ||--o{ medical_records : "crée"
doctors ||--o{ documents : "signe"
doctors ||--o{ ratings : "reçoit"

patients ||--o{ appointments : "prend"
patients ||--o{ medical_records : "possède"
patients ||--o{ documents : "reçoit"
patients ||--o{ invoices : "paie"
patients ||--o{ ratings : "donne"
patients ||--o{ lab_results : "possède"
patients ||--o{ medical_images : "possède"
patients ||--o{ vaccinations : "reçoit"
patients ||--o{ queue : "rejoint"
patients ||--o{ reminders : "reçoit"
patients ||--o{ sms_logs : "reçoit"

appointments ||--o| invoices : "génère"
appointments ||--o{ reminders : "déclenche"
appointments ||--o{ notifications : "génère"
appointments ||--o| ratings : "évalué par"

applications }o--|| specialties : "pour"

profiles ||--o{ notifications : "reçoit"
profiles ||--o{ messages : "envoie/reçoit"
profiles ||--o{ tickets : "crée"
profiles ||--o{ reports : "signale"

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_ERDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const ERDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme Entité-Relation (ERD)</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre la structure complète de la base de données Supabase avec toutes les tables,
        relations et attributs principaux.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            erDiagram
              PROFILES ||--o{ USER_ROLES : "a"
              PROFILES ||--o| PATIENTS : "est"
              PROFILES ||--o| DOCTORS : "est"
              
              DOCTORS }o--|| SPECIALTIES : "appartient"
              DOCTORS ||--o{ APPOINTMENTS : "gère"
              DOCTORS ||--o{ MEDICAL_RECORDS : "crée"
              DOCTORS ||--o{ DOCUMENTS : "signe"
              DOCTORS ||--o{ RATINGS : "reçoit"
              
              PATIENTS ||--o{ APPOINTMENTS : "prend"
              PATIENTS ||--o{ MEDICAL_RECORDS : "possède"
              PATIENTS ||--o{ DOCUMENTS : "reçoit"
              PATIENTS ||--o{ INVOICES : "paie"
              PATIENTS ||--o{ RATINGS : "donne"
              PATIENTS ||--o{ LAB_RESULTS : "possède"
              PATIENTS ||--o{ MEDICAL_IMAGES : "possède"
              PATIENTS ||--o{ VACCINATIONS : "reçoit"
              PATIENTS ||--o{ QUEUE_ENTRIES : "rejoint"
              PATIENTS ||--o{ REMINDERS : "reçoit"
              PATIENTS ||--o{ SMS_LOGS : "reçoit"
              
              APPOINTMENTS ||--o| INVOICES : "génère"
              APPOINTMENTS ||--o{ REMINDERS : "déclenche"
              APPOINTMENTS ||--o{ NOTIFICATIONS : "génère"
              APPOINTMENTS ||--o| RATINGS : "évalué"
              
              DOCTOR_APPLICATIONS }o--|| SPECIALTIES : "pour"
              
              PROFILES ||--o{ NOTIFICATIONS : "reçoit"
              PROFILES ||--o{ MESSAGES : "envoie"
              PROFILES ||--o{ SUPPORT_TICKETS : "crée"
              PROFILES ||--o{ MODERATION_REPORTS : "signale"
              
              PROFILES {
                uuid id PK
                text first_name
                text last_name
                text email
                text phone_number
                text address
                text avatar_url
              }
              
              PATIENTS {
                uuid id PK_FK
                date birth_date
                text gender
                text blood_type
                text[] allergies
                jsonb medical_history
                jsonb beneficiaries
                boolean is_active
              }
              
              DOCTORS {
                uuid id PK_FK
                uuid specialty_id FK
                text license_number
                int years_of_experience
                boolean is_verified
                decimal latitude
                decimal longitude
              }
              
              APPOINTMENTS {
                uuid id PK
                uuid doctor_id FK
                uuid patient_id FK
                date date
                time time
                text type
                text mode
                text status
                decimal payment_amount
                text payment_status
                text payment_id
                int reschedule_count
              }
              
              REMINDERS {
                uuid id PK
                uuid appointment_id FK
                uuid patient_id FK
                timestamp scheduled_for
                text reminder_type
                text method
                text status
                int attempts
              }
              
              SMS_LOGS {
                uuid id PK
                uuid user_id FK
                text phone_number
                text message
                text status
                jsonb provider_response
              }
              
              MEDICAL_RECORDS {
                uuid id PK
                uuid patient_id FK
                uuid doctor_id FK
                date date
                text diagnosis
                text prescription
                text notes
              }
              
              INVOICES {
                uuid id PK
                uuid appointment_id FK
                decimal amount
                text payment_status
                text payment_method
                text invoice_number
              }
              
              SPECIALTIES {
                uuid id PK
                text name
                text description
                int total_doctors
                text status
              }
          `}
        </div>
      </div>
    </div>
  );
};
