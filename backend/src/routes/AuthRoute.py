from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.models.User import User as UserModel, LoginUser, UpdateUser
from src.config.db import db as MongoDB
import bcrypt
from bson import ObjectId
from pymongo import ReturnDocument
import os
from dotenv import load_dotenv
import jwt

load_dotenv()

JWT_AUTH = os.getenv("JWT_AUTH", "secret_key")

router = APIRouter(prefix="/api/v1/auth")
authCollection = MongoDB["users"]

# ---------------- SECURITY ----------------
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_AUTH, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


# ---------------- REGISTER ----------------
@router.post("/register")
async def userRegister(data: UserModel):

    user_data = data.dict()

    # validate email
    email = user_data.get("email")
    if not email:
        raise HTTPException(400, "Email is required")

    email = email.lower()
    user_data["email"] = email

    # check existing
    existing = await authCollection.find_one({"email": email})
    if existing:
        raise HTTPException(400, "User already exists")

    # validate password
    password = user_data.get("password")
    if not password:
        raise HTTPException(400, "Password is required")

    # hash password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode(), salt).decode()
    user_data["password"] = hashed_password

    # insert user
    result = await authCollection.insert_one(user_data)

    # get inserted user
    user = await authCollection.find_one(
        {"_id": result.inserted_id},
        {"password": 0}
    )

    user["_id"] = str(user["_id"])

    # create token
    token = jwt.encode(
        {"userID": user["_id"]},
        JWT_AUTH,
        algorithm="HS256"
    )

    return {
        "message": "User registered successfully",
        "token": token,
        "data": user
    }


# ---------------- LOGIN ----------------
@router.post("/login")
async def userLogin(data: LoginUser):

    email = data.email
    password = data.password

    if not email or not password:
        raise HTTPException(400, "Email and password are required")

    email = email.lower()

    user = await authCollection.find_one({"email": email})

    if not user:
        raise HTTPException(404, "User not found")

    stored_password = user.get("password")

    if not stored_password:
        raise HTTPException(500, "Password not found in DB")

    # compare password
    is_match = bcrypt.checkpw(
        password.encode(),
        stored_password.encode()
    )

    if not is_match:
        raise HTTPException(401, "Invalid credentials")

    user["_id"] = str(user["_id"])
    del user["password"]

    # create token
    token = jwt.encode(
        {"userID": user["_id"]},
        JWT_AUTH,
        algorithm="HS256"
    )

    return {
        "message": "Login successful",
        "token": token,
        "data": user
    }


# ---------------- PROFILE ----------------
@router.get("/profile")
async def userProfile(current_user: dict = Depends(get_current_user)):

    user_id = current_user.get("userID")

    if not user_id:
        raise HTTPException(400, "Invalid token payload")

    try:
        user = await authCollection.find_one(
            {"_id": ObjectId(user_id)},
            {"password": 0}
        )
    except Exception:
        raise HTTPException(400, "Invalid user ID")

    if not user:
        raise HTTPException(404, "User not found")

    user["_id"] = str(user["_id"])

    return {
        "message": "Profile fetched successfully",
        "data": user
    }
# ---------------- UPDATE PROFILE ----------------
@router.put("/profile")
async def userProfile(
    data: UpdateUser,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("userID")

    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    try:
        # remove None values (only update provided fields)
        update_data = {k: v for k, v in data.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")

        user = await authCollection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
            projection={"password": 0}
        )

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = str(user["_id"])

    return {
        "message": "Profile updated successfully",
        "data": user
    }