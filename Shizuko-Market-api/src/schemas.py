from pydantic import BaseModel, EmailStr, Field
from datetime import date

class UserCreate(BaseModel):
  full_name: str = Field(
    ..., min_length=3, max_length=50, description="Full name of the user"
  )
  username: str = Field(
    ...,
    min_length=3,
    max_length=30,
    pattern=r"^\w+$",
    description="Unique username",
  )
  phone_number: str = Field(
    ..., min_length=10, max_length=11, description="Number phone of the user"
  )
  password: str = Field(
    ..., min_length=8, description="Password with at least 8 characters"
  )

  class Config:
    from_attributes = True