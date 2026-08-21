from datetime import datetime, date as date_type
from fastapi import APIRouter, Query, Depends, HTTPException
from app.database import skips_col
from app.models.schemas import SkipToggle
from app.utils import oid, serialize, serialize_many
from app.deps import require_student, CurrentUser

router = APIRouter(prefix="/api/skips", tags=["skips"])


def _to_datetime(d: date_type) -> datetime:
    return datetime(d.year, d.month, d.day)


@router.post("", status_code=200)
async def toggle_skip(payload: SkipToggle, current: CurrentUser = Depends(require_student)):
    """Idempotent upsert - lets a logged-in student flip 'Skipping Next Meal' on/off
    for themselves only (studentId in the body must match the logged-in student)."""
    if payload.studentId != current.id:
        raise HTTPException(status_code=403, detail="You can only toggle your own meal skips")

    data = payload.model_dump()
    data["studentId"] = oid(payload.studentId)
    data["hostelId"] = oid(payload.hostelId)
    data["date"] = _to_datetime(payload.date)

    result = await skips_col.find_one_and_update(
        {"studentId": data["studentId"], "date": data["date"], "mealType": data["mealType"]},
        {"$set": {"skipped": data["skipped"], "hostelId": data["hostelId"]}},
        upsert=True,
        return_document=True,
    )
    return serialize(result)


@router.get("")
async def get_skip_status(studentId: str, date: date_type, mealType: str):
    doc = await skips_col.find_one(
        {"studentId": oid(studentId), "date": _to_datetime(date), "mealType": mealType}
    )
    if not doc:
        return {"skipped": False}
    return serialize(doc)


@router.get("/by-hostel")
async def skips_by_hostel(hostelId: str, date: date_type):
    docs = await skips_col.find(
        {"hostelId": oid(hostelId), "date": _to_datetime(date), "skipped": True}
    ).to_list(2000)
    return serialize_many(docs)
