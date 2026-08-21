from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import ensure_indexes
from app.routers import hostels, menu, skips, complaints, analytics, auth

settings = get_settings()

app = FastAPI(
    title="NIT Kurukshetra Hostel Mess Waste Management API",
    description="Menu tracking, meal-skip toggles, complaint analytics, and grocery demand prediction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hostels.router)
app.include_router(menu.router)
app.include_router(skips.router)
app.include_router(complaints.router)
app.include_router(analytics.router)
app.include_router(auth.router)


@app.on_event("startup")
async def on_startup():
    await ensure_indexes()


@app.get("/api/health")
async def health():
    return {"status": "ok"}
