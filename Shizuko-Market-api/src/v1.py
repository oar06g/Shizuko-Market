from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os

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
        # تحقق إذا كان المستخدم موجودًا بناءً على الاسم أو الرقم
        db_user = await db.execute(select(models.User).filter(models.User.username == info.username))
        db_user = db_user.scalars().first()
        db_phone_number = await db.execute(select(models.User).filter(models.User.phone_number == info.phone_number))
        db_phone_number = db_phone_number.scalars().first()

        if db_phone_number:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        if db_user:
            raise HTTPException(status_code=400, detail="Username already used")
        
        # إنشاء التوكن
        token = await utiles.checkTokenExist(db)
        encryption_password = spe.encrypt(info.password)
        
        # إضافة المستخدم الجديد
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

        # إنشاء مجلد للمستخدم
        user_directory = f"./users/{token}"
        os.makedirs(user_directory, exist_ok=True)
        
        return db_user

      except HTTPException as e:
        raise e 
      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while adding user: {str(e)}")

    # #################################
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

        # فك تشفير كلمة المرور
        encrypted_password = db_user.password
        try:
          decrypted_password = spe.decrypt(encrypted_password)
        except ValueError:
          raise HTTPException(status_code=500, detail="Error decrypting password")

        # التحقق من تطابق كلمة المرور المدخلة مع المخزنة
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
        raise e  # إعادة رفع الاستثناء إذا كان هناك خطأ في التحقق من البيانات
      except Exception as e:
        # إضافة معالجة استثنائية لأي خطأ آخر
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
      
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

        # حفظ الصورة في المسار المحدد
        image_path = await utiles.save_image(image)

        # إضافة المنتج إلى قاعدة البيانات
        new_product = models.Products(
          user_id=db_user.id,
          title=title,
          description=description,
          price=price,
          image=image_path,  # قم بتخزين مسار الصورة هنا
          available=available,
        )
        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)

        return new_product

      except Exception as e:
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
                "profile_img": user.profile_img,
                }
              })

        return product_with_user_info

      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    @self.router.get("/products/{product_id}/")
    async def view_product_by_id(product_id: int, db: AsyncSession = Depends(config.get_db)):
      try:
        # استعلام للبحث عن المنتج بناءً على ID
        result = await db.execute(select(models.Products).filter(models.Products.id == product_id))
        product = result.scalars().first()

        # إذا لم يتم العثور على المنتج
        if not product:
          raise HTTPException(status_code=404, detail="Product not found")

        return product

      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
      
    @self.router.get("/products/bytoken/{token}/")
    async def view_product_by_token(token: str, db: AsyncSession = Depends(config.get_db)):
      try:
        result = await db.execute(select(models.User).filter(models.User.token == token))
        user_info = result.scalars().first()

        result_products = await db.execute(select(models.Products).filter(models.Products.user_id == user_info.id))
        products = result_products.scalars().all()

        if not products:
          raise HTTPException(status_code=404, detail="None Products")

        return products

      except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
      