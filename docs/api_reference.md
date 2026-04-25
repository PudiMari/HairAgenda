# API Reference - HairAgenda

Este documento descreve os endpoints, métodos e padrões de comunicação da API do HairAgenda.

## 1. Padrões de Comunicação
- **Base URL (Produção):** `https://hair-agenda-backend.vercel.app/api/`
- **Protocolo:** HTTPS
- **Formato de Dados:** JSON (`application/json`)
- **Autenticação:** Integração com **Clerk Auth**. O frontend envia identificadores (`user_id`) e o backend valida as permissões e o isolamento de dados por profissional.

---

## 2. Endpoints Principais
*(Todos os caminhos abaixo são relativos à Base URL)*

### Serviços (`/services/`)
Gerenciamento do catálogo de serviços do profissional.
- **GET `/services/`**: Lista serviços. Parâmetro opcional: `professional_id`.
- **POST `/services/`**: Cria um novo serviço.
- **PATCH `/services/{id}/`**: Atualiza parcialmente um serviço.
- **DELETE `/services/{id}/`**: Remove um serviço.

### Agendamentos (`/appointments/`)
Gestão do fluxo transacional de reservas.
- **GET `/appointments/`**: Lista reservas. Filtros: `professional_id` ou `client_id`.
- **POST `/appointments/`**: Realiza uma nova reserva. Valida conflitos (Overlap) automaticamente no backend.
- **PATCH `/appointments/{id}/`**: Atualiza status ou dados da reserva.

### Perfil Profissional (`/professional-profile/`)
Dados públicos e configurações da conta do profissional.
- **GET `/professional-profile/{user_id}/`**: Detalhes do perfil.
- **GET `/professional-profile/{user_id}/available-slots/`**: Endpoint inteligente que retorna horários livres otimizados ("Smart Gap Filler").
- **POST `/professional-profile/`**: Criação de perfil.

### Horários e Bloqueios (`/opening-hours/` e `/professional-blocks/`)
Configurações de agenda.
- **GET/POST/PATCH `/opening-hours/`**: Gerencia o expediente semanal (0-6).
- **GET/POST/DELETE `/professional-blocks/`**: Gerencia bloqueios manuais de datas/horários específicos.

### Portfólio (`/portfolio-items/`)
Vitrine visual de trabalhos.
- **GET/POST/DELETE `/portfolio-items/`**: Gerenciamento de imagens, títulos e categorias.

---

## 3. Códigos de Retorno
- `200 OK`: Sucesso.
- `201 Created`: Recurso criado.
- `400 Bad Request`: Falha de validação (ex: conflito de horário).
- `404 Not Found`: Recurso inexistente.
- `500 Server Error`: Falha interna.
