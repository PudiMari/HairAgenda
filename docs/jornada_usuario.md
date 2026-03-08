# Jornada do Usuário

> Produto / Serviço: HairAgenda
> Persona: Cliente Final  
> Data: 08/03/2026
> Responsável: Mariana Dias do Espirito Santo  

---

## 📌 Visão Geral da Jornada

| Etapa | Descrição  | Objetivo do Usuário|
|-------|--------------------|-------------------|
| 1. Descoberta | Vê um post no Instagram da profissional e decide marcar um serviço. | Encontrar uma cabeleireira de confiança. |
| 2. Acesso ao Catálogo | Clica no link da bio e entra na página do HairAgenda. | Conferir os serviços, preços e se cabe no bolso. |
| 3. Agendamento (Reserva) | Escolhe o serviço (ex: Corte Feminino) e um horário livre no calendário. | Garantir a sua vaga sem precisar enviar mensagens. |
| 4. Confirmação | Recebe o feedback visual de que o horário está reservado com sucesso. | Ter a certeza de que a marcação deu certo e a profissional foi avisada. |
| 5. Comparecimento | Vai ao salão no dia e horário marcados para realizar o serviço. | Ter uma ótima experiência de atendimento presencial. |

---

## 🔎 Detalhamento por Etapa

---

### 🟦 Etapa 1: Acesso ao Catálogo

#### Ações do Usuário
1. Clica no link do HairAgenda disponível na bio do Instagram ou WhatsApp.
2. Aguarda o carregamento da página web.
3. Rola a tela para ver a lista de serviços e os respectivos preços.

#### Pontos de Contato (Touchpoints)
- Instagram / WhatsApp da profissional.
- Tela inicial do Web App (Frontend React).

#### Percepção do Usuário (Emoção / Experiência)
- O que sente: Curiosidade e conveniência.
- Dúvidas: "Será que ela tem horário para hoje ainda?"
- Frustrações: Nenhuma nesta etapa, a menos que o site demore a carregar.
- Satisfação: Alta, por conseguir ver os preços imediatamente sem precisar perguntar "qual o valor?".

#### Oportunidades de Melhoria
- Colocar fotos de resultados reais ao lado do nome do serviço.
- Adicionar uma breve descrição (ex: "Corte Feminino - Inclui lavagem e escova").

---

### 🟦 Etapa 2: Agendamento (Reserva)

#### Ações do Usuário
1. Toca no serviço desejado.
2. Visualiza o calendário e clica no dia de sua preferência.
3. Escolhe um dos horários disponíveis listados e clica em "Confirmar".

#### Pontos de Contato (Touchpoints)
- Interface de calendário do Web App.
- API do Backend validando a disponibilidade real no banco de dados.

#### Percepção do Usuário (Emoção / Experiência)
- O que sente: Sensação de controle e autonomia.
- Dúvidas: "Se eu precisar desmarcar depois, como eu faço?"
- Frustrações: Encontrar a agenda lotada na semana inteira.
- Satisfação: Muito alta pela rapidez. São apenas 3 cliques para resolver um problema.

#### Oportunidades de Melhoria
- Implementar uma função de "Lista de Espera" caso o dia desejado esteja lotado.
- Permitir agendar mais de um serviço na mesma sessão (ex: Corte + Coloração).

---

### 🟦 Etapa 3: Confirmação

#### Ações do Usuário
1. Visualiza a tela verde de sucesso no aplicativo.
2. Faz uma captura de tela (print) para guardar o comprovante do horário.
3. Fecha o navegador.

#### Pontos de Contato (Touchpoints)
- Tela de feedback final do Web App.

#### Percepção do Usuário (Emoção / Experiência)
- O que sente: Alívio ("Ufa, tá marcado").
- Dúvidas: "Será que a cabeleireira recebeu a notificação do meu agendamento?"
- Frustrações: Nenhuma, objetivo concluído.
- Satisfação: Plena. O processo foi indolor e silencioso.

#### Oportunidades de Melhoria
- Enviar um disparo automático no WhatsApp da cliente com o resumo do agendamento.
- Oferecer um botão "Adicionar ao Google Agenda" na tela de sucesso.

---

## 📊 Visão Analítica da Jornada

### Momentos Críticos (Moments of Truth)
- O momento em que a cliente decide clicar no serviço: Se o preço não for transparente, ela abandona a página.
- O clique final no botão "Confirmar": O sistema não pode travar nessa hora, a persistência no banco de dados precisa ser imediata.

### Pontos de Fricção
- Necessidade de preencher formulários longos de cadastro antes de confirmar o horário (deve ser evitado para não gerar abandono).
- Horários exibidos no Frontend que já foram ocupados no Backend (problema de concorrência que gera erro na hora de confirmar).