
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

const plantUMLCode = `@startuml JammSante_DeploymentDiagram

title Diagramme de Deploiement - Architecture JammSante

node "Client (Navigateur)" as client {
  component "React SPA (PWA)" as spa
  component "Service Worker" as sw
  component "Page Offline" as offline
}

node "CDN / Hosting" as cdn {
  component "Assets statiques" as assets
  component "index.html" as html
  component "manifest.json" as manifest
}

cloud "Supabase Cloud" as supabase {
  node "Auth Service" as auth {
    component "JWT Tokens" as jwt
    component "RLS Policies" as rls
  }
  
  node "PostgreSQL" as db {
    database "27 Tables" as tables
    component "Triggers" as triggers
    component "Functions (has_role, etc.)" as dbfunc
  }
  
  node "Edge Functions (Deno)" as edge {
    component "secure-paytech" as ef_pay
    component "verify-payment" as ef_verify
    component "send-sms" as ef_sms
    component "process-reminders" as ef_remind
    component "approve-doctor" as ef_approve
    component "reject-doctor" as ef_reject
    component "patient-chatbot" as ef_chatbot
    component "consultation-summary" as ef_summary
    component "share-prescription" as ef_share
    component "admin-manage-users" as ef_admin
    component "send-ticket-email" as ef_email
    component "whatsapp-webhook" as ef_whatsapp
  }
  
  node "Storage" as storage {
    folder "doctor-documents" as doc_bucket
    folder "signatures" as sig_bucket
  }
  
  node "Realtime" as realtime {
    component "WebSocket" as ws
  }
}

cloud "Services Externes" as external {
  component "PayTech API" as paytech
  component "Dexchange SMS" as dexchange
  component "Resend Email" as resend
  component "PeerJS (Video)" as peerjs
}

spa --> cdn : HTTPS
spa --> auth : Authentification
spa --> db : Supabase Client (REST)
spa --> edge : Invoke Functions
spa --> storage : Upload/Download
spa --> realtime : WebSocket
sw --> offline : Cache Offline

ef_pay --> paytech : Paiements
ef_sms --> dexchange : SMS
ef_email --> resend : Emails
spa --> peerjs : Teleconsultation P2P

triggers --> dbfunc : Appels auto
edge --> db : Service Role Key

@enduml`;

const mermaidCodeDeploy = `graph TB
  subgraph CLIENT["Client - Navigateur"]
    SPA["React SPA + PWA"]
    SW["Service Worker"]
  end
  subgraph SUPABASE["Supabase Cloud"]
    AUTH["JWT + RLS"]
    DATABASE["27 Tables PostgreSQL"]
    EDGE["12 Edge Functions"]
    STORAGE["Storage"]
    RT["Realtime WebSocket"]
  end
  subgraph EXTERNAL["Services Externes"]
    PAYTECH["PayTech API"]
    SMS["Dexchange SMS"]
    EMAIL["Resend Email"]
    VIDEO["PeerJS Video"]
  end
  SPA --> AUTH
  SPA --> DATABASE
  SPA --> EDGE
  EDGE --> PAYTECH
  EDGE --> SMS
  EDGE --> EMAIL`;

export const DeploymentDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Diagramme de Deploiement / Architecture</h2>
        <DiagramExportButtons
          plantUMLCode={plantUMLCode}
          mermaidCode={mermaidCodeDeploy}
          diagramName="JammSante_DeploymentDiagram"
        />
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre l'architecture technique complete de JammSante : application React PWA, 
        12 Edge Functions Supabase, services externes (PayTech, Dexchange SMS, Resend, PeerJS) et infrastructure cloud.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            graph TB
              subgraph CLIENT["Client - Navigateur"]
                SPA["React SPA + PWA"]
                SW["Service Worker"]
                OFFLINE["Page Offline"]
              end
              
              subgraph SUPABASE["Supabase Cloud"]
                subgraph AUTH["Authentification"]
                  JWT["JWT + RLS"]
                end
                subgraph DATABASE["PostgreSQL"]
                  TABLES["27 Tables"]
                  TRIGGERS["Triggers auto"]
                  DBFUNC["Functions SQL"]
                end
                subgraph EDGE["Edge Functions - Deno"]
                  EF1["secure-paytech"]
                  EF2["verify-payment"]
                  EF3["send-sms"]
                  EF4["process-reminders"]
                  EF5["approve-doctor"]
                  EF6["reject-doctor"]
                  EF7["patient-chatbot"]
                  EF8["consultation-summary"]
                  EF9["share-prescription"]
                  EF10["admin-manage-users"]
                  EF11["send-ticket-email"]
                  EF12["whatsapp-webhook"]
                end
                subgraph STORAGE["Storage"]
                  DOCS["doctor-documents"]
                  SIGS["signatures"]
                end
                RT["Realtime WebSocket"]
              end
              
              subgraph EXTERNAL["Services Externes"]
                PAYTECH["PayTech API"]
                SMS["Dexchange SMS"]
                EMAIL["Resend Email"]
                VIDEO["PeerJS Video P2P"]
              end
              
              SPA -->|HTTPS| AUTH
              SPA -->|REST API| DATABASE
              SPA -->|Invoke| EDGE
              SPA -->|Upload/Download| STORAGE
              SPA -->|WebSocket| RT
              SW -->|Cache| OFFLINE
              
              EF1 & EF2 -->|Paiements| PAYTECH
              EF3 & EF4 -->|SMS| SMS
              EF11 -->|Emails| EMAIL
              SPA -->|Video P2P| VIDEO
              
              TRIGGERS --> DBFUNC
              EDGE -->|Service Role| DATABASE
              
              classDef client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
              classDef supabase fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
              classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
              classDef edge fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
              
              class CLIENT client
              class SUPABASE supabase
              class EXTERNAL external
          `}
        </div>
      </div>
    </div>
  );
};
