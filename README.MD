# 🏥 MultiClinicalBack

Backend do projeto **MultiClinical**, desenvolvido em **Node.js + TypeScript**, usando **Express**, **Prisma** e **PostgreSQL** (Docker).

## 🚀 Tecnologias
- **Node.js** + **TypeScript**
- **Express.js**
- **Prisma ORM**
- **PostgreSQL** (via Docker)
- **Zod** para validação
- **Bcrypt** para hashing de senhas

---

## 📂 Estrutura de Pastas
src/
app.ts # Inicializa o Express e registra rotas
server.ts # Sobe o servidor
routes/
usuario.routes.ts
controllers/
usuario.controller.ts
services/
usuario.service.ts
repositories/
usuario.repository.ts
bootstrap/
seedAdmin.ts # Seed automático de usuário admin
prisma/
schema.prisma # Definição do banco (Prisma)
seed.ts # Script manual de seed

## 🔄 Fluxo da Requisição

```mermaid
flowchart LR
    A[Cliente (Postman/Front)] -->|HTTP| B[Express - app.ts]
    B -->|prefixo /usuarios| C[usuario.routes.ts]
    C -->|chama método| D[usuario.controller.ts]
    D -->|regras de orquestração| E[usuario.service.ts]
    E -->|CRUD/queries| F[usuario.repository.ts]
    F -->|Prisma Client| G[(PostgreSQL)]

    subgraph App
      B
      C
      D
      E
      F
    end

    subgraph Infra
      G
    end