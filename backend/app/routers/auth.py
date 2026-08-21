from fastapi import APIRouter, HTTPException, Depends, status

from app.database import students_col, admins_col, hostels_col
from app.models.schemas import StudentRegister, StudentLogin, AdminLogin, TokenOut
from app.security import hash_password, verify_password, create_access_token
from app.deps import get_current_user, CurrentUser
from app.utils import oid, serialize

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/student/register", response_model=TokenOut, status_code=201)
async def register_student(payload: StudentRegister):
    """Self-serve sign-up: a student picks their hostel, roll number, and a password."""
    hostel = await hostels_col.find_one({"_id": oid(payload.hostelId)})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")

    existing = await students_col.find_one({"rollNumber": payload.rollNumber})
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This roll number is already registered. Try logging in instead.",
        )

    doc = {
        "name": payload.name,
        "rollNumber": payload.rollNumber,
        "hostelId": oid(payload.hostelId),
        "roomNumber": payload.roomNumber,
        "passwordHash": hash_password(payload.password),
    }
    result = await students_col.insert_one(doc)
    student_id = str(result.inserted_id)

    token = create_access_token(
        subject=student_id,
        role="student",
        extra_claims={
            "hostelId": payload.hostelId,
            "name": payload.name,
            "rollNumber": payload.rollNumber,
        },
    )
    return TokenOut(
        accessToken=token, role="student", id=student_id, name=payload.name, hostelId=payload.hostelId
    )


@router.post("/student/login", response_model=TokenOut)
async def login_student(payload: StudentLogin):
    student = await students_col.find_one({"rollNumber": payload.rollNumber})
    if not student or not student.get("passwordHash"):
        raise HTTPException(status_code=401, detail="Invalid student ID or password")
    if not verify_password(payload.password, student["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid student ID or password")

    student_id = str(student["_id"])
    hostel_id = str(student["hostelId"])
    token = create_access_token(
        subject=student_id,
        role="student",
        extra_claims={"hostelId": hostel_id, "name": student["name"], "rollNumber": student["rollNumber"]},
    )
    return TokenOut(accessToken=token, role="student", id=student_id, name=student["name"], hostelId=hostel_id)


@router.post("/admin/login", response_model=TokenOut)
async def login_admin(payload: AdminLogin):
    admin = await admins_col.find_one({"username": payload.username})
    if not admin or not verify_password(payload.password, admin["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    admin_id = str(admin["_id"])
    token = create_access_token(
        subject=admin_id, role="admin", extra_claims={"username": admin["username"], "name": admin.get("name")}
    )
    return TokenOut(accessToken=token, role="admin", id=admin_id, name=admin.get("name"))


@router.get("/me")
async def read_current_user(current: CurrentUser = Depends(get_current_user)):
    if current.role == "student":
        student = await students_col.find_one({"_id": oid(current.id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        student.pop("passwordHash", None)
        return {"role": "student", **serialize(student)}

    admin = await admins_col.find_one({"_id": oid(current.id)})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    admin.pop("passwordHash", None)
    return {"role": "admin", **serialize(admin)}
