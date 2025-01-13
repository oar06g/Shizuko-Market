# ###################### IMPORT LIBRARY #######################
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pathlib import Path
import os
import uuid

# ###################### IMPORT MODULES #######################
import src.models as models
import src.schemas as schemas
import src.config as config
import src.utiles as utiles 
from src.encryption import SPE
# #############################################################

# ###################### INIT ENCRYPTION #######################
spe = SPE(config.encryption_password)
# ###################### INIT PATHs ##############################
# CERTIFICATES_DIR = Path("users/")
# CERTIFICATES_DIR.mkdir(exist_ok=True)

class APIV1:
  def __init__(self):
    self.router = APIRouter(prefix="/api/v1")

    @self.router.post("/adduser/")
    async def add_user(
      info: schemas.UserCreate, db: AsyncSession = Depends(config.get_db)
    ):
      db_user = await db.execute(select(models.User).filter(models.User.username == info.username))
      db_user = db_user.scalars().first()
      db_phone_number = await db.execute(select(models.User).filter(models.User.phone_number == info.phone_number))
      db_phone_number = db_phone_number.scalars().first()
      if db_phone_number:
        raise HTTPException(status_code=400, detail="email already registered")
      if db_user:
        raise HTTPException(status_code=400, detail="Username already used")
      token = await utiles.checkTokenExist(db)
      encryption_password = spe.encrypt(info.password)
      db_user = models.User(
        full_name=info.full_name,
        username=info.username,
        password=encryption_password,
        phone_number=info.phone_number,
        token=token
      )
      db.add(db_user)
      await db.commit()
      await db.refresh(db_user)
      user_directory = f"./users/{token}"
      try:
        os.makedirs(user_directory, exist_ok=True)
      except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user directory: {str(e)}")
      return db_user