import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
    mongo_db_name: str = os.getenv("MONGO_DB_NAME", "hostel_mess")
    client_origin: str = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")

    jwt_secret: str = os.getenv("JWT_SECRET", "dev-only-change-me-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = int(os.getenv("JWT_EXPIRES_MINUTES", "1440"))  # 24h


@lru_cache
def get_settings() -> Settings:
    return Settings()
