# 🏛️ Sistema de Gerenciamento de Associação

Este é um projeto full stack desenvolvido com **React + Next.js** no front-end e **Nest.js + Prisma ORM** no back-end. A aplicação simula o gerenciamento básico de uma associação, permitindo que usuários se cadastrem, se candidatem como voluntários e realizem doações via QR Code Pix. Um painel administrativo (sem autenticação real) permite a aprovação ou recusa de voluntários.

---

## 🎯 Objetivos

- Consolidar conhecimentos em desenvolvimento full stack moderno
- Criar funcionalidades completas de **CRUD**
- Utilizar relacionamentos entre tabelas no banco de dados
- Simular diferentes perfis de usuários (comum e administrador)

---

## 🧩 Funcionalidades

### 👤 Usuário Comum
- Cadastro de usuário
- Candidatura como voluntário (com justificativa)
- Simulação de doações via QR Code Pix

### 🛠️ Administrador (simulado)
- Acesso ao painel com lista de solicitações de voluntariado
- Aprovação ou recusa de voluntários

---

## 🧱 Tecnologias Utilizadas

| Camada       | Tecnologias                        |
|--------------|------------------------------------|
| Front-end    | React, Next.js, Axios              |
| Back-end     | Nest.js, TypeScript, Prisma ORM    |
| Banco de Dados | SQLite (modo local)               |
| Estilização  | CSS simples                        |
| Outros       | QRCode Generator                   |

---

## 🗃️ Modelagem de Dados

### `Usuario`
- `id`: número identificador
- `nome`: nome do usuário
- `email`: e-mail
- `telefone`: opcional

### `Voluntario`
- `id`
- `usuarioId`: referência ao usuário
- `motivo`: texto com justificativa
- `status`: `pendente`, `aprovado`, `recusado`

### `Doacao`
- `id`
- `usuarioId`: referência ao usuário
- `valor`: valor da doação
- `tipo`: exemplo `pix`
- `data`: data da doação

---

## 📁 Estrutura do Projeto

/backend
├── src/
│   ├── usuario/
│   ├── voluntario/
│   └── doacao/
└── prisma/
    └── schema.prisma

/frontend
├── pages/
│   ├── index.tsx
│   ├── cadastro.tsx
│   ├── voluntario.tsx
│   ├── doacoes.tsx
│   └── painel-admin.tsx
└── components/

## 🚀 Como Executar o Projeto

### 📦 Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev

### 💻 Frontend
cd frontend
npm install
npm run dev
Acesse em http://localhost:3000




