from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
import logging
from typing import Optional

# ###################### IMPORT MODULES #######################
import src.models as models
import src.schemas as schemas
import src.config as config
import src.utiles as utiles 
from src.encryption import SPE
# #############################################################

# ###################### INIT ENCRYPTION #######################
spe = SPE(config.encryption_password)

class APIV1:
  def __init__(self):
    self.router = APIRouter(prefix="/api/v1")

    # #################################
    @self.router.post("/adduser/")
    async def add_user(
      info: schemas.UserCreate, db: AsyncSession = Depends(config.get_db)
    ):
      try:
        db_user = await db.execute(select(models.User).filter(models.User.username == info.username))
        db_user = db_user.scalars().first()
        db_phone_number = await db.execute(select(models.User).filter(models.User.phone_number == info.phone_number))
        db_phone_number = db_phone_number.scalars().first()
        if db_phone_number:
          raise HTTPException(status_code=400, detail="Phone number already registered")
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
        await db.close()
        return db_user

      except HTTPException as e: raise e
      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while adding user: {str(e)}")

    @self.router.post("/checkuser/")
    async def check_user(
      info: schemas.UserCheck, db: AsyncSession = Depends(config.get_db)
    ):
      try:
        phone_number = int(info.phone_number)
        db_user = await db.execute(
          select(models.User).filter(models.User.phone_number == phone_number)
        )
        db_user = db_user.scalars().first()

        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        encrypted_password = db_user.password
        try:
          decrypted_password = spe.decrypt(encrypted_password)
        except ValueError:
          raise HTTPException(status_code=500, detail="Error decrypting password")
        if decrypted_password == info.password:
          return {
            "full_name": db_user.full_name,
            "username": db_user.username,
            "phone_number": db_user.phone_number,
            "token": db_user.token,
            "profile_img": db_user.profile_img
          }
        else:
          raise HTTPException(status_code=401, detail="Invalid credentials")

      except HTTPException as e:
        raise e
      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
      
    @self.router.delete("/deleteuser/")
    async def delete_user(info: schemas.UserDelete, db: AsyncSession = Depends(config.get_db)): 
      try:
        result = await db.execute(
            select(models.User).filter(models.User.token == info.token)
        )
        db_user = result.scalars().first()
        if not db_user: 
          raise HTTPException(status_code=404, detail="User not found")
        result_products = await db.execute(
          select(models.Products).filter(models.Products.user_id == db_user.id)
        )
        db_products = result_products.scalars().all()
        db_user_d = models.UserD(
          full_name=db_user.full_name,
          username=db_user.username,
          phone_number=db_user.phone_number,
          password=db_user.password,
          token=db_user.token,
          profile_img=db_user.profile_img
        )
        db.add(db_user_d)
        await db.commit()
        await db.refresh(db_user_d)

        for product in db_products:
          db_product_d = models.ProductsD(
            user_id=db_user_d.id,
            title=product.title,
            description=product.description,
            price=product.price,
            image=product.image,
            available=product.available
          )
          db.add(db_product_d)
        await db.commit()
        for product in db_products:
          await db.execute(
            delete(models.Products).where(models.Products.id == product.id)
          )
        await db.execute(
          delete(models.User).where(models.User.id == db_user.id)
        )
        await db.commit()
        return {"message": "User and associated products deleted successfully", "status_code": 202}

      except HTTPException as e: raise e
      except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
      
    @self.router.put("/updateuser/")
    async def update_user(
      token: str = Form(..., description="token"),
      full_name: Optional[str] = Form(None, description="Full name of the user"),
      username: Optional[str] = Form(None, description="Unique username"),
      password: Optional[str] = Form(None, description="Password with at least 8 characters"),
      image: Optional[UploadFile] = File(None),
      db: AsyncSession = Depends(config.get_db)
    ):
      try:
        result = await db.execute(
          select(models.User).filter(models.User.token == token)
        )
        db_user = result.scalars().first()
        if not db_user:
          raise HTTPException(status_code=404, detail="User not found")
        if full_name:
          db_user.full_name = full_name
        if username:
          db_user.username = username
        if password:
          encryption_password = spe.encrypt(password)
          db_user.password = encryption_password
        if image:
          image_path = await utiles.save_image(image, 2)
          db_user.profile_img = image_path

        db.add(db_user)
        await db.commit()

        return JSONResponse(
          status_code=200,
          content={"message": "User updated successfully"}
        )

      except HTTPException as e:
        logging.error(f"HTTP Error: {e.detail}")
        raise e
    
      except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    # ###################### CREATE PRODUCT WITH IMAGE #######################
    @self.router.post("/create-product/")
    async def create_product(
      token: str = Form(...),
      title: str = Form(...),
      description: str = Form(...),
      price: float = Form(...),
      available: bool = Form(...),
      image: UploadFile = File(...),
      db: AsyncSession = Depends(config.get_db)
    ):
      try:
        db_user = await db.execute(
          select(models.User).filter(models.User.token == token)
        )
        db_user = db_user.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        image_path = await utiles.save_image(image, 1)
        new_product = models.Products(
          user_id=db_user.id,
          title=title,
          description=description,
          price=price,
          image=image_path,
          available=available,
        )
        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)

        return new_product
      except HTTPException as e: raise e

      except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
      
    @self.router.get("/products/")
    async def view_products(db: AsyncSession = Depends(config.get_db)):
      try:
        result = await db.execute(select(models.Products))
        products = result.scalars().all()

        if not products:
          raise HTTPException(status_code=404, detail="No products found")

        product_with_user_info = []
        for product in products:
          user_result = await db.execute(
            select(models.User).filter(models.User.id == product.user_id)
          )
          user = user_result.scalars().first()
          if user:
            product_with_user_info.append({
              "product_id": product.id,
              "title": product.title,
              "description": product.description,
              "price": product.price,
              "image": product.image,
              "available": product.available,
              "time": product.created_at,
              "user": {
                "full_name": user.full_name,
                "username": user.username,
                "profile_img": user.profile_img,
                }
              })

        return product_with_user_info
      
      except HTTPException as e: raise e

      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    @self.router.get("/products/{product_id}/")
    async def view_product_by_id(product_id: int, db: AsyncSession = Depends(config.get_db)):
      try:
        result = await db.execute(select(models.Products).filter(models.Products.id == product_id))
        product = result.scalars().first()
        if not product:
          raise HTTPException(status_code=404, detail="Product not found")

        return product
      
      except HTTPException as e: raise e

      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    @self.router.get("/products/bytoken/{token}/")
    async def view_product_by_token(token: str, db: AsyncSession = Depends(config.get_db)):
      try:
        result = await db.execute(select(models.User).filter(models.User.token == token))
        user_info = result.scalars().first()
        if not user_info:
          raise HTTPException(status_code=404, detail="User not found")
        result_products = await db.execute(select(models.Products).filter(models.Products.user_id == user_info.id))
        products = result_products.scalars().all()
        if not products:
          raise HTTPException(status_code=404, detail="No products found")
        return products
    
      except HTTPException as e: raise e

      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    @self.router.delete("/products/delete/{product_id}")
    async def delete_product(product_id: int, db: AsyncSession = Depends(config.get_db)):
      try:
        result = await db.execute(select(models.Products).filter(models.Products.id == product_id))
        product_info = result.scalars().first()
        if not product_info:
          raise HTTPException(status_code=404, detail=f"Product not found: {str(e)}")
        await db.execute(delete(models.Products).where(models.Products.id == product_id))
        await db.commit()
        return {"message": "Product deleted successfully"}
      except HTTPException as e: raise e
      except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
