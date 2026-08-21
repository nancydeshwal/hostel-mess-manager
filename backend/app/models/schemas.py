from datetime import datetime, date as date_type
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

MealType = Literal["breakfast", "lunch", "snacks", "dinner"]


# ---------- Hostel ----------
class HostelCreate(BaseModel):
    name: str
    type: Literal["boys", "girls"]
    totalStrength: int = 0


class HostelOut(HostelCreate):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")


# ---------- Student ----------
class StudentCreate(BaseModel):
    name: str
    rollNumber: str
    hostelId: str
    roomNumber: Optional[str] = None


class StudentOut(StudentCreate):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")


# ---------- Menu ----------
class KeyIngredient(BaseModel):
    name: str
    unitPerHundredStudents: float
    unit: str = "kg"


class MenuCreate(BaseModel):
    hostelId: str
    date: date_type
    mealType: MealType
    items: list[str]
    keyIngredients: list[KeyIngredient] = []


class MenuOut(MenuCreate):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")


# ---------- Meal Skip ----------
class SkipToggle(BaseModel):
    studentId: str
    hostelId: str
    date: date_type
    mealType: MealType
    skipped: bool = True


class SkipOut(SkipToggle):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")


# ---------- Complaint ----------
class ComplaintCreate(BaseModel):
    studentId: str
    hostelId: str
    date: date_type
    mealType: MealType
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = ""
    category: Literal["quality", "quantity", "hygiene", "taste", "service", "other"] = "other"


class ComplaintOut(ComplaintCreate):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")
    status: Literal["open", "in_review", "resolved"] = "open"


class ComplaintStatusUpdate(BaseModel):
    status: Literal["open", "in_review", "resolved"]


# ---------- Auth ----------
class StudentRegister(BaseModel):
    name: str
    rollNumber: str
    password: str = Field(min_length=6)
    hostelId: str
    roomNumber: Optional[str] = None


class StudentLogin(BaseModel):
    rollNumber: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    role: Literal["student", "admin"]
    id: str
    name: Optional[str] = None
    hostelId: Optional[str] = None
