<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Swagger-Documented-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" />
</p>

# 🔗 LinksHub API

API RESTful para gerenciamento de links pessoais. Permite que usuários cadastrem, organizem, exportem e importem seus links favoritos de forma segura com autenticação JWT.

> **Produção:** [https://api-linkshub.mlluizdevtech.com.br](https://api-linkshub.mlluizdevtech.com.br)  
> **Documentação Swagger:** [https://api-linkshub.mlluizdevtech.com.br/api-docs](https://api-linkshub.mlluizdevtech.com.br/api-docs)

---

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tech Stack](#-tech-stack)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Executando](#-executando)
- [Deploy com Docker](#-deploy-com-docker)
- [Endpoints da API](#-endpoints-da-api)
- [Documentação Swagger](#-documentação-swagger)
- [Segurança](#-segurança)
- [Autor](#-autor)
- [Licença](#-licença)

---

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** — Registro e login com tokens seguros (expiração: 7 dias)
- 🔗 **CRUD de Links** — Criar, listar, editar e excluir links
- 📦 **Backup & Restore** — Exportar e importar links em JSON
- ✅ **Validação com Zod** — Validação robusta de dados de entrada
- 🛡️ **Rate Limiting** — Proteção contra brute-force (5 tentativas/15min)
- 📖 **Swagger** — Documentação interativa da API
- 🐳 **Docker Ready** — Pronto para deploy com Docker Compose
- 🔒 **Senhas com bcrypt** — Hash seguro com salt rounds

---

## 🛠 Tech Stack

| Tecnologia | Finalidade |
|---|---|
| **Node.js 20** | Runtime JavaScript |
| **Express 5** | Framework HTTP |
| **PostgreSQL** | Banco de dados relacional |
| **JWT** | Autenticação stateless |
| **bcrypt** | Hash de senhas |
| **Zod** | Validação de schemas |
| **Swagger** | Documentação da API |
| **Docker** | Containerização |

---

## 🏗 Arquitetura

```
back-end-linksHub/
├── index.js                    # Entry point — Express setup
├── dockerfile                  # Build da imagem Docker
├── Docker-compose.yml          # Orquestração de containers
├── .env.example                # Template de variáveis de ambiente
├── .dockerignore               # Arquivos ignorados pelo Docker
├── package.json
└── src/
    ├── config/
    │   └── swagger.js          # Configuração do Swagger
    ├── controllers/
    │   ├── authController.js   # Registro, login e middleware JWT
    │   └── linkController.js   # CRUD de links + backup/restore
    ├── lib/
    │   └── db.js               # Pool de conexão PostgreSQL
    ├── middlewares/
    │   └── middleware.js        # Middleware de autenticação
    └── routes/
        ├── authRoutes.js       # Rotas de autenticação
        └── linkRoutes.js       # Rotas de links
```

---

## 📦 Pré-requisitos

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v9+
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (para deploy)
- Banco PostgreSQL (recomendado: [Neon](https://neon.tech/))

---

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/Mlluiz39/back-end-linksHub.git
cd back-end-linksHub

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@host/db?sslmode=require` |
| `PORT` | Porta do servidor | `3000` |
| `JWT_SECRET` | Chave secreta para tokens JWT | Gere com: `openssl rand -hex 32` |

```bash
# Exemplo de .env
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
```

> ⚠️ **Nunca** commite o arquivo `.env` — ele já está no `.gitignore`.

---

## ▶️ Executando

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor com **nodemon** (hot-reload) em `http://localhost:3000`.

### Produção

```bash
npm start
```

---

## 🐳 Deploy com Docker

### Build e execução rápida

```bash
# Construir e subir
docker compose up -d --build

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f app

# Parar
docker compose down
```

### Deploy na VPS

```bash
# 1. Clone o repositório na VPS
git clone https://github.com/Mlluiz39/back-end-linksHub.git
cd back-end-linksHub

# 2. Crie o .env de produção
cat > .env << EOF
DATABASE_URL=postgresql://sua_string_de_conexao
PORT=3000
JWT_SECRET=$(openssl rand -hex 32)
EOF

# 3. Suba com Docker Compose
docker compose up -d --build

# 4. Verifique
curl http://localhost:3000
# 🚀 API linksHub rodando com sucesso!
```

---

## 📡 Endpoints da API

### Autenticação

> Rotas públicas — não requerem token.  
> Rate limit: **5 requisições / 15 minutos** por IP.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Registrar novo usuário |
| `POST` | `/auth/login` | Login com email e senha |

#### `POST /auth/register`

```json
// Request
{
  "name": "Marcelo Luiz",
  "email": "marcelo@email.com",
  "password": "minha_senha_123"
}

// Response 201
{
  "user": { "id": 1, "name": "Marcelo Luiz", "email": "marcelo@email.com" },
  "token": "eyJhbGciOiJI..."
}
```

#### `POST /auth/login`

```json
// Request
{
  "email": "marcelo@email.com",
  "password": "minha_senha_123"
}

// Response 200
{
  "user": { "id": 1, "name": "Marcelo Luiz", "email": "marcelo@email.com" },
  "token": "eyJhbGciOiJI..."
}
```

---

### Links

> 🔒 Todas as rotas requerem header `Authorization: Bearer <token>`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/links` | Listar todos os links do usuário |
| `POST` | `/links` | Criar novo link |
| `GET` | `/links/:id` | Buscar link por ID |
| `PUT` | `/links/:id` | Atualizar link |
| `DELETE` | `/links/:id` | Excluir link |
| `GET` | `/links/backup` | Exportar links (backup JSON) |
| `POST` | `/links/restore` | Importar links (restore JSON) |

#### `POST /links`

```json
// Request
{
  "title": "GitHub",
  "url": "https://github.com"
}

// Response 201
{
  "link": { "id": 1, "title": "GitHub", "url": "https://github.com", "user_id": 1 }
}
```

#### `GET /links/backup`

```json
// Response 200
{
  "links": [
    { "title": "GitHub", "url": "https://github.com" },
    { "title": "Google", "url": "https://google.com" }
  ]
}
```

#### `POST /links/restore`

```json
// Request
{
  "links": [
    { "title": "GitHub", "url": "https://github.com" },
    { "title": "Google", "url": "https://google.com" }
  ]
}

// Response 201
{
  "message": "2 links importados com sucesso.",
  "links": [...]
}
```

---

### Códigos de Erro

| Código | Significado |
|---|---|
| `400` | Dados inválidos (validação Zod) |
| `401` | Token não fornecido ou inválido |
| `404` | Recurso não encontrado |
| `409` | E-mail já cadastrado |
| `429` | Rate limit excedido |
| `500` | Erro interno do servidor |

---

## 📖 Documentação Swagger

A documentação interativa está disponível em:

- **Local:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Produção:** [https://api-linkshub.mlluizdevtech.com.br/api-docs](https://api-linkshub.mlluizdevtech.com.br/api-docs)

---

## 🔒 Segurança

- **Senhas** — Hash com `bcrypt` (10 salt rounds)
- **Autenticação** — Tokens JWT com expiração de 7 dias
- **Validação** — Schemas Zod para todas as entradas
- **Rate Limiting** — 5 tentativas de login/registro por 15 minutos por IP
- **CORS** — Origens permitidas configuradas
- **SSL** — Conexão segura com o banco de dados
- **Headers** — `Cross-Origin-Opener-Policy` e `Cross-Origin-Embedder-Policy` configurados

---

## 👤 Autor

**Marcelo Luiz**

- GitHub: [@Mlluiz39](https://github.com/Mlluiz39)

---

## 📄 Licença

Este projeto está sob a licença **ISC**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
