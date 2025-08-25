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
