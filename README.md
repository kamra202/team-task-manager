# Team Task Manager

A production-oriented full-stack **team task manager**: React + Vite + Tailwind on the frontend, Flask + SQLAlchemy + JWT on the backend, with **SQLite by default** and straightforward paths to **PostgreSQL** or **MySQL**.

##  Deployment Links
Backend (Railway): https://team-task-manager-production-0799.up.railway.app/
Frontend (Vercel): https://team-task-manager-seven-mu.vercel.app/

## Overview

Team Task Manager helps small teams organize work into **projects** and **tasks**. **Admins** create projects, create tasks, assign them to members, and manage the full lifecycle. **Members** see only projects where they have assigned tasks and may **update the status of their own tasks** (Todo → In Progress → Done). The dashboard summarizes counts and shows **recent tasks** with optional charts.

## Features

- **Authentication**: signup, login, JWT stored in `localStorage`, logout, `/me` bootstrap
- **Roles**: `admin` and `member` with enforced API rules
- **Projects**: CRUD (admin); members see projects they participate in via assignments
- **Tasks**: create/assign/due dates/status (admin); list and status updates scoped by role; overdue highlighting
- **Dashboard**: totals, todo/in progress/completed/overdue by status, recent tasks, pie + bar charts (Recharts)
- **UI**: responsive layout with sidebar, navbar, cards, tables, badges, toasts, loading states

## Tech Stack

| Layer    | Technologies |
|----------|----------------|
| Frontend | React 18, React Router, Axios, Tailwind CSS, Vite, react-hot-toast, Recharts |
| Backend  | Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, bcrypt, gunicorn |
| Database | SQLite (default); PostgreSQL/MySQL via `DATABASE_URL` |

## Project Structure

```text
Team-task-manager/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt          # Local / minimal install
│   ├── requirements.deploy.txt   # Adds Postgres + MySQL drivers for production
│   ├── Procfile
│   ├── runtime.txt
│   ├── seed.py
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.js (App.jsx)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
├── .env.example (see backend/.env.example and frontend/.env.example)
└── README.md
```

## Installation (Local)

### Prerequisites

- Python 3.11+ recommended (3.12/3.14 also work with the pinned versions)
- Node.js 18+

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows — or cp on Unix; then edit secrets
python app.py             # http://127.0.0.1:5000
```

Optional sample data (run once with the API stopped or from another shell after DB exists):

```bash
python seed.py
```
Admin Credentials:
Email: kashish23@gmail.com
Password: kashish123

Demo logins after seeding:
Admin Credentials:
Email: kashish23@gmail.com
Password: kashish123

> **Note:** The **first registered user** on an empty database becomes **admin**; subsequent signups are **members** (simple bootstrap for demos).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. In development, Vite proxies `/api` to `http://127.0.0.1:5000`, so the browser calls same-origin `/api/...` and avoids CORS friction.

### Production-like frontend against a remote API

Create `frontend/.env.local`:

```env
VITE_API_URL=https://team-task-manager-production-0799.up.railway.app/
```

Then `npm run build` — the built app will call that base URL.

## API Endpoints

Base URL: your deployed API root (no `/api` prefix on the server).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | No | Register; returns JWT + user |
| POST | `/login` | No | Login; returns JWT + user |
| GET | `/me` | Yes | Current user profile |
| GET | `/stats` | Yes | Dashboard aggregates + recent tasks |
| GET | `/projects` | Yes | List projects (scoped by role) |
| POST | `/projects` | Admin | Create project |
| PUT | `/projects/<id>` | Admin | Update project |
| DELETE | `/projects/<id>` | Admin | Delete project (cascades tasks) |
| GET | `/tasks` | Yes | Query `?project_id=` optional; scoped by role |
| POST | `/tasks` | Admin | Create task (requires `project_id`, `assigned_to`) |
| PUT | `/tasks/<id>` | Yes | Admin: full update; Member: **status only** on own tasks |
| DELETE | `/tasks/<id>` | Admin | Delete task |
| GET | `/users` | Admin | List users (for assignment UI) |

Responses are JSON envelopes: `{ "data": ... }` or `{ "error": "message" }` with appropriate HTTP status codes.

## Environment Variables

### Backend (`backend/.env` or host dashboard)

| Variable | Description |
|----------|-------------|
| `FLASK_ENV` | `development` (default) or `production` |
| `SECRET_KEY` | Flask secret |
| `JWT_SECRET_KEY` | JWT signing secret (defaults to `SECRET_KEY` if unset) |
| `JWT_ACCESS_HOURS` | Access token lifetime in hours (default `24`) |
| `DATABASE_URL` | SQLAlchemy URL (see below) |
| `CORS_ORIGINS` | Comma-separated origins, e.g. `https://app.vercel.app,http://localhost:5173` |
| `PORT` | Listen port (Railway sets this automatically) |

**Database URL examples**

- SQLite: `sqlite:///team_task_manager.db` (file in cwd) or `sqlite:////absolute/path.db`
- PostgreSQL: `postgresql://user:pass@host:5432/dbname` (Railway often injects this; if you see `postgres://`, the app normalizes it)
- MySQL: `mysql+pymysql://user:pass@host:3306/dbname` — install drivers: `pip install PyMySQL` (included in `requirements.deploy.txt`)

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full backend origin (no trailing slash). Required for static hosting when not using the Vite dev proxy. |


### Backend (Railway)

1. Create a new Railway service from this repo; set **root directory** to `backend`.
2. **Build / start**: install `requirements.deploy.txt` for Postgres/MySQL support, e.g. set install command to:
   - `pip install -r requirements.deploy.txt`
3. Set environment variables (`SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS`, `FLASK_ENV=production`).
4. **Start command** (Procfile already): `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Provision a **PostgreSQL** plugin on Railway and point `DATABASE_URL` at it if you do not want SQLite.

### Frontend (Vercel)

1. Import the repo; set **root directory** to `frontend`.
2. Framework preset: **Vite**.
3. Add build env `VITE_API_URL` to your Railway API URL.
4. `vercel.json` includes SPA rewrites so client-side routes work.

You can also host the static `frontend/dist` on Railway as a static site or any CDN.

## Screenshots

_Add screenshots of Login, Dashboard, Projects, and Tasks here after you run the app (e.g. drag images into your GitHub README)._

Suggested captures:

1. Login page  
2. Dashboard with stat cards and charts  
3. Projects grid with modal  
4. Tasks table with overdue row styling  

## Development Notes

- **CORS**: In production, set `CORS_ORIGINS` to your real frontend origin(s). Avoid `*` with credentialed requests; this app uses JWT in `Authorization` headers (simple origins list works well).
- **Security**: Change all secrets before deploying; never commit `.env`.
- **Charts bundle size**: Recharts increases the JS bundle; the build may warn about chunk size — acceptable for this template, or split with `import()` later.

## License

MIT (or your preferred license — update this section for your organization).
