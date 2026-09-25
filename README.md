# Parallel Coder

[![Live Demo](https://img.shields.io/badge/Live%20Demo-parallelcoder.onrender.com-brightgreen?style=for-the-badge&logo=render)](https://parallelcoder.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Sandbox-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**Parallel Coder** is a production-grade, real-time collaborative coding workspace. Teams can create shared workspaces, edit files simultaneously with real-time cursor presence, chat, manage member permissions, and execute code in an isolated Docker sandbox.

**Live Application**: [https://parallelcoder.onrender.com](https://parallelcoder.onrender.com/)

---

## Key Features

- **Live Demo Available**: Try out the full application live on Render at [parallelcoder.onrender.com](https://parallelcoder.onrender.com/).
- **Authentication**: Secure Email/Password, Google OAuth, and GitHub OAuth support.
- **Live Collaboration**: Concurrent multi-user code editing powered by **Yjs** and **WebSockets** with active cursor and presence tracking.
- **Monaco Editor & File Explorer**: Rich IDE experience built with VS Code's Monaco Editor supporting multi-language syntax highlighting.
- **Isolated Code Sandbox**: Multi-language code execution engine supporting **JavaScript, Python, C, C++, and Java** inside restricted Docker containers with rate limiting and execution limits.
- **Workspace Chat & Presence**: Real-time channel chat backed by **PostgreSQL persistence** and active status indicators.
- **Role-Based Access Control (RBAC)**: Fine-grained workspace permissions for **Owner**, **Admin**, **Editor**, and **Viewer** roles.
- **Single-Use Invitation Codes**: Secure invitation code generator with custom roles and a 7-day expiration window.
- **Hardened Production Architecture**: WebSocket origin validation, 512KB payload limits, non-root Docker containers, fail-fast production secret checks, and dedicated `/health` endpoints.

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Zustand, Monaco Editor (`@monaco-editor/react`), Lucide Icons, Framer Motion |
| **Backend** | Node.js, Express 5, Socket.IO, Yjs (`y-websocket`, `y-leveldb`), Zod, Pino Logging, Passport.js |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Execution Engine** | Docker Engine, Docker Socket Proxy, Restricted Non-Root Runner Containers |
| **Deployment & Ops** | Render, Docker Compose |

---

## Live Demo

Experience **Parallel Coder** in action without any local setup:

**[https://parallelcoder.onrender.com](https://parallelcoder.onrender.com/)**

1. Create a free account or sign in with Google / GitHub.
2. Create a new workspace or join an existing workspace with an invitation code.
3. Open files in the Monaco editor, invite collaborators, and run code directly in the cloud sandbox!

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Docker Desktop / Docker Engine**: Required for containerized code execution sandbox
- **PostgreSQL**: Local database instance (or use the provided Docker Compose configuration)

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/BhaskarKr777/ParallelCoder.git
cd ParallelCoder

# Install root development dependencies
npm install

# Install workspace dependencies
npm install --prefix Backend
npm install --prefix Frontend
```

### 2. Environment Configuration

Create a `.env` file inside the `Backend/` directory:

```env
# Database Connection
DATABASE_URL="postgresql://parallel_coder:parallel_coder@localhost:5433/parallel_coder?schema=public"

# Authentication & JWT Secrets
JWT_ACCESS_SECRET=replace_with_a_long_random_secret_key
JWT_REFRESH_SECRET=replace_with_another_different_long_secret_key

# Frontend Integration
FRONTEND_URL=http://localhost:5173

# Optional OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Database Migration & Docker Setup

Start the local PostgreSQL container and run Prisma migrations:

```bash
# Start PostgreSQL via Docker Compose
docker compose up -d postgres

# Apply Prisma database migrations
cd Backend
npx prisma migrate deploy
cd ..
```

### 4. Run Development Servers

Start the backend API, Yjs WebSocket server, and Vite frontend concurrently:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST API & WebSockets**: `http://localhost:3000`
- **Health Check Endpoint**: `http://localhost:3000/health`

---

## Docker Deployment & Production

To launch the full production-hardened environment including PostgreSQL, migration runner, API server, Yjs server, Docker socket proxy, and the runner sandbox:

```bash
# Build and launch all services in detached mode
docker compose up --build -d
```

For detailed guides on **Horizontal Scaling (Redis Adapter)**, **Automated PostgreSQL S3 Backups**, **Prometheus & Grafana Monitoring**, and **Disaster Recovery**, see **[PRODUCTION_OPERATIONS.md](PRODUCTION_OPERATIONS.md)**.

---

## Workspace Invitations

1. Navigate to a workspace and click on **Members**.
2. Select the role for the invited user (**Admin**, **Editor**, or **Viewer**) and click **Create code**.
3. Share the generated code with your team member.
4. The recipient enters the code in the Dashboard **Invitation Code** field and clicks **Join**.

*Invitation codes expire automatically after 7 days and are single-use only.*

---

## Testing & Code Quality

```bash
# Build the code execution sandbox runner image
docker build -f runner.dockerfile -t parallel-coder-runner:1.0.0 .

# Run Backend unit & integration tests (Vitest)
npm test --prefix Backend

# Run Frontend linter
npm run lint --prefix Frontend

# Build production Frontend bundle
npm run build --prefix Frontend
```

---

## Project Structure

```text
ParallelCoder/
├── Backend/                 # Express REST API, Prisma schema, Socket.IO, Yjs server, and tests
├── Frontend/                # React 19, Vite, Tailwind CSS v4, Monaco Editor app
├── PRODUCTION_OPERATIONS.md # Production scaling, backups, and disaster recovery guide
├── docker-compose.yml       # Production multi-container composition
├── dockerfile               # Hardened non-root application container build
├── runner.dockerfile        # Isolated code execution sandbox container image
├── package.json             # Root monorepo build and development scripts
└── README.md                # Project documentation
```

---

## License

This project is developed under the **MIT License**. Created by [Bhaskar Kumar](https://github.com/BhaskarKr777).
