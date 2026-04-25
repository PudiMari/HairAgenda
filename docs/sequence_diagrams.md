# Diagramas de Sequência (Sequence Diagrams)

Este documento detalha os fluxos de interação entre os componentes do sistema para os casos de uso críticos.

## 1. Fluxo de Agendamento (Visão Cliente)

Descreve o processo desde a escolha do serviço até a confirmação da reserva.

```mermaid
sequenceDiagram
    participant C as Cliente (Browser)
    participant F as Frontend (React)
    participant B as Backend (Django)
    participant DB as Database (Postgres)

    C->>F: Acessa página do perfil
    F->>B: GET /api/services/?professional_id={id}
    B-->>F: Lista de Serviços
    C->>F: Seleciona Serviço + Data
    F->>B: GET /api/available-slots/?date={date}
    B->>DB: Query Appointments + Blocks
    DB-->>B: Dados de Ocupação
    B-->>F: Horários Livres (Slots)
    C->>F: Escolhe Horário + Confirma
    F->>B: POST /api/appointments/
    B->>B: Valida conflito (Overlap Check)
    B->>DB: INSERT into Appointment
    DB-->>B: Success
    B-->>F: HTTP 201 Created
    F-->>C: Mostra Tela de Sucesso
```

## 2. Configuração Inicial (Visão Profissional)

Processo de configuração do ambiente de trabalho do profissional.

```mermaid
sequenceDiagram
    participant P as Profissional
    participant F as Frontend (React)
    participant K as Clerk (Auth)
    participant B as Backend (Django)

    P->>F: Realiza Login
    F->>K: Authenticate
    K-->>F: JWT Token
    P->>F: Define Nome e Bio
    F->>B: POST /api/professional-profile/
    B-->>F: Profile Created
    P->>F: Adiciona Serviços
    F->>B: POST /api/services/
    P->>F: Define Horários de Trabalho
    F->>B: POST /api/opening-hours/
    B-->>F: Ready to go!
```

## 3. Lógica de Prevenção de Conflito (Backend)

Detalhamento da validação interna de `clean()` no modelo Django.

```mermaid
sequenceDiagram
    participant API as Viewset
    participant M as Appointment Model
    participant DB as Database

    API->>M: instance.full_clean()
    activate M
    M->>DB: Query Blocks for Date
    DB-->>M: User Blocks
    Note over M: Check overlap with Blocks
    M->>DB: Query Appointments for Date
    DB-->>M: Existing Appts
    Note over M: Check overlap (date_time + duration)
    alt Conflict Found
        M-->>API: Raise ValidationError
    else No Conflict
        M-->>API: Success
    end
    deactivate M
    API->>M: instance.save()
```
