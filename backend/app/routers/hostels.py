from fastapi import APIRouter, HTTPException, Depends
from app.database import hostels_col, students_col
from app.models.schemas import HostelCreate, StudentCreate
from app.utils import oid, serialize, serialize_many
from app.deps import require_admin, CurrentUser

router = APIRouter(prefix="/api/hostels", tags=["hostels"])


@router.get("")
async def list_hostels():
    docs = await hostels_col.find().sort("name", 1).to_list(200)
    return serialize_many(docs)


@router.post("", status_code=201)
async def create_hostel(payload: HostelCreate, current: CurrentUser = Depends(require_admin)):
    existing = await hostels_col.find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=409, detail="Hostel already exists")
    result = await hostels_col.insert_one(payload.model_dump())
    doc = await hostels_col.find_one({"_id": result.inserted_id})
    return serialize(doc)


@router.get("/{hostel_id}/students")
async def list_students(hostel_id: str, current: CurrentUser = Depends(require_admin)):
    """Admin-only: listing every student's profile. (Students never need this
    themselves - they're identified by their own login.)"""
    docs = await students_col.find({"hostelId": oid(hostel_id)}).to_list(1000)
    for d in docs:
        d.pop("passwordHash", None)
    return serialize_many(docs)


@router.post("/{hostel_id}/students", status_code=201)
async def add_student(hostel_id: str, payload: StudentCreate, current: CurrentUser = Depends(require_admin)):
    """Admin-only manual add. Students normally self-serve via /api/auth/student/register."""
    hostel = await hostels_col.find_one({"_id": oid(hostel_id)})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")
    data = payload.model_dump()
    data["hostelId"] = oid(hostel_id)
    existing = await students_col.find_one({"rollNumber": data["rollNumber"]})
    if existing:
        raise HTTPException(status_code=409, detail="Roll number already registered")
    result = await students_col.insert_one(data)
    doc = await students_col.find_one({"_id": result.inserted_id})
    doc.pop("passwordHash", None)
    return serialize(doc)
