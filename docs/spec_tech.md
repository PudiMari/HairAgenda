
# Especificação Técnica

## Arquitetura do Sistema
O projeto utiliza uma arquitetura cliente-servidor, separando o Frontend (Web) e o Backend (API) em diretórios distintos.

## Stack Tecnológico

### Backend (API REST)
- **Linguagem:** Python
- **Framework:** Django e Django REST Framework
- **Banco de Dados:** SQLite (para o ambiente de desenvolvimento/MVP)
- **Responsabilidades:** Gerenciamento do banco de dados, regras de negócio da agenda, autenticação administrativa e provimento de endpoints RESTful.

### Frontend (SPA)
- **Biblioteca:** React.js
- **Build Tool:** Vite
- **Responsabilidades:** Consumo da API via requisições HTTP (Fetch/Axios), renderização da interface do usuário e gerenciamento de estado local.

## Estrutura de Diretórios Principal
- `/backend/`: Contém a aplicação Django e o ambiente virtual (`venv`).
- `/web/`: Contém a aplicação React, componentes e arquivos estáticos.
- `/docs/`: Documentação estratégica e técnica do projeto.