# Task Manager

A full-stack task management application with authentication, search, filtering, and pagination.

**Live Demo:** https://task-manager-1-iasf.onrender.com

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js, Express |
| Database | MySQL (hosted on Aiven) |
| Authentication | JWT, bcrypt |
| Validation | express-validator |
| API Documentation | Swagger / OpenAPI |
| Testing | Jest, Supertest |
| Deployment | Docker, Render (app), Aiven (database) |

## Features

- User registration and login (JWT-based; every task is scoped to its owner)
- Create, view, edit, and delete tasks
- Mark a task Pending / Completed
- Filter tasks by status and priority
- Search tasks by title and description
- Pagination
- Server-side input validation with field-level error messages

## How to Install and Run the Project

### Prerequisites
- Node.js 18+
- A MySQL database (local install, or a free managed instance — see [Database Setup](#how-to-set-up-the-database))

### Backend

```bash
cd backend
cp .env.example .env      # fill in your database credentials and a JWT secret
npm install
npm run migrate           # creates the users and tasks tables
npm run dev                 # runs on http://localhost:4000
```

Interactive API docs are available at `http://localhost:4000/api-docs` once the server is running.

### Frontend

```bash
cd frontend
cp .env.example .env      # set VITE_API_URL to your backend's URL + /api
npm install
npm run dev                 # runs on http://localhost:5173
```

### Running Everything with Docker Compose

```bash
docker compose up --build
```

This starts MySQL, the backend, and the frontend together. Visit `http://localhost:8080`.

### Running the Tests

```bash
cd backend
NODE_ENV=test npm run migrate
npm test
```

## How to Set Up the Database

The schema (`backend/db/schema.sql`) defines two tables: `users` and `tasks`, with a foreign key linking each task to its owner.

**Option 1 — Local MySQL:**
```bash
mysql -u root -p < backend/db/schema.sql
```

**Option 2 — Managed MySQL (e.g. Aiven, free tier):**
1. Create a MySQL service and note the host, port, user, and password it gives you.
2. Run the `CREATE TABLE` statements from `backend/db/schema.sql` against it (a managed provider's console or the `mysql` CLI both work).
3. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_SSL=true` in the backend's environment.

The optional `npm run seed` command adds a demo account (`demo@example.com` / `Password123!`) and sample tasks.

## Technical Decisions

- **Stateless JWT authentication** instead of sessions, so the API can scale without shared session storage.
- **Ownership enforced at the SQL level** — every task query is filtered by `user_id` in the database, not just in application logic, so one user can never read or modify another user's tasks.
- **Search** is implemented with a `LIKE` match on title/description for simplicity; the schema also includes a `FULLTEXT` index for scaling to `MATCH ... AGAINST` later.
- **Validation** is enforced server-side with `express-validator`, returning field-level errors the frontend displays next to the relevant input.
- **Deployment** separates concerns across three free-tier services: a static site (frontend), a web service (backend API), and a managed database (Aiven) — mirroring a realistic production setup rather than a single monolithic host.
