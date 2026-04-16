# API Reference - HairAgenda

Este documento descreve os endpoints, métodos e padrões de comunicação da API do HairAgenda.

## 1. Padrões de Comunicação
- **Base URL (Produção):** `https://hair-agenda-api.onrender.com/api/v1/`
- **Protocolo:** HTTPS
- **Formato de Dados:** JSON (`application/json`)
- **Autenticação:** Baseada em tokens Clerk (JWT) via cabeçalhos de autorização (V2) e identificadores únicos (`user_id` / `professional_id`) nos payloads/filtros.

---

## 2. Endpoints Principais
*(Todos os caminhos abaixo são relativos à Base URL `.../api/v1`)*

### Servicos (`/v1/services/`)
Gerenciamento do catálogo de serviços do profissional.
- **GET `/v1/services/`**: Lista todos os serviços. Aceita parâmetro `professional_id` para filtragem.
- **POST `/v1/services/`**: Cria um novo serviço (requer `name`, `price`, `duration_minutes`).
- **PATCH `/v1/services/{id}/`**: Atualiza parcialmente um serviço existente.
- **DELETE `/v1/services/{id}/`**: Remove um serviço do catálogo.

### Agendamentos (`/v1/appointments/`)
Gestão do fluxo transacional de reservas.
- **GET `/v1/appointments/`**: Lista agendamentos. Aceita `professional_id` ou `client_id` para filtros de histórico.
- **POST `/v1/appointments/`**: Realiza uma nova reserva. 
  - **Lógica Crítica:** O backend valida automaticamente o "Overlap" (overlap prevention) baseado na duração do serviço.
  - **Payload:** `client_name`, `client_whatsapp`, `service` (ID), `date_time` (ISO 8601).

### Perfil Profissional (`/v1/professional-profile/`)
Configurações e bio da profissional de beleza.
- **GET `/v1/professional-profile/{user_id}/`**: Recupera dados detalhados do perfil.
- **POST `/v1/professional-profile/`**: Cria o perfil inicial após o onboarding.
- **PATCH `/v1/professional-profile/{id}/`**: Atualiza dados de localização, bio e redes sociais.

### Saúde do Sistema (`/v1/health/`)
- **GET `/v1/health/`**: Verifica a conectividade com o banco de dados e o status da API.

---

## 3. Códigos de Retorno
- `200 OK`: Sucesso na operação.
- `201 Created`: Recurso criado com sucesso.
- `400 Bad Request`: Erro de validação (ex: conflito de horário/overlap).
- `404 Not Found`: Recurso não encontrado (ex: `user_id` inexistente).
- `500 Internal Server Error`: Falha crítica no servidor ou banco de dados.
