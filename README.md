# Task Manager

A full-stack task management app: create, edit, delete, and track tasks, with
authentication, search, filtering, and pagination.

- **Frontend:** React (Vite)
- **Backend:** Node.js / Express REST API
- **Database:** MySQL
- **Auth:** JWT (JSON Web Tokens)

## Features

- User registration and login (JWT-based auth; every task is scoped to its owner)
- Create, view, edit, and delete tasks
- Mark a task Pending / Completed with one click
- Filter tasks by status and priority
- Full-text search across title and description
- Pagination
- Server-side input validation with field-level error messages
- Automated tests (Jest + Supertest) covering auth and task endpoints
- Interactive API documentation (Swagger UI)
- Dockerized for one-command deployment

## Project structure

```
task-manager/
├── backend/           Express REST API
│   ├── db/            schema.sql, migrate.js, seed.js
│   ├── src/
│   │   ├── config/    MySQL pool, Swagger config
│   │   ├── middleware/auth, validation, error handling
│   │   ├── models/    data access (users, tasks)
│   │   ├── controllers/
│   │   ├── routes/    route definitions + OpenAPI annotations
│   │   ├── app.js
│   │   └── server.js
│   └── tests/         Jest + Supertest
├── frontend/          React (Vite) SPA
│   └── src/
│       ├── api/       fetch client
│       ├── context/   auth state
│       ├── components/
│       ├── pages/     Login, Register, Tasks
│       └── styles/
└── docker-compose.yml
```

## Data model

Each task has: `id`, `title`, `description`, `status` (`Pending` | `Completed`),
`priority` (`Low` | `Medium` | `High`), `createdAt`, `updatedAt`, and belongs to
a `user`.

## API

| Method | Endpoint         | Purpose                                  |
|--------|------------------|-------------------------------------------|
| POST   | `/api/auth/register` | Create an account                    |
| POST   | `/api/auth/login`    | Log in, receive a JWT                |
| GET    | `/api/auth/me`        | Get the current user                 |
| GET    | `/api/tasks`          | List tasks (filter, search, paginate) |
| GET    | `/api/tasks/:id`      | Get one task                         |
| POST   | `/api/tasks`          | Create a task                        |
| PUT    | `/api/tasks/:id`      | Update a task                        |
| DELETE | `/api/tasks/:id`      | Delete a task                        |

All `/api/tasks` routes require `Authorization: Bearer <token>`.

`GET /api/tasks` accepts query params: `status`, `priority`, `search`, `page`,
`limit`.

Full interactive documentation (Swagger UI) is served at **`/api-docs`** once
the backend is running, e.g. http://localhost:4000/api-docs.

## Running locally (without Docker)

### Prerequisites
- Node.js 18+
- A running MySQL (or MariaDB) server

### Backend

```bash
cd backend
cp .env.example .env      # edit DB credentials / JWT_SECRET as needed
npm install
npm run migrate           # creates tables in the database named in .env
npm run seed               # optional: adds a demo user + sample tasks
npm run dev                 # starts the API on http://localhost:4000
```

Demo login after seeding: `demo@example.com` / `Password123!`

### Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:4000/api
npm install
npm run dev                 # starts the app on http://localhost:5173
```

## Running with Docker Compose

This brings up MySQL, the backend, and the frontend (served by nginx) together:

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000
- API docs: http://localhost:4000/api-docs

Set a real `JWT_SECRET` for anything beyond local testing:

```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

The database schema is applied automatically on first boot via
`backend/db/schema.sql`. To seed demo data into the containerized database:

```bash
docker compose exec backend npm run seed
```

## Tests

The backend test suite exercises the full HTTP layer against a real MySQL
database (registration, login, CRUD, filtering, search, pagination, and
that users can't see each other's tasks).

```bash
cd backend
# uses DB_TEST_NAME from .env — create/migrate that database first:
NODE_ENV=test npm run migrate
npm test
```

## Notes on design choices

- **Auth:** stateless JWTs rather than sessions, so the API can scale
  horizontally without shared session storage.
- **Ownership:** every task query is scoped by `user_id` at the SQL level,
  not just filtered in application code, so one user can never read or
  modify another user's tasks even if they guess an ID.
- **Search:** implemented as a `LIKE` match on title/description for
  simplicity and portability; the schema also includes a `FULLTEXT` index
  if you want to switch to `MATCH ... AGAINST` for larger datasets.
- **Validation:** enforced server-side with `express-validator`, returning
  field-level errors the frontend surfaces next to the relevant input.
