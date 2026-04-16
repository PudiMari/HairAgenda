# Definição de Requisitos do Produto (PRD)

## Descrição do produto

**Problema**: A gestão manual da agenda por profissionais de beleza em aplicativos de mensagens gera ineficiência, perda de produtividade ao interromper atendimentos e uma alta taxa de *no-shows* pela ausência de lembretes automatizados. Além disso, existe grande atrito para o cliente, que precisa aguardar o profissional estar livre para confirmar disponibilidade e preços.

**Solução**: Uma plataforma web de agendamento online inteligente e automatizada (24/7). O sistema oferece vitrine de serviços, verificação de disponibilidade em tempo real e autoagendamento sem fricção pelo cliente, conectando isso diretamente ao sistema de lembretes automáticos e à rotina do profissional.

Para o **profissional autônomo do mercado de beleza**, a solução centraliza e automatiza a gestão da agenda garantindo economia de tempo de negociação, redução significativa de faltas pelo cliente e um aumento do potencial de faturamento.

Nossos Diferenciais:
- Lembretes automáticos de agendamento integrados via WhatsApp.
- Experiência de agendamento para o cliente `responsivo` (funciona fluidamente em Desktop e Mobile sem precisar baixar aplicativo).
- Funciona 24/7: Agendamentos acontecem enquanto a profissional dorme ou trabalha.
- Link único para biografia do Instagram/WhatsApp, simplificando a captação.

---

## Perfis de Usuário

1. Profissional Autônomo de Beleza (Cabeleireiro(a), Manicure, etc.)
2. Cliente Final

### Profissional Autônomo de Beleza

- Problemas: Interrupções nos atendimentos para responder clientes e agendar horários; perda de clientes para concorrentes por demora no atendimento virtual; clientes ausentes (no-shows) que geram perda líquida de dinheiro.
- Objetivos: Ter o tempo 100% dedicado aos procedimentos técnicos; lotar a agenda; diminuir faltas; ter previsibilidade financeira.
- Dados demográficos: Profissionais liberais, entre 20 e 50 anos, que possuem pequeno espaço físico, atendem a domicílio ou alugam cadeiras em salões parceiros.
- Motivações: Profissionalizar o negócio, aumentar a renda e poder descansar sem a pressão de "ter que responder mensagens de clientes".
- Frustrações: Estresse de ficar negociando horários à noite e finais de semana; furos na agenda por clientes que marcam e "esquecem".

### Cliente Final

- Problemas: Depender do horário de funcionamento do profissional/salão para marcar o serviço; demora para obter respostas pelo WhatsApp; falta de clareza imediata sobre preços.
- Objetivos: Agendar os serviços de beleza desejados rapidamente e com comodidade, na hora que quiser.
- Dados demográficos: Pessoas de 16 a 60 anos, ativas digitalmente com uso predominante do smartphone.
- Motivações: Cuidar da aparência de forma prática; conveniência e facilidade.
- Frustrações: Ficar aguardando retorno do profissional para tentar conciliar agendas num chat; chegar no salão e ser surpreendido pelos valores de diferentes procedimentos, ou perder e se esquecer da hora porque ninguém o lembrou.

---

## Principais Funcionalidades

1. Agenda Gestão do Profissional
2. Página de Autoagendamento do Cliente
3. Motor de Notificações

### RFN-01 Gerenciamento da Agenda e Serviços Disponíveis

- Painel administrativo simples para o Profissional configurar a duração, o valor e o nome dos seus serviços, e estabelecer seus dias e horários de funcionamento (Janela de atuação). Também emite o "Link Único" do seu perfil.

Critérios de Aceitação:
- Permitir bloquear manualmente dias inteiros (ex: férias/folga) ou blocos de horários.
- Não pode permitir agendamentos simultâneos ou conflitantes (overlap).
- Atualização em tempo real de cancelamentos e novos agendamentos na visão de agenda do Profissional.

### RFN-02 Portal de Autoagendamento do Cliente (Link Público)

- Visão pública acessada via link (Web Responsivo) para os clientes selecionarem serviços, visualizarem o calendário com horários vagos precisos e concluírem a marcação preenchendo apenas nome e telefone.

Critérios de Aceitação:
- Deve ser 100% responsivo (funcionando perfeitamente em telas grandes e pequenas), não exigindo downloads de stores.
- Fluxo rápido: seleção de serviço -> seleção de data/hora -> input de dados de contato -> confirmação.
- Transparência obrigatória do valor total e do tempo do serviço antes da confirmação final do agendamento.

### RFN-03 Motor de Lembretes Automáticos

- Funcionalidade invisível que cuida da jornada de notificação do agendamento a fim de mitigar ausências (no-shows).

Critérios de Aceitação:
- O motor deve enviar lembrete proativo X horas antes do atendimento via canal confiável (WhatsApp ou SMS).
- Deve incluir um link facilitado caso o cliente queira desmarcar.
- Quando o cliente cancela via link, a agenda do profissional é automaticamente liberada, evitando travas indevidas de slots de hora.

---

## Requisitos Não Funcionais

- RNF-01 - Desempenho
- RNF-02 - Disponibilidade
- RNF-03 - Usabilidade (Acessibilidade e Fricção)
- RNF-04 - Segurança e Privacidade (LGPD)
- RNF-05 - Escalabilidade

### RNF-01 - Desempenho

A página de autoagendamento deve ser extremamente rápida e carregar em menos de 2.5 segundos no 4G brasileiro/mobile ou WiFi/Desktop, pois qualquer lentidão excessiva afeta diretamente a conversão e motiva ao cliente voltar para o atendimento pelo WhatsApp humano.

### RNF-02 - Disponibilidade

A arquitetura e infraestrutura (SLA) deve mirar 99.9% de uptime, operando estritamente em um regime 24/7. O core value proposition é justamente agendar em horários atípicos (ex: tarde da noite).

### RNF-03 - Usabilidade (Acessibilidade e Fricção)

O sistema de front-end do cliente deve focar em acessibilidade e zero curva de aprendizado, dispensando "logins e senhas complexos" (priorizando autenticação via redes sociais, tokens OTP via WhatsApp ou e-mail na v1 simplificada).

### RNF-04 - Segurança e Privacidade (LGPD)

O sistema deve isolar os dados transacionais de clientes e proteger as agencias dos profissionais garantindo conformidade com a LGPD. Inclui limites estruturais transacionais contra vazamentos e implementações contra DoS/DDoS para proteção contra esgotamento forçado (bots) da agenda.

### RNF-05 - Escalabilidade

A arquitetura de infraestrutura deve ser capaz de sustentar escalabilidade instantânea em borda (utilizando features como Edge Networks) no lado de clientes finais e garantir integridade atômica nas reservas simultâneas sob o Banco de Dados.

---

## Métricas de Sucesso

- **Taxa de "No-Shows" (Faltas)**: Redução quantificável em relação à linha de base do profissional pré-software (meta ficar abaixo de 5-7%).
- **Adoção do Autoagendamento**: % de consultas geradas autonomamente pelo cliente pelo Link Público X agendadas manualmente pelo profissional no mesmo negócio.
- **NPS (Net Promoter Score) do Profissional**: Meta acima de 70.
- **Tempo de Sessão para Agendamento do Cliente**: Finalização do fluxo em menos de 60 segundos por cliente (via Desktop ou Mobile). *Esta métrica deve ser extraída e rastreadada rigorosamente por meio do nosso framework de observabilidade nativo (usando OpenTelemetry) injetado no Frontend.*

---

## Premissas e restrições

- Premissas:
  - Profissionais e clientes usarão sempre conexão web estável via smartphone de variados portes ou computadores (Desktop/Notebooks).
  - A comunicação principal para lembretes será compatível com os sistemas dos clientes (preferencialmente WhatsApp que abrange a quase totalidade do mercado alvo BR).

- Restrições:
  - Inicialmente as ferramentas são limitadas à "gestão de horários", não constituindo um ERP complexo com frente de caixa e estoque de produtos.
  - A *V1* não terá gateway de pagamentos online implementado (transações são offline presencialmente no salão).

## Escopo e Limitações

### O que está no Escopo (V1 - Core MVP)
- **Perfil do Profissional**: Gestão de serviços, preços e horários.
- **Vitrine Digital**: Geração de link único para bio de redes sociais.
- **Autoagendamento**: Interface web rápida para clientes sem necessidade de login complexo.
- **Motor de Lembretes**: Disparo de mensagens proativas (Síncronas na V1).
- **Dashboard Admin**: Visualização consolidada de ocupação e faturamento diário.

### O que está FORA de Escopo (Out of Scope)
- **Gateway de Pagamento**: Transações financeiras ocorrem presencialmente (fora do app).
- **Gestão de Estoque**: Não há controle de insumos ou produtos físicos.
- **Aplicativo Nativo**: O sistema é uma Web App (PWA-ready), não disponível em App Store/Play Store.
- **Relatórios Avançados**: Gráficos de performance e CRM detalhado (Planejado para V2).

### Roadmap (V2)
- Relatórios de agendamentos e exportação de dados.
- Histórico completo de clientes (CRM simplificado).
- Controle de status detalhado (Cancelado, Concluído, No-show).
- Migração para tarefas assíncronas (Celery/Redis) para notificações.
