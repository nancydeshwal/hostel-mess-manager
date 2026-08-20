from datetime import datetime, date as date_type, timedelta
from collections import defaultdict
from fastapi import APIRouter, HTTPException
import numpy as np
from sklearn.linear_model import LinearRegression

from app.database import skips_col, menu_col, hostels_col, complaints_col
from app.utils import oid, serialize_many

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _to_datetime(d: date_type) -> datetime:
    return datetime(d.year, d.month, d.day)


@router.get("/skip-summary")
async def skip_summary(hostelId: str, days: int = 14):
    """Daily skip counts per meal type for the last `days` days - powers the Chart.js dashboard."""
    end = datetime.utcnow().date()
    start = end - timedelta(days=days - 1)

    docs = await skips_col.find(
        {
            "hostelId": oid(hostelId),
            "date": {"$gte": _to_datetime(start), "$lte": _to_datetime(end)},
            "skipped": True,
        }
    ).to_list(5000)

    # bucket -> {date: {mealType: count}}
    buckets = defaultdict(lambda: defaultdict(int))
    for d in docs:
        day_key = d["date"].strftime("%Y-%m-%d")
        buckets[day_key][d["mealType"]] += 1

    labels = [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
    meal_types = ["breakfast", "lunch", "snacks", "dinner"]
    series = {
        meal: [buckets[label].get(meal, 0) for label in labels] for meal in meal_types
    }

    return {"labels": labels, "series": series}


@router.get("/complaint-summary")
async def complaint_summary(hostelId: str, days: int = 30):
    end = datetime.utcnow().date()
    start = end - timedelta(days=days - 1)
    docs = await complaints_col.find(
        {"hostelId": oid(hostelId), "date": {"$gte": _to_datetime(start), "$lte": _to_datetime(end)}}
    ).to_list(5000)

    by_category = defaultdict(int)
    by_meal = defaultdict(int)
    ratings = []
    for d in docs:
        by_category[d.get("category", "other")] += 1
        by_meal[d["mealType"]] += 1
        ratings.append(d["rating"])

    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None
    return {
        "totalComplaints": len(docs),
        "averageRating": avg_rating,
        "byCategory": dict(by_category),
        "byMealType": dict(by_meal),
    }


@router.get("/predict-grocery")
async def predict_grocery(hostelId: str, mealType: str, history_days: int = 21):
    """
    Simple linear regression: for each key ingredient in the most recent menu for
    this meal type, model daily attendance (strength - skips) over the past
    `history_days` days as a trend, project it forward 7 days, and multiply by the
    ingredient's per-100-student usage rate to get next week's grocery requirement.
    """
    hostel = await hostels_col.find_one({"_id": oid(hostelId)})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")

    strength = hostel.get("totalStrength", 0)
    if strength <= 0:
        raise HTTPException(status_code=400, detail="Hostel totalStrength must be set to predict demand")

    end = datetime.utcnow().date()
    start = end - timedelta(days=history_days - 1)

    skip_docs = await skips_col.find(
        {
            "hostelId": oid(hostelId),
            "mealType": mealType,
            "date": {"$gte": _to_datetime(start), "$lte": _to_datetime(end)},
            "skipped": True,
        }
    ).to_list(5000)

    skip_by_day = defaultdict(int)
    for d in skip_docs:
        skip_by_day[d["date"].strftime("%Y-%m-%d")] += 1

    day_labels = [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(history_days)]
    attendance = np.array([strength - skip_by_day.get(day, 0) for day in day_labels], dtype=float)
    X = np.arange(len(attendance)).reshape(-1, 1)

    model = LinearRegression()
    model.fit(X, attendance)

    future_X = np.arange(len(attendance), len(attendance) + 7).reshape(-1, 1)
    predicted_attendance = model.predict(future_X)
    predicted_attendance = np.clip(predicted_attendance, 0, strength)

    avg_predicted_attendance = float(np.mean(predicted_attendance))

    # most recent menu entry for this meal type to get ingredient usage rates
    latest_menu = await menu_col.find_one(
        {"hostelId": oid(hostelId), "mealType": mealType}, sort=[("date", -1)]
    )

    ingredients_forecast = []
    if latest_menu:
        for ing in latest_menu.get("keyIngredients", []):
            weekly_total = 0.0
            for day_att in predicted_attendance:
                weekly_total += (day_att / 100.0) * ing["unitPerHundredStudents"]
            ingredients_forecast.append(
                {
                    "name": ing["name"],
                    "unit": ing.get("unit", "kg"),
                    "predictedWeeklyQuantity": round(weekly_total, 2),
                }
            )

    return {
        "hostelId": hostelId,
        "mealType": mealType,
        "historyDays": history_days,
        "trendSlope": round(float(model.coef_[0]), 3),
        "averagePredictedAttendanceNext7Days": round(avg_predicted_attendance, 1),
        "predictedDailyAttendanceNext7Days": [round(float(v), 1) for v in predicted_attendance],
        "groceryForecast": ingredients_forecast,
        "note": "Linear regression trend on (strength - historical skips); no menu ingredients logged yet"
        if not latest_menu
        else None,
    }
