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

## Considerações sobre a Arquitetura

1.  **Segurança:** A autenticação é delegada ao Clerk, garantindo que o sistema não armazene senhas sensíveis diretamente.
2.  **Escalabilidade:** O frontend estático pode ser escalado globalmente pela Vercel, enquanto a API Django lida com a lógica de negócio central.
3.  **Confiabilidade:** O uso de PostgreSQL garante transações seguras para evitar agendamentos duplicados (Race Conditions).
