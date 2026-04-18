# Especificação Técnica

## 1. Visão Geral Técnica

A Especificação Técnica descreve as diretrizes arquiteturais e decisões de tecnologia adotadas no MVP do HairAgenda. Este projeto consiste em um sistema de autoagendamento focado em profissionais autônomos de beleza. O público-alvo deste documento abrange desenvolvedores, validadores acadêmicos do projeto de Pós-Graduação e demais perfis técnicos envolvidos na construção da V1 e V2.

---

## 2. Arquitetura de Referência

- **Estilo Arquitetural:** Client-Server Desacoplado (RESTful API + SPA). O Frontend isolado em React/Vite lida com a apresentação e o Backend em Django/DRF processa unicamente regras de negócio expostas via endpoints JSON.
- **Componentes Principais:** 
  - **Web Client (Frontend Público/Admin):** Interface Single Page Application (SPA) responsiva para autoagendamento e gestão do salão.
  - **Backend Server (API):** Servidor construído em Django (Python) que atua exclusivamente como API, processando validações de exclusividade de tempo e lógicas de negócio.
- **Autenticação e Autorização:** Autenticação delegada ao SaaS (Clerk), exigindo que o backend em Django aplique verificação de JWT localmente em cada rota protegida (via Middleware ou Decorators).
- **Protocolos de Comunicação:** HTTPS padrão com APIs comunicando-se em `application/json`.
- **Infraestrutura de Deployment:** API provida na Vercel vinculada a um banco de dados hospedado em nuvem especializada (Supabase - PostgreSQL). Vercel também é utilizada para o deploy do Web Client (Frontend) em infraestrutura Edge, minimizando a latência global de carregamento estático.

---

## 3. Stack Tecnológica Recomendada

- **Frontend Cliente:** JavaScript/TypeScript com React via Vite, priorizando tempos rápidos de build, acoplado com uma biblioteca CSS-in-JS leve ou Tailwind CSS (focada na responsividade fluida para qualquer tamanho de tela).
- **Backend Core:** Python 3.x utilizando o framework Django. O Django Rest Framework (DRF) será aplicado para construção da API, aproveitando a robustez e o sistema administrativo nativo.
- **Persistência de Dados (DB):** PostgreSQL. Altamente recomendado para evitar falhas de concorrência (*overbooking* no mesmo slot de hora) através de bloqueios transacionais (ACID).
- **ORM:** Django ORM padrão.
- **Integrações (V2):** Planejado o consumo de Webhooks ou APIs de disparo de WhatsApp (ex: Z-API ou API Oficial Meta) / SMS (Twilio).
- **Filas e Agendadores (V2):** Planejado o uso de Redis e Celery para gerir tarefas em background (ex: "Enviar lembrete 12 horas antes").
- **Estáticos e Segurança (Middlewares):** Uso do pacote WhiteNoise para a entrega otimizada de arquivos estáticos em ambiente de produção no Django, e configuração estrita de CORS (Cross-Origin Resource Sharing) para garantir a segurança das requisições entre o frontend e a API (ambos na Vercel).

---

### 4. Segurança

- **Proteção do Profissional:** Os perfis profissionais devem utilizar proteção de rota e geração de *Password Hashes* seguras (Padrão PBKDF2 adotado no Django).
- **Proteção Transacional Endpoints:** APIs sensíveis da interface do cliente final necessitam de *Rate Limit* forte contra ataques (DDOS bot) visando impedir o loteamento das agendas com "furos/no-shows" artificiais baseados num Script.
- **Proteção de Sessões:** Garantir a emissão de CSRF Tokens e as Flags de Cookie (*HttpOnly*, *Secure*) para ambientes de produção. Evitar expor chaves JWT infinitamente.

---

### 5. Auditoria

- **Histórico Básicos:** Garantir injeção padrão de variáveis temporais em todas as chaves transacionais do sistema (`created_at`, `updated_at`).
- **Rastros do Sistema:** Emissão de LOGs limpos direcionados à Standard-Out para posterior análise nas plataformas PaaS (erros em requisições ou quedas do Banco precisam alarmar em consola o mais rápido possível).

---

## 6. APIs

- **Endpoints Principais:** Separados lógicamente, possuindo prefíxo semântico explícito como `/api/agenda`, `/api/services`, `/api/portfolio`.
- **Versionamento:** Embora planejado o uso de `/api/v1/...`, a versão atual utiliza o prefixo `/api/` para simplificação inicial.
- **Padrão de Nomenclatura:** Design totalmente RESTful, favorecendo plurais (`/services`, `/bookings`) em Inglês, com payloads *json* padronizados em *snake_case*.
- **Divisão Lógica de Autenticação:**
  - ***Endpoints Públicos (Public read-write)***: Leitura passiva da grade de horários via ID ou "Slug" do profissional. Inserção cega do agendamento mediante regras preestabelecidas.
  - ***Endpoints Protegidos***: CRUD de Serviços, liberação manual, cancelamento proativo pelo admin (necessitam de autenticação forte do tenant).

---

## 7. Tenancy

- **Estratégia:** Shared Database, Shared Schema (Estratégia mais barata e simplificada de Multi-Tenant).
- **Isolamento:** Uso contínuo do campo/Foreign Key de `profissional_id` para todas as tabelas adjacentes do domínio (Serviços e Reservas).
- **Identificação:** Resolvido no Front end pelo Link Único (ex: `app.com/{profissional-slug}`), em que o parâmetro serve de base para o filtro primário de todas os GETs.
- **Migrações e Segurança:** Para evitar o alto risco de vazar dados entre locatários pelo puro esquecimento do desenvolvedor ("atenção manual"), a arquitetura obriga a injeção de Filtros Globais automáticos via Middleware no Django ORM ou, preferencialmente, o uso das políticas de segurança baseadas em linha (Row Level Security - RLS) diretamente no Banco de Dados (Supabase), travando vazamentos na raiz transacional.

---

## 8. Diretrizes para Desenvolvimento Assistido por IA

- O código produzido pela IA no projeto HairAgenda (Django para back, React/TS para front) deve concentrar a lógica longe das Views/Endpoints, focando nas validações de exclusividade de tempo nos Services ou Models usando a diretriz do "Fat Model, Skinny View".
- Seguir fielmente o mapa visual do Documento de *Especificação UI (spec_ui.md)* na elaboração das respostas de interface.
- Focar estritamente na estabilidade das transações de reserva e no CRUD eficiente de serviços e portfólio visual, evitando adicionar escopos complexos como pagamentos e conciliações financeiras orgânicas.

---

## 9. Ambiente, Ferramentas e Esteira de Integração (CI/CD)

- **Gerenciamento de Pacotes:**
  - *Frontend:* Padronização no uso do `npm` para gestão de dependências.
  - *Backend:* Uso de `pip` com isolamento por ambiente virtual (`venv`) para o controle seguro de pacotes via `requirements.txt`.
- **Ambiente de Desenvolvimento Local:**
  - Uso central e mandatório de **Docker Compose** para orquestrar e levantar todos os serviços (Frontend, Django API, PostgreSQL DB), assegurando paridade com o ambiente de produção e reduzindo atritos de infraestrutura nos setups locais.
- **CI/CD (Integração e Entrega Contínuas):**
  - Adoção preferencial do **GitHub Actions** para as esteiras automatizadas.
  - **CI:** Regras de PR (Pull Request) atreladas à execução e aprovação obrigatória de Linters (`flake8`, `eslint` etc.) e da suíte de testes.
  - **CD:** Após integração (merge) bem-sucedida, o deploy será orquestrado e assumido de forma transparente pelas esteiras nativas de monitoramento de branch fornecidas pelo Vercel (Frontend e Backend).
- **IaC (Infraestrutura como Código):**
  - No escopo de desenvolvimento ágil (MVP/V1), a adoção de orquestradores pesados de IaC (ex: Terraform, Ansible) é sobre-dimensionada. Recomenda-se a alocação e provisionamento guiado por interface (PaaS Dashboard) e o uso de configurações-como-código nativas e simplificadas (ex: `render.yaml` ou `vercel.json` na raiz da aplicação) para registrar instâncias de hospedagem.

---

## 10. Evolução Futura

- Transição gradual para uma arquitetura onde ele suporta o Tenancy Hierárquico (Um "Dono de Salão" visualizando as agendas autônomas dos Profissionais contratados).
- Criação de algoritmos inteligentes de otimização de agenda (ex: reagrupar horários para evitar "buracos").
