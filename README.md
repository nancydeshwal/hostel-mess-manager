# Mess Board — Hostel Mess Waste Management & Review Analytics

Built for NIT Kurukshetra's 10 boys' hostels + 3 girls' hostels. Students see the
dynamic daily menu and toggle **"Skipping Next Meal"** if they're eating out;
mess admins get a dashboard of skip patterns, complaint analytics, and a
linear-regression forecast of next week's grocery needs.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS + Chart.js
- **Backend:** Python **FastAPI** + MongoDB (via Motor, async driver)
- **AI/Advanced feature:** scikit-learn `LinearRegression` fitted on 21 days of
  attendance (hostel strength − meal skips) to project the next 7 days, then
  multiplied by each menu's key-ingredient usage rate to forecast grocery
  quantities — no separate microservice needed, it's a route inside the same
  FastAPI app (`/api/analytics/predict-grocery`).

## Project layout

```
hostel-mess-manager/
├── backend/                  FastAPI app
│   ├── app/
│   │   ├── main.py           app entrypoint, CORS, router registration
│   │   ├── config.py         env-based settings
│   │   ├── database.py       Motor client + collections + indexes
│   │   ├── utils.py          ObjectId helpers / serializers
│   │   ├── models/schemas.py Pydantic request/response models
│   │   └── routers/
│   │       ├── hostels.py    hostel + student CRUD
│   │       ├── menu.py       daily dynamic menu (upsert per hostel/date/meal)
│   │       ├── skips.py      "skipping next meal" toggle
│   │       ├── complaints.py review/complaint CRUD + status workflow
│   │       └── analytics.py  skip-summary, complaint-summary, grocery predictor
│   ├── seed.py                populates demo hostels/students/menus/history
│   ├── requirements.txt
│   └── .env.example
└── frontend/                 React + Vite app
    ├── src/
    │   ├── App.jsx            nav + routing (Student / Admin)
    │   ├── api.js              fetch client for the FastAPI backend
    │   └── components/
    │       ├── StudentView.jsx        today's menu + skip toggles + feedback form
    │       ├── AdminDashboard.jsx     charts + forecast + complaints inbox
    │       ├── MealCard.jsx
    │       ├── ComplaintForm.jsx
    │       ├── ComplaintsList.jsx
    │       ├── SkipTrendChart.jsx     Chart.js line chart
    │       ├── ComplaintCategoryChart.jsx  Chart.js bar chart
    │       ├── GroceryForecastPanel.jsx
    │       ├── HostelSelect.jsx
    │       └── StudentSelect.jsx
    └── ...vite/tailwind config
```

## Running it locally

### 1. MongoDB

You need a MongoDB instance reachable at the URI in `backend/.env`. Easiest
options:

```bash
# via Docker
docker run -d -p 27017:27017 --name mess-mongo mongo:7

# or install MongoDB Community Server locally and run `mongod`
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                # adjust MONGO_URI if needed

# populate demo data (10 boys + 3 girls hostels, one fully seeded with
# ~21 days of realistic skip/complaint history)
python seed.py

uvicorn app.main:app --reload --port 8000
```

API docs (Swagger UI) will be live at `http://localhost:8000/docs`.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. It talks to the API at `http://localhost:8000`
by default — override with a `VITE_API_URL` env var if you deploy the backend
elsewhere.

## Core flows

- **Student view (`/`):** pick your hostel and yourself (stand-in for login),
  see the day's published menu per meal, and toggle "Skipping this meal" if
  you're eating out. Skips are upserted per student/date/meal, so toggling is
  idempotent. A short feedback form lets you rate and comment on any meal.
- **Admin dashboard (`/admin`):** a 14-day Chart.js line chart of skip counts
  per meal type, a 30-day complaint-category bar chart, an average-rating /
  open-complaints summary, a complaints inbox with a 3-stage status workflow
  (open → in review → resolved), and the **grocery forecast panel** — pick a
  meal type and it regresses the last 21 days of attendance, projects 7 days
  forward, and multiplies by each ingredient's per-100-student usage rate
  (defined per menu entry) to tell the mess how much rice, dal, paneer, etc.
  to buy for the coming week.

## Extending it

- `Menu.keyIngredients` is where you encode a dish's per-100-student usage
  rate (e.g. rice: 8 kg / 100 students) — add more entries per menu to widen
  the grocery forecast.
- Swap `LinearRegression` for a more sophisticated model (e.g. a small
  seasonal model or gradient boosting) in `analytics.py` without touching any
  other layer — the route contract stays the same.
- Authentication is stubbed out (students/admins are picked from dropdowns).
  Wire up real login (JWT or NIT SSO) by adding an auth dependency to the
  FastAPI routers.
