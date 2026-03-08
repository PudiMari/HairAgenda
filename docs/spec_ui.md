# Especificação de Interface (UI/UX)

## Princípios de Design
- **Mobile First:** Como 90% dos acessos de clientes de salão vêm de smartphones, a interface deve ser projetada primeiramente para telas pequenas.
- **Menos é Mais (Micro-UX):** A interface deve ter o mínimo de distrações possível. O caminho entre abrir a página e confirmar o agendamento deve levar no máximo 3 telas.
- **Clareza Visual:** Botões de ação primária (Call to Action) devem ser destacados e fáceis de tocar.

## Fluxo de Telas (MVP)
1. **Tela Inicial (Catálogo):**
   - Cabeçalho com o nome/logo do salão.
   - Lista vertical em formato de cards contendo Nome do Serviço e Preço.
2. **Tela de Calendário (Modal ou Nova Rota):**
   - Exibição de um calendário mensal simplificado.
   - Grade (Grid) de botões com os horários disponíveis para o dia selecionado.
3. **Tela de Sucesso:**
   - Mensagem clara de confirmação (ex: "Horário agendado com sucesso!").
   - Resumo do serviço e horário escolhidos.