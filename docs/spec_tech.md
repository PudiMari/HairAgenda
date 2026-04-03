# Especificação Técnica

## 1. Visão Geral Técnica

A Especificação Técnica descreve as diretrizes arquiteturais e decisões de tecnologia adotadas no MVP do HairAgenda. Este projeto consiste em um sistema de autoagendamento focado em profissionais autônomos de beleza. O público-alvo deste documento abrange desenvolvedores, validadores acadêmicos do projeto de Pós-Graduação e demais perfis técnicos envolvidos na construção da V1 e V2.

---

## 2. Arquitetura de Referência

- **Estilo Arquitetural:** Monolito MVC/MVT (voltado ao Backend) integrado com API isolada para clientes. A aplicação principal fornece views administrativas e lida com o consumo assíncrono.
- **Componentes Principais:** 
  - **Web Client (Frontend Público):** Interface Single Page Application (SPA) responsiva para autoagendamento, funcionando perfeitamente em Desktop e Mobile.
  - **Admin e Backend Server:** Servidor que processa as lógicas de negócio dos profissionais (bloqueio de agendas) usando Django (Python).
  - **Serviço de Background (Opcional/V2):** Módulo planejado para disparar mensagens sem congestionar a rede web. Na V1, os disparos são feitos de forma síncrona via API.
- **Autenticação e Autorização:** Autenticação padrão baseada em Sessão para os profissionais administradores. Uso de JWT apenas se o front-end for desacoplado estritamente.
- **Protocolos de Comunicação:** HTTPS padrão com APIs comunicando-se em `application/json`.
- **Infraestrutura de Deployment:** Render atrelado à hospedagem do servidor da API e do banco de dados relacional. Vercel utilizada para o deploy e hospedagem do Web Client (Frontend), garantindo carregamento rápido em borda (edge).

---

## 3. Stack Tecnológica Recomendada

- **Frontend Cliente:** JavaScript/TypeScript com React via Vite, priorizando tempos rápidos de build, acoplado com uma biblioteca CSS-in-JS leve ou Tailwind CSS (focada na responsividade fluida para qualquer tamanho de tela).
- **Backend Core:** Python 3.x utilizando o framework Django. O Django Rest Framework (DRF) será aplicado para construção da API, aproveitando a robustez e o sistema administrativo nativo.
- **Persistência de Dados (DB):** PostgreSQL. Altamente recomendado para evitar falhas de concorrência (*overbooking* no mesmo slot de hora) através de bloqueios transacionais (ACID).
- **ORM:** Django ORM padrão.
- **Integrações (Mensageria Automática):** Consumo de Webhooks ou APIs de disparo de WhatsApp (ex: Z-API para custo-benefício, ou API Oficial Meta) / SMS (Twilio).
- **Filas e Agendadores (V2):** Planejado o uso de Redis e Celery para gerir tarefas em background (ex: "Enviar lembrete 12 horas antes"). Na V1, a lógica de lembrete é simplificada ou delegada a gatilhos de API.
- **Estáticos e Segurança (Middlewares):** Uso do pacote WhiteNoise para a entrega otimizada de arquivos estáticos em ambiente de produção no Django, e configuração estrita de CORS (Cross-Origin Resource Sharing) para garantir a segurança das requisições entre o frontend (Vercel) e a API (Render).

---

### 4. Segurança

- **Proteção do Profissional:** Os perfis profissionais devem utilizar proteção de rota e geração de *Password Hashes* seguras (Padrão PBKDF2 adotado no Django).
- **Proteção Transacional Endpoints:** APIs sensíveis da interface do cliente final necessitam de *Rate Limit* forte contra ataques (DDOS bot) visando impedir o loteamento das agendas com "furos/no-shows" artificiais baseados num Script.
- **Proteção de Sessões:** Garantir a emissão de CSRF Tokens e as Flags de Cookie (*HttpOnly*, *Secure*) para ambientes de produção. Evitar expor chaves JWT infinitamente.

---

### 5. Auditoria

- **Histórico Básicos:** Garantir injeção padrão de variáveis temporais em todas as chaves transacionais do sistema (`created_at`, `updated_at`).
- **Rastros do Sistema:** Emissão de LOGs limpos direcionados à Standard-Out para posterior análise nas plataformas PaaS (erros em Integrações de WhatsApp ou quedas do Banco precisam alarmar em consola o mais rápido possível).

---

## 6. APIs

- **Endpoints Principais:** Separados lógicamente, possuindo prefíxo semântico explícito como `/api/v1/agenda`, `/api/v1/services`.
- **Versionamento:** Versionamento declarado na URI para garantir que o FrontEnd da "v1" continue operante mesmo se um "v2" drástico (CRM Complexo) for instaurado (*ex: /api/v1/...*).
- **Padrão de Nomenclatura:** Design totalmente RESTful, favorecendo plurais (`/services`, `/bookings`) em Inglês, com payloads *json* padronizados em *snake_case*.
- **Divisão Lógica de Autenticação:**
  - ***Endpoints Públicos (Public read-write)***: Leitura passiva da grade de horários via ID ou "Slug" do profissional. Inserção cega do agendamento mediante regras preestabelecidas.
  - ***Endpoints Protegidos***: CRUD de Serviços, liberação manual, cancelamento proativo pelo admin (necessitam de autenticação forte do tenant).

---

## 7. Tenancy

- **Estratégia:** Shared Database, Shared Schema (Estratégia mais barata e simplificada de Multi-Tenant).
- **Isolamento:** Uso contínuo do campo/Foreign Key de `profissional_id` para todas as tabelas adjacentes do domínio (Serviços e Reservas).
- **Identificação:** Resolvido no Front end pelo Link Único (ex: `app.com/{profissional-slug}`), em que o parâmetro serve de base para o filtro primário de todas os GETs.
- **Migrações e Segurança:** Filtros automáticos no ORM (Querysets com injeção base do usuário da requisição) não sendo delegados ao limite da "Atenção" manual do desenvolvedor sob o perigo de vazar de clientes concorrentes.

---

## 8. Diretrizes para Desenvolvimento Assistido por IA

- O código produzido pela IA no projeto HairAgenda (Django para back, React/TS para front) deve concentrar a lógica longe das Views/Endpoints, concentrando as validações de exclusividade de tempo nos Services ou Models usando a diretriz do "Fat Model, Skinny View".
- Sempre prover tratamentos Try/Catch aos disparos externos do WhatsApp evitando que a reserva fique pendente ou falte apenas porque o "carteiro do celular" falhou; o serviço deve ser sempre robusto e fail-safe localmente.
- Seguir fielmente o mapa visual do Documento de *Especificação UI (spec_ui.md)* na elaboração das respostas de interface.
- Focar estritamente na estabilidade do motor de notificação (Workers) e no CRUD eficiente de reserva de agenda, evitando adicionar escopos complexos como pagamentos e conciliações financeiras orgânicas.

---

## 9. Evolução Futura

- Transição gradual para uma arquitetura onde ele suporta o Tenancy Hierárquico (Um "Dono de Salão" visualizando as agendas autônomas dos Profissionais contratados).
- Criação de algoritmos inteligentes de otimização de agenda (ex: reagrupar horários para evitar "buracos").
