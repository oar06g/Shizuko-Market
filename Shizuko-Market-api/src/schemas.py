from pydantic import BaseModel, Field
from fastapi import Form
from typing import Optional

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

class UserCheck(BaseModel):
  phone_number: str = Field(..., description="A valid phone number")
  password: str = Field(..., description="Password with at least 8 characters")

  class Config:
    from_attributes = True

class UserDelete(BaseModel):
  token: str = Field(..., description="token")

  class Config:
    from_attributes = True

class UserUpdate(BaseModel):
  token: str = Form(..., description="token")
  full_name: Optional[str] = Form(
    None, min_length=3, max_length=50, description="Full name of the user"
  )
  username: Optional[str] = Form(
    None,
    min_length=3,
    max_length=30,
    pattern=r"^\w+$",
    description="Unique username",
  )
  password: Optional[str] = Form(
    None, min_length=8, description="Password with at least 8 characters"
  )
  image: Optional[str] = Form(None, description="Image of the user")

  class Config:
    from_attributes = True