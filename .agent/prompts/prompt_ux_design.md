# Prompt para IA - Designer de UX (Ferramentas de Prototipagem)

*Utilize este prompt em ferramentas generativas de interface (como Google Stitch, v0, Galileo AI, etc) para gerar as telas iniciais do projeto.*

---

**Atue como:** Designer de UX/UI Sênior e Protótipo frontend.

**Objetivo:** Criar templates de alta fidelidade (mockups/código inicial) para um sistema web chamado "HairAgenda", focado em um layout web totalmente responsivo (Fluido entre Desktop e Mobile) para profissionais de beleza autônomos.

**Contexto do Projeto:** 
- **Problema:** Profissionais perdem tempo negociando horários via WhatsApp e sofrem com clientes faltando (no-shows).
- **A Solução:** Um agendador Web Responsivo 24/7.
- **Tech Stack-Alvo (Para código):** React, Tailwind CSS (Design System Minimalista e acessível), focado em adaptar-se com perfeição de telas grandes (Desktop) até telas pequenas (Smartphones).

**Instruções de Geração:**
Gere e entregue o design (ou o componente React) para os seguintes fluxos interconectados, garantindo tempo de carregamento rápido e zero fricção visual:

**Fluxo 1: Cliente Final (Jornada Responsiva)**
Gere as seguintes telas num fluxo contínuo (Wizard linear):
1. **INT-01 (Perfil/Vitrine):** Tela de entrada através do Link da Bio. Deve conter a Foto/Logo do profissional no topo, Nome, Bio curta e endereço. Crie um botão CTA ("Call to Action") gigante primário: `[Agendar Horário]` e botões secundários `[Ver Serviços]` e `[Contato WhatsApp]`.
2. **INT-02 (O Quê e Quando):** 
   - *Passo A:* Uma lista limpa de Serviços em formato de cartões clicáveis, mostrando Nome, Preço (R$) e Duração (min).
   - *Passo B:* Um calendário simplificado e *Datepicker* horizontal (mostrando próximos 7-15 dias) acompanhado de uma Grelha/Grid de blocos de horas disponíveis. Esconda visualmente dias passados ou sem vaga. Inclua botões rápidos de `[Avançar ->]` e `[<- Voltar]`.
3. **INT-03 (Confirmação):** Um formulário ultra simples contendo Input para *Nome Completo* e *Input de Celular (WhatsApp)*. Acima, mostre o resumo final do pedido (Serviço, R$, Data e Hora). Abaixo, um CTA confirmando a ação: `[Confirmar Agendamento]`.

**Fluxo 2: Visão do Profissional (Dashboard Administrativo)**
Gere componentes responsivos (funcionando no Desktop e Mobile):
1. **INT-04 (Dashboard Principal):** Crie um Layout com Sidebar lateral oculta no mobile. Na página central, inclua "Cards de Indicadores" no topo (Agendamentos Hoje, Previsão R$). Abaixo, recrie uma visualização de "Calendário/Agenda Semanal" que permita leitura fácil de buracos/espaços vazios no dia. Botão de destaque superior para `[Criar Bloqueio de Horário]` e `[Copiar Link do Meu Perfil]`.
2. **INT-05 (Config. de Serviços):** Uma tabela (*Data Table*) moderna e limpa listando serviços com as colunas: Nome, R$, Tempo. Exiba estado "Vazio" (Empty State) bonito se o usuário não tiver serviços. Crie o Modal de novo serviço com inputs de input texto e dropdown para blocos de tempo.
3. **INT-06 (Config. de Agenda):** Um layout de formulário com Toggles deslizáveis (como componentes de switch do iOS) para cada dia da semana (Segunda a Domingo). Quando o switch for ativado, mostre *TimePickers* elegantes de Início e Fim do expediente e Início/Fim do Almoço.

**Diretrizes de Estética:**
1. Acessibilidade máxima (Contrastes perfeitos).
2. Sem formulários excessivos de Login/Senha para o Fluxo do Cliente.
3. Use estados de "Empty states" (ex: "Sua agenda de terça-feira não possui horários").
4. Mantenha as interações e transições fluídas utilizando o espaço extra do Desktop quando disponível, mas sem quebrar a proporção em visões de Smartphone.
