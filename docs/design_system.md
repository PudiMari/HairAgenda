# Design System - HairAgenda

Este documento descreve as diretrizes visuais e componentes fundamentais da identidade do HairAgenda.

## Paleta de Cores

A identidade visual é baseada em tons sofisticados e contrastantes, focados no público de prestação de serviços de beleza premium.

| Cor | Hex/CSS | Uso |
| :--- | :--- | :--- |
| **Primária (Gold)** | `#D4AF37` / `text-brand-gold` | Cuidado, sofisticação, botões de ação principal. |
| **Fundo Dark** | `#0F172A` / `bg-slate-900` | Barra de navegação, rodapé, modo profissional. |
| **Superfície** | `#F8FAFC` / `bg-slate-50` | Fundo principal do aplicativo cliente. |
| **Texto Forte** | `#1E293B` / `text-slate-800` | Títulos e leitura principal. |
| **Feedback Sucesso** | `#10B981` | Mensagens de sucesso de agendamento. |

## Tipografia

- **Fonte Principal:** Inter / System Sans-serif.
- **Títulos:** Bold (700), com espaçamento entre letras reduzido para impacto profissional.
- **Corpo:** Normal (400), focado em legibilidade máxima em dispositivos móveis.

## Componentes Principais

### 1. Botões Primários
Estilo "Glassmorphism" ou "Solid Gold" com bordas arredondadas e efeitos de hover suaves.

### 2. Cards de Serviço
Exibição de: Título, Duração, Preço e Botão de Agendar. Borda suave com sombra (shadow-sm).

### 3. Navegação (Navbar)
Design minimalista, fixo no topo, com troca dinâmica entre botões de login e perfil de usuário (via Clerk).

## Experiência do Usuário (UX)
- **Foco em 3 Cliques:** A interface deve permitir que o cliente complete um agendamento em no máximo 3 interações principais.
- **Mobile First:** Prioridade absoluta para visualização em smartphones (iOS/Android).
