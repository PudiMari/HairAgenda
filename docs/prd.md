
# Product Requirements Document (PRD)

## Visão do Produto
O **HairAgenda** é um sistema de agendamento online voltado para microempreendedores da beleza, focado em eliminar a dependência do WhatsApp para marcação de horários através de uma interface self-service.

## Escopo do MVP (Minimum Viable Product)
O MVP deve garantir que um cliente consiga visualizar serviços e agendar um horário sem intervenção humana.

### Épicos e Funcionalidades
- **Catálogo de Serviços:**
  - O sistema deve listar os serviços oferecidos com nome, preço e duração.
- **Motor de Agendamento:**
  - O cliente deve poder selecionar um dia e visualizar horários disponíveis.
  - O cliente deve poder confirmar a reserva de um horário.
- **Painel Administrativo (Backend):**
  - A profissional deve poder cadastrar, editar e excluir serviços via Django Admin.
  - A profissional deve poder visualizar os agendamentos realizados.

## Casos de Uso (Out of Scope para o MVP)
- Pagamento online integrado.
- Login e criação de perfil para o cliente final.