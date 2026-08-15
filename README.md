# Parallel Coder

Parallel Coder is a real-time collaborative coding workspace. Teams can create workspaces, edit files together, chat, manage member roles, and run supported code in an isolated Docker sandbox.

## Features

- Email/password, Google, and GitHub authentication
- Shared workspaces with owner, admin, editor, and viewer roles
- Live collaborative editing with Yjs and WebSockets
- Workspace chat and online presence
- File explorer and Monaco editor
- One-time invitation codes, valid for seven days
- Sandboxed execution for JavaScript, Python, C, C++, and Java
- PostgreSQL persistence with Prisma

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Zustand, Monaco Editor
- Backend: Node.js, Express, Socket.IO, Yjs
- Database: PostgreSQL and Prisma
- Runtime: Docker Compose, Docker socket proxy, and a restricted runner image

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop (or Docker Engine) for Docker Compose and code execution
- PostgreSQL, unless using the included Docker Compose setup

## Local development

1. Install the root development dependency:

   ```bash
   npm install
   ```

2. Install application dependencies:

   ```bash
   npm install --prefix Backend
   npm install --prefix Frontend
   ```

3. Create `Backend/.env` with your database URL and secrets. At minimum:

   ```env
   DATABASE_URL="postgresql://parallel_coder:parallel_coder@localhost:5433/parallel_coder?schema=public"
   JWT_ACCESS_SECRET=replace_with_a_long_random_value
   JWT_REFRESH_SECRET=replace_with_a_different_long_random_value
   FRONTEND_URL=http://localhost:5173
   ```

4. Start PostgreSQL with Docker Compose, then apply migrations:

   ```bash
   docker compose up -d postgres
   cd Backend
   npx prisma migrate deploy
   cd ..
   ```

5. Start the backend, Yjs server, and frontend together:

   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:5173`. Vite forwards API requests to the backend during development.

## Docker deployment

Docker Compose starts PostgreSQL, migrations, the API/frontend application, the Yjs server, a Docker socket proxy, and the sandbox runner image.

```bash
docker compose up --build
```

The API is available on `http://localhost:3000` by default. Configure ports, database credentials, OAuth settings, and JWT secrets through environment variables before production deployment.

The code runner needs access to Docker through the included socket proxy. Do not remove its network, capability, read-only filesystem, memory, CPU, PID, or user restrictions.

## Invitation codes

1. Open a workspace and select **Members**.
2. Select the role for the recipient and choose **Create code**.
3. Copy the generated code and send it to one person.
4. The recipient signs in, pastes the code into the Dashboard invitation-code field, and selects **Join**.

Codes expire after seven days and can only be redeemed once. Owners and admins can create codes.

## Database migrations

Run migrations whenever pulling changes that alter the Prisma schema:

```bash
cd Backend
npx prisma migrate deploy
```

The invitation-code feature requires the `20260815000000_complete_workspace_invites` migration.

## Testing

Backend tests require PostgreSQL. Runner tests also require Docker to be running and the runner image to be available.

```bash
docker build -f runner.dockerfile -t parallel-coder-runner:latest .
npm test --prefix Backend
npm run build --prefix Frontend
```

## Continuous integration

GitHub Actions runs backend tests against PostgreSQL and builds/lints the frontend. Because the runner tests use Docker, the CI workflow must build the runner image before backend tests:

```yaml
- run: docker build -f runner.dockerfile -t parallel-coder-runner:latest .
  working-directory: .
```

## Project structure

```text
ParallelCoder/
├── Backend/        # Express API, Prisma schema, tests, and Yjs server
├── Frontend/       # React/Vite application
├── docker-compose.yml
├── dockerfile      # API and production frontend image
├── runner.dockerfile
└── .github/        # CI workflow
```

## Contributing

Create a feature branch, make and test your changes, then open a pull request. Do not commit secrets, local `.env` files, or generated database data.
