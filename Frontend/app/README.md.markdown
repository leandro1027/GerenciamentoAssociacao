# 🏛️ Sistema de Gerenciamento de Associação

Este é um projeto full stack desenvolvido com **React + Next.js** no front-end e **Nest.js + Prisma ORM** no back-end. A aplicação simula o gerenciamento básico de uma associação, permitindo que utilizadores se registem, façam login, se candidatem como voluntários e realizem doações. Um painel administrativo, com acesso simulado, permite a aprovação ou recusa de voluntários.

## 🎯 Objetivos

- Consolidar conhecimentos em desenvolvimento full stack moderno.
- Criar funcionalidades completas de CRUD (Create, Read, Update, Delete).
- Utilizar relacionamentos entre tabelas num banco de dados relacional.
- Simular diferentes perfis de utilizadores (comum e administrador) com um sistema de login.

## 🧩 Funcionalidades

### 👤 Utilizador Comum
- Registo de utilizador com senha.
- Login no sistema.
- Candidatura como voluntário (apenas se estiver logado).
- Simulação de doações via QR Code Pix (apenas se estiver logado).

### 🛠️ Administrador (Acesso Simulado)
- Acesso ao painel administrativo através de uma senha padrão (`admin123`).
- Visualização de todas as candidaturas de voluntariado.
- Aprovação ou recusa de candidaturas pendentes.
- Visualização de todos os membros registados.

## 🧱 Tecnologias Utilizadas

| Camada         | Tecnologias                              |
|----------------|------------------------------------------|
| **Front-end**  | React, Next.js, Axios, Context API       |
| **Back-end**   | Nest.js, TypeScript, Prisma ORM          |
| **Base de Dados** | SQLite (modo de desenvolvimento)         |
| **Estilização**| Tailwind CSS                            |
| **Outros**     | qrcode (para gerar QR Code)             |

## 🗃️ Modelagem de Dados

### Usuario
- `id`: número identificador (PK)
- `nome`: nome do utilizador
- `email`: e-mail (único)
- `senha`: senha do utilizador
- `telefone`: opcional

### Voluntario
- `id`: (PK)
- `usuarioId`: referência ao utilizador (FK, único)
- `motivo`: texto com justificativa
- `status`: pendente, aprovado, recusado

### Doacao
- `id`: (PK)
- `usuarioId`: referência ao utilizador (FK)
- `valor`: valor da doação
- `tipo`: pix
- `data`: data da doação

## 📁 Estrutura do Projeto

```
/backend
├── src/
│   ├── usuario/
│   ├── voluntario/
│   └── doacao/
└── prisma/
    └── schema.prisma

/frontend
├── app/
│   ├── (rotas)/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
├── context/
└── services/
```

## 🚀 Como Executar o Projeto

### 📦 Backend e Frontend 💻

#### Terminal 1: Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

#### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

- A API do back-end rodará em `http://localhost:3000`.
- A aplicação front-end estará acessível em `http://localhost:3001` (ou na porta indicada no terminal).

### 🔑 Acesso ao Painel de Administrador
Para aceder ao painel, navegue até `/painel-admin` e use a senha: `admin123`.