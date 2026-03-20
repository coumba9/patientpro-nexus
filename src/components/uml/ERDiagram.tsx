
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_ERDiagram

title Diagramme Entite-Relation - Base de Donnees JammSante

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
  role : app_role (admin|doctor|patient)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
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
  medical_record_id : TEXT
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
  status : TEXT (pending|approved|rejected)
  rejection_reason : TEXT
  reviewed_by : UUID <<FK>>
  reviewed_at : TIMESTAMP
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "specialties" as specialties {
  *id : UUID <<PK>>
  --
  name : TEXT
  description : TEXT
  total_doctors : INTEGER
  status : TEXT
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "appointments" as appointments {
  *id : UUID <<PK>>
  --
  *doctor_id : UUID <<FK>>
  *patient_id : UUID <<FK>>
  date : DATE
  time : TIME
  type : TEXT
  mode : TEXT (cabinet|teleconsultation)
  status : TEXT
  location : TEXT
  notes : TEXT
  payment_amount : DECIMAL
  payment_status : TEXT
  payment_id : TEXT
  cancelled_at : TIMESTAMP
  cancelled_by : UUID
  cancellation_reason : TEXT
  cancellation_type : TEXT
  previous_date : DATE
  previous_time : TIME
  reschedule_reason : TEXT
  reschedule_count : INTEGER
  reschedule_requested_at : TIMESTAMP
  reschedule_requested_by : UUID
  can_reschedule_without_penalty : BOOLEAN
  no_show_at : TIMESTAMP
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  signature_url : TEXT
  signed_at : TIMESTAMP
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
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
  updated_at : TIMESTAMP
}

entity "cancellation_policies" as cancel_policies {
  *id : UUID <<PK>>
  --
  user_type : TEXT
  minimum_hours_before : INTEGER
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "reschedule_policies" as reschedule_policies {
  *id : UUID <<PK>>
  --
  hours_before_appointment : INTEGER
  penalty_percentage : DECIMAL
  max_reschedules : INTEGER
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "admin_audit_logs" as audit_logs {
  *id : UUID <<PK>>
  --
  *admin_id : UUID <<FK>>
  action_type : TEXT
  table_name : TEXT
  record_id : UUID
  details : JSONB
  ip_address : TEXT
  created_at : TIMESTAMP
}

entity "admin_metrics" as admin_metrics {
  *id : UUID <<PK>>
  --
  name : TEXT
  category : TEXT
  value : DECIMAL
  period : TEXT
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "faqs" as faqs {
  *id : UUID <<PK>>
  --
  question : TEXT
  answer : TEXT
  category : TEXT
  sort_order : INTEGER
  status : TEXT
  created_by : UUID <<FK>>
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "pages" as pages {
  *id : UUID <<PK>>
  --
  title : TEXT
  slug : TEXT (UNIQUE)
  content : TEXT
  status : TEXT
  author_id : UUID <<FK>>
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

' Relations
profiles ||--o{ user_roles : "a"
profiles ||--o| patients : "est"
profiles ||--o| doctors : "est"

doctors }o--|| specialties : "appartient"
doctors ||--o{ appointments : "gere"
doctors ||--o{ medical_records : "cree"
doctors ||--o{ documents : "signe"
doctors ||--o{ ratings : "recoit"
doctors ||--o{ notes : "redige"

patients ||--o{ appointments : "prend"
patients ||--o{ medical_records : "possede"
patients ||--o{ documents : "recoit"
patients ||--o{ invoices : "paie"
patients ||--o{ ratings : "donne"
patients ||--o{ lab_results : "possede"
patients ||--o{ medical_images : "possede"
patients ||--o{ vaccinations : "recoit"
patients ||--o{ queue : "rejoint"
patients ||--o{ reminders : "recoit"
patients ||--o{ sms_logs : "recoit"
patients ||--o{ notes : "concerne"

appointments ||--o| invoices : "genere"
appointments ||--o{ reminders : "declenche"
appointments ||--o{ notifications : "genere"
appointments ||--o| ratings : "evalue"

applications }o--|| specialties : "pour"

profiles ||--o{ notifications : "recoit"
profiles ||--o{ messages : "envoie/recoit"
profiles ||--o{ tickets : "cree"
profiles ||--o{ reports : "signale"
profiles ||--o{ audit_logs : "genere"
profiles ||--o{ faqs : "cree"
profiles ||--o{ pages : "redige"

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
        <h2 className="text-2xl font-bold">Diagramme Entite-Relation (ERD)</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre la structure complete de la base de donnees Supabase avec les 27 tables,
        relations et attributs principaux conformes au schema de production.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            erDiagram
              PROFILES ||--o{ USER_ROLES : "a"
              PROFILES ||--o| PATIENTS : "est"
              PROFILES ||--o| DOCTORS : "est"
              
              DOCTORS }o--|| SPECIALTIES : "appartient"
              DOCTORS ||--o{ APPOINTMENTS : "gere"
              DOCTORS ||--o{ MEDICAL_RECORDS : "cree"
              DOCTORS ||--o{ DOCUMENTS : "signe"
              DOCTORS ||--o{ RATINGS : "recoit"
              DOCTORS ||--o{ NOTES : "redige"
              
              PATIENTS ||--o{ APPOINTMENTS : "prend"
              PATIENTS ||--o{ MEDICAL_RECORDS : "possede"
              PATIENTS ||--o{ DOCUMENTS : "recoit"
              PATIENTS ||--o{ INVOICES : "paie"
              PATIENTS ||--o{ RATINGS : "donne"
              PATIENTS ||--o{ LAB_RESULTS : "possede"
              PATIENTS ||--o{ MEDICAL_IMAGES : "possede"
              PATIENTS ||--o{ VACCINATIONS : "recoit"
              PATIENTS ||--o{ QUEUE_ENTRIES : "rejoint"
              PATIENTS ||--o{ REMINDERS : "recoit"
              PATIENTS ||--o{ SMS_LOGS : "recoit"
              PATIENTS ||--o{ NOTES : "concerne"
              
              APPOINTMENTS ||--o| INVOICES : "genere"
              APPOINTMENTS ||--o{ REMINDERS : "declenche"
              APPOINTMENTS ||--o{ NOTIFICATIONS : "genere"
              APPOINTMENTS ||--o| RATINGS : "evalue"
              
              DOCTOR_APPLICATIONS }o--|| SPECIALTIES : "pour"
              
              PROFILES ||--o{ NOTIFICATIONS : "recoit"
              PROFILES ||--o{ MESSAGES : "envoie"
              PROFILES ||--o{ SUPPORT_TICKETS : "cree"
              PROFILES ||--o{ MODERATION_REPORTS : "signale"
              PROFILES ||--o{ ADMIN_AUDIT_LOGS : "genere"
              PROFILES ||--o{ FAQS : "cree"
              PROFILES ||--o{ PAGES : "redige"
              
              PROFILES {
                uuid id PK
                text first_name
                text last_name
                text email
                text phone_number
                text address
                text avatar_url
              }

              USER_ROLES {
                uuid id PK
                uuid user_id FK
                app_role role
              }
              
              PATIENTS {
                uuid id PK_FK
                date birth_date
                text gender
                text blood_type
                text_arr allergies
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
                text address
                decimal latitude
                decimal longitude
              }

              SPECIALTIES {
                uuid id PK
                text name
                text description
                int total_doctors
                text status
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
                text location
                decimal payment_amount
                text payment_status
                text payment_id
                int reschedule_count
                timestamp no_show_at
              }

              DOCTOR_APPLICATIONS {
                uuid id PK
                text email
                text first_name
                text last_name
                uuid specialty_id FK
                text license_number
                int years_of_experience
                text status
                text rejection_reason
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

              DOCUMENTS {
                uuid id PK
                uuid patient_id FK
                uuid doctor_id FK
                text title
                text type
                text file_url
                boolean is_signed
                text signature_url
                timestamp signed_at
              }
              
              INVOICES {
                uuid id PK
                uuid appointment_id FK
                decimal amount
                text payment_status
                text payment_method
                text invoice_number
              }

              RATINGS {
                uuid id PK
                uuid patient_id FK
                uuid doctor_id FK
                uuid appointment_id FK
                int rating
                text comment
              }

              NOTIFICATIONS {
                uuid id PK
                uuid user_id FK
                uuid appointment_id FK
                text type
                text title
                text message
                text priority
                boolean is_read
                jsonb metadata
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

              MESSAGES {
                uuid id PK
                uuid sender_id FK
                uuid receiver_id FK
                uuid appointment_id FK
                text subject
                text content
                boolean is_read
              }

              NOTES {
                uuid id PK
                uuid patient_id FK
                uuid doctor_id FK
                text title
                text content
                date date
              }

              LAB_RESULTS {
                uuid id PK
                uuid patient_id FK
                uuid doctor_id FK
                text test_name
                date test_date
                text results
                text file_url
              }

              MEDICAL_IMAGES {
                uuid id PK
                uuid patient_id FK
                uuid doctor_id FK
                text image_type
                text image_url
                date image_date
              }

              VACCINATIONS {
                uuid id PK
                uuid patient_id FK
                text vaccine_name
                date vaccination_date
                date next_dose_date
              }

              QUEUE_ENTRIES {
                uuid id PK
                uuid patient_id FK
                uuid requested_doctor_id FK
                uuid specialty_id FK
                text urgency
                text status
              }

              SUPPORT_TICKETS {
                uuid id PK
                uuid user_id FK
                text subject
                text category
                text description
                text status
                text priority
              }

              MODERATION_REPORTS {
                uuid id PK
                uuid reporter_id FK
                uuid reported_id FK
                text reason
                text status
              }

              ADMIN_AUDIT_LOGS {
                uuid id PK
                uuid admin_id FK
                text action_type
                text table_name
                uuid record_id
                jsonb details
              }

              ADMIN_METRICS {
                uuid id PK
                text name
                text category
                decimal value
                text period
              }

              FAQS {
                uuid id PK
                text question
                text answer
                text category
                int sort_order
                text status
              }

              PAGES {
                uuid id PK
                text title
                text slug
                text content
                text status
                uuid author_id FK
              }

              CANCELLATION_POLICIES {
                uuid id PK
                text user_type
                int minimum_hours_before
              }

              RESCHEDULE_POLICIES {
                uuid id PK
                int hours_before_appointment
                decimal penalty_percentage
                int max_reschedules
              }
          `}
        </div>
      </div>
    </div>
  );
};
