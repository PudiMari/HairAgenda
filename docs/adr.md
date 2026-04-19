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
+
+## ADR 05: Persistência Mista (PostgreSQL + Redis)
+**Data:** 2026-04-19
+**Status:** Aceito
+
+### Contexto
+Necessidade de atender ao requisito de persistência em banco de dados relacional e NoSQL, além de melhorar a performance da API.
+
+### Decisão
+Adotar uma arquitetura de persistência mista:
+1. **PostgreSQL** (Relacional): Fonte da verdade para dados transacionais e entidades de negócio.
+2. **Redis** (NoSQL/Key-Value): Camada de cache para caminhos de leitura frequentes e armazenamento de sessões.
+
+### Consequências
+- Redução da latência em endpoints de leitura (ex: lista de serviços).
+- Preparação para processamento em background (Celery) planejado para a V2.
+- Conformidade explícita com requisitos de diversidade de persistência.
