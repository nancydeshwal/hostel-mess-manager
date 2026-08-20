import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
    mongo_db_name: str = os.getenv("MONGO_DB_NAME", "hostel_mess")
    client_origin: str = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")


@lru_cache
def get_settings() -> Settings:
    return Settings()
