# C4 Model - HairAgenda

Este documento apresenta a arquitetura do sistema HairAgenda utilizando o modelo C4 (Contexto e Contêineres).

## Nível 1: Diagrama de Contexto de Sistema

Este diagrama descreve as interações de alto nível entre os usuários e o sistema HairAgenda com sistemas externos.

```mermaid
graph TD
    UserProfessional[Profissional de Beleza]
    UserClient[Cliente de Beleza]
    HairAgendaSystem[Sistema HairAgenda]
    Clerk[Clerk - Autenticação]
    Supabase[Supabase - PostgreSQL]
    WhatsApp[WhatsApp - Notificações]

    UserProfessional -- Gerencia agenda e serviços --> HairAgendaSystem
    UserClient -- Reserva horários e vê catálogo --> HairAgendaSystem
    HairAgendaSystem -- Autentica usuários --> Clerk
    HairAgendaSystem -- Persiste dados --> Supabase
    HairAgendaSystem -- Envia lembretes --> WhatsApp
```

## Nível 2: Diagrama de Contêineres

Este diagrama detalha os contêineres internos do sistema, as tecnologias utilizadas e os fluxos de comunicação.

```mermaid
graph TD
    subgraph "Navegador do Usuário"
        FrontendApp[Frontend - React/Vite]
    end

    subgraph "Infraestrutura Cloud (Vercel/Render)"
        BackendAPI[Backend API - Django/DRF]
        Database[(PostgreSQL - Supabase)]
    end

    subgraph "Sistemas Externos"
        ClerkSaaS[Clerk Auth Service]
    end

    UserClient -- HTTPS/JSON --> FrontendApp
    UserProfessional -- HTTPS/JSON --> FrontendApp
    FrontendApp -- HTTPS/REST (AJAX) --> BackendAPI
    FrontendApp -- JWT Validation --> ClerkSaaS
    BackendAPI -- Django ORM / SQL --> Database
    BackendAPI -- Token Verification --> ClerkSaaS
```

## Nível 3: Diagrama de Componentes (Backend API)

Este diagrama detalha como o contêiner do Backend é estruturado internamente.

```mermaid
graph TD
    subgraph "Backend API (Django/DRF)"
        AuthMiddleware[Clerk Auth Middleware]
        APIViews[API Views / Viewsets]
        Serializers[DRF Serializers]
        Logic[Business Logic / Validators]
        Models[Django Models / ORM]
    end

    FrontendApp -- Request + JWT --> AuthMiddleware
    AuthMiddleware -- Validated User --> APIViews
    APIViews -- Data Mapping --> Serializers
    APIViews -- Complex Rules --> Logic
    Logic -- DB Access --> Models
    Serializers -- DB Access --> Models
    Models -- SQL --> Database
```

## Nível 4: Diagrama de Classes (Modelos de Dados)

Focado nas relações entre as principais entidades do domínio de agendamento.

```mermaid
classDiagram
    class ProfessionalProfile {
        +String user_id
        +String name
        +String description
        +Boolean is_setup_completed
    }
    class Service {
        +String name
        +Decimal price
        +Integer duration_minutes
    }
    class Appointment {
        +String client_name
        +String client_whatsapp
        +DateTime date_time
        +String status
    }
    class OpeningHour {
        +Integer day_of_week
        +Time work_start
        +Time work_end
    }
    class ProfessionalBlock {
        +Date date
        +Time start_time
        +Time end_time
    }

    ProfessionalProfile "1" -- "*" Service : oferece
    ProfessionalProfile "1" -- "*" Appointment : recebe
    ProfessionalProfile "1" -- "*" OpeningHour : define expediente
    ProfessionalProfile "1" -- "*" ProfessionalBlock : bloqueia agenda
    Appointment "*" -- "1" Service : solicita
```

## Diagrama de Implantação (Deployment)

Visualização da infraestrutura física/cloud e distribuição dos artefatos.

```mermaid
graph TD
    subgraph "Client's Device"
        subgraph "Web Browser"
            ReactApp[Frontend Artifacts]
        end
    end

    subgraph "Cloud Provider - Vercel"
        subgraph "Edge Network"
            StaticFiles[HTML/JS/CSS Assets]
        end
        subgraph "Serverless Functions"
            DjangoApp[Django/WSGI Instance]
        end
    end

    subgraph "Cloud Provider - Supabase"
        ManagedDB[(PostgreSQL Instance)]
    end

    subgraph "External SaaS"
        ClerkAuth[Clerk Identity Provider]
    end

    ReactApp -- Fetches --> StaticFiles
    DjangoApp -- Queries --> ManagedDB
    ReactApp -- Authenticates --> ClerkAuth
    DjangoApp -- Verifies --> ClerkAuth
```

## Considerações sobre a Arquitetura

1.  **Segurança:** A autenticação é delegada ao Clerk, garantindo que o sistema não armazene senhas sensíveis diretamente.
2.  **Escalabilidade:** O frontend estático pode ser escalado globalmente pela Vercel, enquanto a API Django lida com a lógica de negócio central.
3.  **Confiabilidade:** O uso de PostgreSQL garante transações seguras para evitar agendamentos duplicados (Race Conditions).
