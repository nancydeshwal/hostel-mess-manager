from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pydantic import BaseModel

from app.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/student/login", auto_error=False)


class CurrentUser(BaseModel):
    id: str  # studentId for students, admin user id for admins
    role: str  # "student" | "admin"
    hostelId: str | None = None
    name: str | None = None
    rollNumber: str | None = None
    username: str | None = None


def get_current_user(token: str | None = Depends(oauth2_scheme)) -> CurrentUser:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Log in and pass the token as 'Authorization: Bearer <token>'.",
        )
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    return CurrentUser(
        id=payload.get("sub"),
        role=payload.get("role"),
        hostelId=payload.get("hostelId"),
        name=payload.get("name"),
        rollNumber=payload.get("rollNumber"),
        username=payload.get("username"),
    )


def require_student(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student account required")
    return user


def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account required")
    return user
