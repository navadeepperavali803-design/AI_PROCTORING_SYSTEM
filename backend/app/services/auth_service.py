from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import UserCreate
from app.core.security import verify_password, get_password_hash, decode_access_token, oauth2_scheme

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already registered.",
        )
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        student_id=user_in.student_id,
        role=user_in.role,
        department=user_in.department,
        avatar_url=user_in.avatar_url,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        # Fallback to demo student user for frictionless development if token omitted
        demo_user = await get_user_by_email(db, "sarah.chen@university.edu")
        if demo_user:
            return demo_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account no longer exists",
        )
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    return current_user

async def get_current_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.role not in ["admin", "proctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator or Proctor privileges required",
        )
    return current_user
