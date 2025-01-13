from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Date
from src.config import engine
import asyncio

Base = declarative_base()

class User(Base):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, autoincrement=True)
  full_name = Column(String(100), nullable=False)
  username = Column(String(50), nullable=False, unique=True)
  phone_number = Column(Integer, nullable=False, unique=True)
  password = Column(String(100), nullable=False)
  token = Column(String(100), nullable=False)
  profile_img = Column(String(255), default="/assets/images/profile_img_male.jpg")

async def create_tables():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


async def main():
  await create_tables()

if __name__ == "__main__":
  try:
    asyncio.run(main())
  except KeyboardInterrupt:
    print("C")