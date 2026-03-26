# Architectural Decision Records (ADR)

Este documento registra as decisões técnicas fundamentais tomadas durante o desenvolvimento do HairAgenda.

## ADR 01: Estrutura Monorepo
**Data:** 2026-03-12
**Status:** Aceito

### Contexto
Necessidade de manter frontend, backend e documentação técnica sincronizados.

### Decisão
Utilizar uma estrutura de monorepo com `apps/frontend` (Vite/React) e `apps/backend` (Django).

### Consequências
- Facilidade de deploy unificado.
- Documentação centralizada na raiz (`/docs`).
- Gerenciamento de dependências isolado por aplicação.

## ADR 02: Autenticação com Clerk
**Data:** 2026-03-14
**Status:** Aceito

### Contexto
Necessidade de um sistema de autenticação robusto, seguro e com suporte a login social (Google) que funcione perfeitamente entre o cliente React e a API Django.

### Decisão
Implementar o **Clerk**. O frontend utiliza o `ClerkProvider` e o backend utiliza um middleware customizado para validar tokens JWT emitidos pelo Clerk.

### Consequências
- Redução do tempo de desenvolvimento de auth.
- Segurança de nível industrial delegada a um provedor especializado.

## ADR 03: Estilização com Tailwind CSS 4
**Data:** 2026-03-12
**Status:** Aceito

### Contexto
Necessidade de uma UI premium, responsiva e de alta performance.

### Decisão
Utilizar **Tailwind CSS v4** devido à sua nova engine de alta performance e suporte nativo a CSS moderno.

### Consequências
- Layouts altamente customizáveis sem sair do HTML/JSX.
- Bundle CSS minimalista e otimizado.

## ADR 04: Persistência com PostgreSQL (Supabase)
**Data:** 2026-03-15
**Status:** Aceito

### Contexto
Necessidade de um banco de dados relacional estável para garantir a integridade dos agendamentos (transacionalidade).

### Decisão
Utilizar **PostgreSQL** hospedado no Supabase, aproveitando a confiabilidade do banco e a facilidade de gerenciamento.

### Consequências
- Garantia de ACID para evitar conflitos de horário.
- Escalabilidade para múltiplas instâncias da API.
