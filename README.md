# Snti Hostel Mess Portal

Full-stack web app: **React + FastAPI + PostgreSQL**

---

## Project Structure

```
snti-hostel/
├── backend/               ← FastAPI (Python)
│   ├── app/
│   │   ├── core/          ← config, database, security, auth deps
│   │   ├── models/        ← SQLAlchemy database tables
│   │   ├── routers/       ← API route handlers
│   │   ├── schemas/       ← Pydantic request/response shapes
│   │   └── main.py        ← app entry point
│   ├── seed_admin.py      ← run once to create admin account
│   ├── requirements.txt
│   └── .env.example
├── frontend/              ← React (Vite)
│   ├── src/
│   │   ├── api/           ← all API calls in one place
│   │   ├── context/       ← global auth state
│   │   ├── pages/         ← one file per screen
│   │   ├── components/    ← reusable UI pieces
│   │   ├── App.jsx        ← routes
│   │   └── main.jsx       ← entry point
│   └── package.json
└── render.yaml            ← one-click Render.com deploy
```

---

## Run Locally (Step by Step)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

---

### 1. Clone / download the project

```bash
cd snti-hostel
```

---

### 2. Set up the backend

```bash
cd backend

# Create a virtual environment (keeps packages isolated)
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Create your `.env` file:**

```bash
cp .env.example .env
```

Open `.env` and fill in your PostgreSQL details:

```
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/snti_hostel
SECRET_KEY=any-long-random-string-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

**Create the database in PostgreSQL:**

```sql
-- In psql or pgAdmin:
CREATE DATABASE snti_hostel;
```

**Start the backend:**

```bash
uvicorn app.main:app --reload
```

The API is now running at http://localhost:8000
Visit http://localhost:8000/docs to see all endpoints (interactive!)

**Create the admin account (run once):**

```bash
python seed_admin.py
```

This creates:
- Email: `admin@snti.in`
- Password: `Admin@1234`

---

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend is now running at http://localhost:5173

---

### 4. Open the app

Go to http://localhost:5173

- **Admin login:** `admin@snti.in` / `Admin@1234`
- **Trainee:** register at `/register` first

---

## API Endpoints Summary

| Method | Path | Who | What |
|--------|------|-----|------|
| POST | `/api/auth/register` | Public | Register new trainee |
| POST | `/api/auth/login` | Public | Login, get JWT token |
| GET  | `/api/auth/me` | Any logged in | Get my profile |
| GET  | `/api/menu/options` | Any | Get all dish options |
| GET  | `/api/menu/my` | Trainee | Get my saved menu |
| POST | `/api/menu/save` | Trainee | Save/update my menu |
| POST | `/api/menu/feedback` | Trainee | Submit feedback |
| GET  | `/api/admin/users` | Admin | List all trainees |
| GET  | `/api/admin/feedback` | Admin | List all feedback |
| GET  | `/api/admin/export` | Admin | Download Excel file |
| DELETE | `/api/admin/users/expired` | Admin | Remove expired accounts |
| POST | `/api/menu/options` | Admin | Add a dish option |
| DELETE | `/api/menu/options/{id}` | Admin | Remove a dish option |

---

## Deploy to Render.com (Free)

1. Push this project to a GitHub repository
2. Go to https://render.com → New → Blueprint
3. Connect your GitHub repo
4. Render reads `render.yaml` and creates everything automatically:
   - PostgreSQL database (free)
   - FastAPI backend
   - React frontend (static)
5. After deploy, run the seed script from Render's shell tab:
   ```
   python seed_admin.py
   ```
6. Update `FRONTEND_URL` in Render environment variables to your frontend URL

---

## How Authentication Works

```
User enters email + password
       ↓
POST /api/auth/login
       ↓
FastAPI verifies password with bcrypt
       ↓
Returns a JWT token (valid 24 hours)
       ↓
React stores token in localStorage
       ↓
Every future API request adds:
  Authorization: Bearer <token>
       ↓
FastAPI verifies token on protected routes
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast, component-based, huge ecosystem |
| Routing | React Router v6 | Clean URL-based navigation |
| HTTP client | Axios | Cleaner than fetch(), auto auth headers |
| Charts | Recharts | Simple React-native charts |
| Backend | FastAPI (Python) | Fast, auto docs, easy to learn |
| Auth | JWT + bcrypt | Industry standard, stateless |
| Database | PostgreSQL | Reliable, free, structured data |
| ORM | SQLAlchemy 2.0 | Write Python, not SQL |
| Deploy | Render.com | Free tier, GitHub integration |
