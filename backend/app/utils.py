from bson import ObjectId
from fastapi import HTTPException


def oid(id_str: str) -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=400, detail=f"Invalid id: {id_str}")
    return ObjectId(id_str)


def serialize(doc: dict) -> dict:
    """Convert Mongo document (with ObjectId) into a JSON-safe dict with string id."""
    if doc is None:
        return None
    doc = dict(doc)
    doc["_id"] = str(doc.pop("_id"))
    for key in ("hostelId", "studentId"):
        if key in doc and isinstance(doc[key], ObjectId):
            doc[key] = str(doc[key])
    return doc


def serialize_many(docs) -> list[dict]:
    return [serialize(d) for d in docs]
