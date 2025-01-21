from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
import src.models as models
import secrets
from sqlalchemy.future import select
import uuid
import aiofiles
from pathlib import Path

UPLOAD_DIR = Path('./assets/product_images/')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR_PROFILE = Path('./assets/image_photos/')
UPLOAD_DIR_PROFILE.mkdir(parents=True, exist_ok=True)

async def save_image(file: UploadFile, number: int) -> str:
  if number == 1:
    unique_filename = f"{uuid.uuid4()}_product_image_{file.filename}"
    file_location = UPLOAD_DIR / unique_filename
    async with aiofiles.open(file_location, 'wb') as f:
      content = await file.read()
      await f.write(content)
  elif number == 2:
    unique_filename = f"{uuid.uuid4()}_users_image_{file.filename}"
    file_location = UPLOAD_DIR_PROFILE / unique_filename
    async with aiofiles.open(file_location, 'wb') as f:
      content = await file.read()
      await f.write(content)

  return str(file_location)

def generateTokens(length: int = 35) -> str:
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  token = ""
  for i in range(length):
    random_index = secrets.randbelow(len(characters))
    token += characters[random_index]
  return token

async def checkTokenExist(db: AsyncSession) -> str:
  randomToken = generateTokens()
  try:
    result = await db.execute(
      select(models.User).filter(models.User.token == randomToken)
    )
    user = result.scalars().first()

    if user:
      print("Token exists, generating new one...")
      return await checkTokenExist(db)
    else:
      print("Token does not exist, returning token.")
      return randomToken
  except SQLAlchemyError as e:
    print(f"Error checking token existence: {str(e)}")
    raise HTTPException(
      status_code=500, detail="Database error while checking token"
    )
