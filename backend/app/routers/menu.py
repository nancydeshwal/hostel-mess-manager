from datetime import datetime, date as date_type
from fastapi import APIRouter, HTTPException, Query, Depends
from pymongo.errors import DuplicateKeyError
from app.database import menu_col
from app.models.schemas import MenuCreate
from app.utils import oid, serialize, serialize_many
from app.deps import require_admin, CurrentUser

router = APIRouter(prefix="/api/menu", tags=["menu"])


def _to_datetime(d: date_type) -> datetime:
    return datetime(d.year, d.month, d.day)


@router.get("")
async def get_menu(hostelId: str, date: date_type = Query(...)):
    docs = await menu_col.find(
        {"hostelId": oid(hostelId), "date": _to_datetime(date)}
    ).sort("mealType", 1).to_list(10)
    return serialize_many(docs)


@router.post("", status_code=201)
async def upsert_menu(payload: MenuCreate, current: CurrentUser = Depends(require_admin)):
    data = payload.model_dump()
    data["hostelId"] = oid(payload.hostelId)
    data["date"] = _to_datetime(payload.date)

    result = await menu_col.find_one_and_update(
        {"hostelId": data["hostelId"], "date": data["date"], "mealType": data["mealType"]},
        {"$set": data},
        upsert=True,
        return_document=True,
    )
    return serialize(result)


@router.get("/range")
async def get_menu_range(hostelId: str, start: date_type, end: date_type):
    docs = await menu_col.find(
        {
            "hostelId": oid(hostelId),
            "date": {"$gte": _to_datetime(start), "$lte": _to_datetime(end)},
        }
    ).sort([("date", 1), ("mealType", 1)]).to_list(500)
    return serialize_many(docs)
