"""
Seed script: creates demo hostels, students, a week of menus with key ingredients,
random meal-skip history, and a few complaints so the dashboard has data to show.

Run with:  python seed.py
"""
import asyncio
import random
from datetime import datetime, timedelta

from app.database import hostels_col, students_col, menu_col, skips_col, complaints_col, ensure_indexes

HOSTEL_NAMES_BOYS = [f"Boys Hostel {i}" for i in range(1, 11)]
HOSTEL_NAMES_GIRLS = ["Girls Hostel 1", "Girls Hostel 2", "Girls Hostel 3"]

BREAKFAST_ITEMS = [["Poha", "Tea", "Banana"], ["Aloo Paratha", "Curd", "Pickle"], ["Idli", "Sambar", "Chutney"]]
LUNCH_ITEMS = [["Rice", "Dal", "Mix Veg", "Roti"], ["Rajma", "Rice", "Salad", "Roti"], ["Chole", "Rice", "Roti", "Curd"]]
SNACKS_ITEMS = [["Samosa", "Tea"], ["Bread Pakora", "Tea"], ["Biscuits", "Coffee"]]
DINNER_ITEMS = [["Paneer Curry", "Rice", "Roti", "Salad"], ["Kadhi Chawal", "Roti"], ["Egg Curry", "Rice", "Roti"]]

KEY_INGREDIENTS = {
    "breakfast": [{"name": "Wheat Flour", "unitPerHundredStudents": 6, "unit": "kg"},
                  {"name": "Milk", "unitPerHundredStudents": 10, "unit": "L"}],
    "lunch": [{"name": "Rice", "unitPerHundredStudents": 8, "unit": "kg"},
              {"name": "Lentils (Dal)", "unitPerHundredStudents": 5, "unit": "kg"},
              {"name": "Mixed Vegetables", "unitPerHundredStudents": 7, "unit": "kg"}],
    "snacks": [{"name": "Refined Flour (Maida)", "unitPerHundredStudents": 3, "unit": "kg"},
               {"name": "Tea Leaves", "unitPerHundredStudents": 0.4, "unit": "kg"}],
    "dinner": [{"name": "Paneer", "unitPerHundredStudents": 4, "unit": "kg"},
               {"name": "Rice", "unitPerHundredStudents": 6, "unit": "kg"},
               {"name": "Wheat Flour", "unitPerHundredStudents": 5, "unit": "kg"}],
}

MEALS = ["breakfast", "lunch", "snacks", "dinner"]


async def main():
    await ensure_indexes()

    print("Clearing existing demo collections...")
    for col in (hostels_col, students_col, menu_col, skips_col, complaints_col):
        await col.delete_many({})

    print("Creating hostels...")
    hostel_ids = []
    for name in HOSTEL_NAMES_BOYS:
        res = await hostels_col.insert_one({"name": name, "type": "boys", "totalStrength": random.randint(180, 260)})
        hostel_ids.append(res.inserted_id)
    for name in HOSTEL_NAMES_GIRLS:
        res = await hostels_col.insert_one({"name": name, "type": "girls", "totalStrength": random.randint(150, 220)})
        hostel_ids.append(res.inserted_id)

    # Focus demo depth on the first hostel
    demo_hostel_id = hostel_ids[0]
    hostel_doc = await hostels_col.find_one({"_id": demo_hostel_id})
    strength = hostel_doc["totalStrength"]

    print(f"Registering {strength} students in {hostel_doc['name']}...")
    student_ids = []
    for i in range(1, strength + 1):
        res = await students_col.insert_one({
            "name": f"Student {i}",
            "rollNumber": f"NITK-{demo_hostel_id}-{i:04d}"[:40],
            "hostelId": demo_hostel_id,
            "roomNumber": f"{100 + i // 4}-{chr(65 + i % 4)}",
        })
        student_ids.append(res.inserted_id)

    today = datetime.utcnow().date()
    print("Generating 21 days of menus, skips, and complaints...")
    for offset in range(21, -8, -1):  # 21 days back through 7 days forward-ish (menus only need latest)
        day = today - timedelta(days=offset)
        day_dt = datetime(day.year, day.month, day.day)

        for meal in MEALS:
            items = random.choice({
                "breakfast": BREAKFAST_ITEMS, "lunch": LUNCH_ITEMS,
                "snacks": SNACKS_ITEMS, "dinner": DINNER_ITEMS,
            }[meal])
            if day_dt <= datetime(today.year, today.month, today.day):
                await menu_col.update_one(
                    {"hostelId": demo_hostel_id, "date": day_dt, "mealType": meal},
                    {"$set": {
                        "hostelId": demo_hostel_id, "date": day_dt, "mealType": meal,
                        "items": items, "keyIngredients": KEY_INGREDIENTS[meal],
                    }},
                    upsert=True,
                )

            if day_dt > datetime(today.year, today.month, today.day):
                continue  # don't generate skip/complaint history for future days

            # simulate a mild upward trend in skips over time + weekend bump
            base_skip_rate = 0.12 + (21 - offset) * 0.004
            if day.weekday() in (5, 6):
                base_skip_rate += 0.08
            num_skippers = int(strength * base_skip_rate * random.uniform(0.7, 1.3))
            skippers = random.sample(student_ids, min(num_skippers, len(student_ids)))
            for sid in skippers:
                await skips_col.update_one(
                    {"studentId": sid, "date": day_dt, "mealType": meal},
                    {"$set": {"studentId": sid, "hostelId": demo_hostel_id, "date": day_dt,
                              "mealType": meal, "skipped": True}},
                    upsert=True,
                )

            # sprinkle a few complaints
            if random.random() < 0.35:
                reviewer = random.choice(student_ids)
                await complaints_col.insert_one({
                    "studentId": reviewer, "hostelId": demo_hostel_id, "date": day_dt,
                    "mealType": meal, "rating": random.randint(1, 5),
                    "comment": random.choice([
                        "Food was cold today.", "Portion size was too small.",
                        "Great taste, loved it!", "Hygiene needs improvement near the counter.",
                        "Long queue during rush hour.",
                    ]),
                    "category": random.choice(["quality", "quantity", "hygiene", "taste", "service"]),
                    "status": "open",
                })

    print("Seed complete. Demo hostel id:", str(demo_hostel_id))


if __name__ == "__main__":
    asyncio.run(main())
