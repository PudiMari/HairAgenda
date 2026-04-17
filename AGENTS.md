# AGENTS.md - Guia para Agentes de IA (HairAgenda)

Bem-vindo ao projeto **HairAgenda**! Este documento serve como bússola para agentes de IA que colaboram no desenvolvimento desta ferramenta.

## 🚀 Visão Geral do Projeto
O HairAgenda é uma plataforma inteligente de autoagendamento focado em profissionais autônomos de beleza.
- **Objetivo**: Automatizar a gestão de agenda e reduzir *no-shows*.
- **Arquitetura**: Monorepo com Backend em Django e Frontend em React (TS + Vite).

## 🛠️ Stack Tecnológica
- **Backend**: Python 3.x, Django, Django REST Framework, PostgreSQL.
- **Frontend**: React 18+, TypeScript, Vite, TailwindCSS (mockups), Material Symbols.
- **Infra**: Docker, Docker Compose, Vercel (Deploy).

## 🧠 Artefatos de IA
Para auxiliar no desenvolvimento, utilize os seguintes recursos:
- **Skills**: Localizadas em `.agent/skills/`. Sempre consulte o `SKILL.md` antes de usar uma skill nova.
- **Prompts**: Localizados em `.agent/prompts/prompt_ux_design.md` para referências de UI/UX.
- **Contexto**: Consulte sempre o `PRD.md` e `spec_tech.md` em `docs/` antes de propor mudanças arquiteturais.

## 📜 Regras de Engajamento
1. **Preserve a Documentação**: Ao alterar código, atualize as especificações em `docs/` se houver mudança de comportamento.
2. **Aesthetics Matter**: O projeto preza por uma interface premium e minimalista. Siga as diretrizes de design em `docs/spec_ui.md`.
3. **Monorepo Awareness**: Sempre verifique em qual diretório (`apps/backend` ou `apps/frontend`) a tarefa deve ser executada.
4. **Clean Code**: Siga o PEP 8 para Python (monitorado por `.flake8`) e as melhores práticas de TypeScript/React.

## 📂 Estrutura de Pastas Útil
- `/apps/backend`: Lógica de negócio, agendamentos e API.
- `/apps/frontend`: Interface do usuário e dashboard administrativo.
- `/docs`: Requisitos, Jornadas, ADRs e Specs.
- `/.agent`: Inteligência e automação específica para assistentes.

---
*Este arquivo deve ser atualizado conforme o projeto evolui para garantir que novos agentes tenham o contexto correto.*
