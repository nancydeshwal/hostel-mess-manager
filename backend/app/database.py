from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db_name]

# Collections
hostels_col = db["hostels"]
students_col = db["students"]
menu_col = db["menus"]
skips_col = db["meal_skips"]
complaints_col = db["complaints"]
admins_col = db["admins"]


async def ensure_indexes():
    await hostels_col.create_index("name", unique=True)
    await students_col.create_index("rollNumber", unique=True)
    await admins_col.create_index("username", unique=True)
    await menu_col.create_index(
        [("hostelId", 1), ("date", 1), ("mealType", 1)], unique=True
    )
    await skips_col.create_index(
        [("studentId", 1), ("date", 1), ("mealType", 1)], unique=True
    )
    await complaints_col.create_index([("hostelId", 1), ("date", -1)])
