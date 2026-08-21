from datetime import datetime, date as date_type
from fastapi import APIRouter, Query, Depends, HTTPException
from app.database import complaints_col
from app.models.schemas import ComplaintCreate, ComplaintStatusUpdate
from app.utils import oid, serialize, serialize_many
from app.deps import require_student, require_admin, CurrentUser

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


def _to_datetime(d: date_type) -> datetime:
    return datetime(d.year, d.month, d.day)


@router.post("", status_code=201)
async def create_complaint(payload: ComplaintCreate, current: CurrentUser = Depends(require_student)):
    if payload.studentId != current.id:
        raise HTTPException(status_code=403, detail="You can only submit feedback as yourself")

    data = payload.model_dump()
    data["studentId"] = oid(payload.studentId)
    data["hostelId"] = oid(payload.hostelId)
    data["date"] = _to_datetime(payload.date)
    data["status"] = "open"
    result = await complaints_col.insert_one(data)
    doc = await complaints_col.find_one({"_id": result.inserted_id})
    return serialize(doc)


@router.get("")
async def list_complaints(
    hostelId: str | None = None,
    status: str | None = None,
    mealType: str | None = None,
):
    query = {}
    if hostelId:
        query["hostelId"] = oid(hostelId)
    if status:
        query["status"] = status
    if mealType:
        query["mealType"] = mealType
    docs = await complaints_col.find(query).sort("date", -1).to_list(500)
    return serialize_many(docs)


@router.patch("/{complaint_id}/status")
async def update_status(
    complaint_id: str, payload: ComplaintStatusUpdate, current: CurrentUser = Depends(require_admin)
):
    result = await complaints_col.find_one_and_update(
        {"_id": oid(complaint_id)},
        {"$set": {"status": payload.status}},
        return_document=True,
    )
    return serialize(result)
