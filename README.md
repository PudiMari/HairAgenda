# HairAgenda

Plataforma inteligente de autoagendamento 24/7 focada em profissionais autônomos de beleza. O HairAgenda automatiza a gestão da agenda, otimiza o tempo do profissional e reduz significativamente as taxas de *no-shows* através de lembretes integrados via WhatsApp.

---

## 🌟 O que o projeto faz

O HairAgenda oferece uma vitrine digital para o profissional exibir seus serviços, permitindo que seus clientes verifiquem a disponibilidade em tempo real e realizem o autoagendamento de forma rápida e intuitiva, sem necessidade de baixar aplicativos ou aguardar respostas manuais.

**Por que o projeto é útil?**
* **Para o profissional:** Lotar a agenda, reduzir faltas, economizar tempo negociando horários e profissionalizar seu atendimento.
* **Para o cliente:** Convenirência de agendar serviços a qualquer momento (24/7) de maneira fluida, com clareza imediata sobre os preços e duração dos procedimentos.

## 🏗️ Estrutura do Monorepo

Este projeto é desenvolvido num modelo de **monorepo**, mantendo o Frontend e o Backend separados, porém no mesmo repositório para facilitar a integração e o deploy.

```text
hairagenda/
├── apps/
│   ├── frontend/     # Aplicação SPA (React + Vite + TypeScript)
│   └── backend/      # API e painel de controle (Django + Python)
├── docs/             # Documentação (PRD, Specs, UI Mockups)
├── .agent/           # Skills e artefatos para agentes de IA
├── AGENTS.md         # Guia de colaboração para agentes de IA
├── docker-compose.yml# Orquestração do ambiente de desenvolvimento
└── package.json      # Scripts globais do monorepo
```

## 🌐 Acesso ao Projeto Implantado (Produção)

A plataforma encontra-se disponível e plenamente acessível nos ambientes listados abaixo:

* **Frontend (App Público e Dashboard):** [https://hair-agenda.vercel.app](https://hair-agenda.vercel.app)
* **Backend (API GET Test):** [https://hair-agenda-backend.vercel.app/api/services/](https://hair-agenda-backend.vercel.app/api/services/)

> **Nota para Avaliadores:** Conforme nossa [Apresentação Final](./docs/apresentacao_final.md), a trava seletiva de administrador (`VITE_ENABLE_ADMIN_RESTRICTION`) encontra-se temporariamente desativada no deploy. Dessa forma, qualquer login efetuado via Node garantirá visibilidade total à área administrativa, viabilizando avaliação estrita!

## 🚀 Como começar (Getting Started)

O ambiente de desenvolvimento local foi totalmente preparado com contêineres Docker para evitar configurações complexas na máquina física.

### Pré-requisitos
* [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose instalados.
* Node.js (opcional, para executar scripts globais do Workspace, mas o projeto inteiro roda isolado via Docker).

### Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/hairagenda.git
cd hairagenda
```

2. Configure o ambiente:
```bash
cp .env.example .env
```

3. Inicie a infraestrutura via Docker Compose:
```bash
docker-compose up -d
```

4. Execute as migrações do banco de dados:
```bash
docker-compose exec backend python manage.py migrate
```

Após o build e a inicialização dos contêineres:
- **Frontend** estará acessível em: `http://localhost:3000`
- **Backend API** estará acessível em: `http://localhost:8000`
- **Banco de Dados (PostgreSQL)** exposto na porta `5432`.

## 📚 Documentação Adicional

Links relevantes para a arquitetura e entendimento de uso da aplicação:

* [Definição do Produto (PRD)](./docs/prd.md)
* [Especificação Técnica](./docs/spec_tech.md)
* [Especificação de UI](./docs/spec_ui.md)
* [Jornada do Usuário](./docs/jornada_usuario.md)

## 💬 Ajuda e Suporte

Caso enfrente problemas com o ambiente de desenvolvimento, verifique os logs do docker (`docker-compose logs -f`) ou abra uma issue no repositório descrevendo o erro encontrado.

## 👥 Contribuição

O HairAgenda é um projeto acadêmico de Pós-Graduação, atualmente mantido pelos seus idealizadores iniciais. O modelo é fechado (V1/MVP), não aceitando contribuições externas imediatas até o avanço da versão inicial.
