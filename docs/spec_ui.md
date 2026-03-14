# Especificação de UI

## Interfaces gráficas

- INT-01 - Perfil Público do Profissional (Visão Cliente)
- INT-02 - Seleção de Serviço e Horário (Visão Cliente)
- INT-03 - Confirmação de Agendamento (Visão Cliente)
- INT-04 - Dashboard Principal (Visão Profissional)
- INT-05 - Configuração de Serviços (Visão Profissional)
- INT-06 - Configuração de Agenda/Horários (Visão Profissional)

### INT-01 - Perfil Público do Profissional (Visão Cliente)

- **Tipo:** Página Web Responsiva
- **Campos:** Avatar/Logo do profissional, Nome/Título do Salão, Bio curta e Endereço.
- **Botões:** `[Agendar Horário]`, `[Ver Serviços]`, `[Contato WhatsApp]`
- **Links:** Ícone para Instagram, Mapa do endereço (Google Maps).
- **Considerações:** Esta é a "vitrine" inicial acessada via link na Bio do Instagram. Deve ser extremamente rápida de carregar evidenciando imediatamente a chamada para ação principal (Agendar).

### INT-02 - Seleção de Serviço e Horário (Visão Cliente)

- **Tipo:** Formulário Step-By-Step (Wizard)
- **Campos:** 
  - Passo 1 (Serviços): Lista de serviços com preço (R$) e duração (ex: 45 min).
  - Passo 2 (Calendário): Datepicker simplificado focado nos próximos 7 a 30 dias. Grelha de horários disponíveis dinamicamente construída.
- **Botões:** `[Avançar ->]` para cada passo, e `[<- Voltar]`.
- **Links:** N/A
- **Considerações:** UX deve impedir a seleção de dias passados ou dados em que não haja vaga no banco, mostrando o dia inativo/cruzado, e não permitindo bloqueio no fluxo. O design deve ser minimalista para manter a conversão alta.

### INT-03 - Confirmação de Agendamento (Visão Cliente)

- **Tipo:** Formulário de Input e Feedback (Tela Final)
- **Campos:** Input Nome Completo, Input Celular (WhatsApp). Resumo final do serviço, preço, data e hora da escolha.
- **Botões:** `[Confirmar Agendamento]`
- **Links:** Termos breves ("Ao continuar, concordo em receber mensagens no WhatsApp").
- **Considerações:** Último passo focado em captar o lead. Ao clicar no botão, uma tela de sucesso deve surgir animada confirmando a reserva e informando que a notificação foi enviada no celular.

### INT-04 - Dashboard Principal (Visão Profissional)

- **Tipo:** Painel de Administração (Dashboard)
- **Campos:** Indicadores no formato de cartões (ex: "X agendamentos hoje", "R$ Previsto"). Grade visual do calendário exibindo em blocos diários/semanais as marcações.
- **Botões:** `[Criar Bloqueio de Horário]`, botão de `[Copiar Link do Meu Perfil]`.
- **Links:** Menu lateral contendo navegação `[Visão Geral]`, `[Serviços]`, `[Horários e Config]`.
- **Considerações:** Calendário visual deve permitir leitura rápida do dia. Ter clareza visual caso haja "furos" para a pessoa se programar melhor. 

### INT-05 - Configuração de Serviços (Visão Profissional)

- **Tipo:** Tabela e Modal Form
- **Campos (Tabela):** Lista dos serviços já criados mostrando Nome, R$ e Tempo.
- **Campos (Modal de Criação):** Input Nome do Serviço, Input Valor do Serviço, Dropdown Duração do Serviço (Em blocos de 15/30 min). Toggle "Serviço Ativo?".
- **Botões:** `[+ Novo Serviço]`, `[Editar]`, `[Excluir Serviço]`
- **Links:** N/A
- **Considerações:** A simplicidade prevalece, serviços podem ser ativados e desativados de maneira dinâmica (ex: promoção de inverno arquivada fora de época).

### INT-06 - Configuração de Agenda/Horários (Visão Profissional)

- **Tipo:** Formulário e Painel de Toggles Múltiplos
- **Campos:** Toggles para cada dia da semana "Seg, Ter, Qua, Qui, Sex, Sáb, Dom". Ao ligar o Toggle do dia, surgem dois inputs de TimePicker para "Início Expediente" e "Fim do Expediente". Um botão opcional para "Adicionar Horário de Almoço/Pausa".
- **Links:** N/A
- **Considerações:** Extremamente vital para gerar os blocos em branco no Passo 2 do Cliente. A UI deve ser perdoável com erros, impedindo inputs de texto livre nas horas (usar dropdowns ou time-pickers forçados).

---

## Fluxo de Navegação

1. **Jornada do Cliente Finals (Flow de Marcação):**
   - O fluxo inicia ao acessar o *"Link Único"* divulgado no Instagram (INT-01). 
   - Ao clicar em `Agendar Horário`, a navegação flui obrigatoriamente para a INT-02 (onde decide "O QUÊ" e "QUANDO"). 
   - Ao avançar, encerra o ciclo inserindo os seus dados pessoais (INT-03).
   - *Nota:* O funil do cliente é linear e deve possuir barra de progresso.

2. **Jornada do Profissional (Flow Administrativo):**
   - Centraliza sempre na INT-04 (Dashboard), onde visualiza seu dia de trabalho.
   - Usando a barra lateral (Sidebar), acessa o CRUD de funcionalidades cadastradas ativamente no motor (como INT-05 e INT-06) sem perder estado anterior se sair do painel.

---

## Diretrizes para IA

- Esta documentação é o mapa mental de interface (*Wireframe Lógico*) primário da aplicação HairAgenda V1 MVP.
- A IA que for codificar as páginas Web com base neste documento (em React, por exemplo) deve deduzir os painéis, as exibições dos inputs com espaçamento e as *call to actions* visando 100% de responsividade (Desktop/Mobile).
- Deve adotar bibliotecas consistentes de Design System (ex: MUI, Chakra ou Tailwind/Shadcn), respeitando ativamente os "Botões" listados e interconectando o Fluxo Lineares.
- Sempre que criar uma tela com estado de falha (Data indisponível), a IA deve projetar um empty state ("Sem horários para esta data") de forma amigável utilizando esta padronização.