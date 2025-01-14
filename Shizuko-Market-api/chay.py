from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
from uuid import uuid4
from src import models, schemas, config
from src.utiles import get_db

router = APIRouter(prefix="/api/v1/products")


# ###################### CREATE PRODUCT #######################
@router.post("/create/", response_model=schemas.ProductCreate)
async def create_product(
    product: schemas.ProductCreate, db: AsyncSession = Depends(get_db)
):
    try:
        # تحقق من وجود المستخدم بناءً على التوكن
        db_user = await db.execute(
            select(models.User).filter(models.User.token == product.token)
        )
        db_user = db_user.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # إضافة المنتج إلى قاعدة البيانات
        new_product = models.Products(
            user_id=db_user.id,
            title=product.title,
            description=product.description,
            price=product.price,
            image=product.image,
            available=product.available,
        )
        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)
        return new_product

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


# ###################### GET ALL PRODUCTS #######################
@router.get("/", response_model=List[schemas.ProductCreate])
async def get_all_products(
    token: str, db: AsyncSession = Depends(get_db)
):
    try:
        # تحقق من وجود المستخدم بناءً على التوكن
        db_user = await db.execute(
            select(models.User).filter(models.User.token == token)
        )
        db_user = db_user.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # استرجاع جميع المنتجات الخاصة بالمستخدم
        products = await db.execute(
            select(models.Products).filter(models.Products.user_id == db_user.id)
        )
        return products.scalars().all()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# ###################### GET SINGLE PRODUCT #######################
@router.get("/{product_id}", response_model=schemas.ProductCreate)
async def get_product(
    product_id: int, token: str, db: AsyncSession = Depends(get_db)
):
    try:
        # تحقق من وجود المستخدم بناءً على التوكن
        db_user = await db.execute(
            select(models.User).filter(models.User.token == token)
        )
        db_user = db_user.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # استرجاع المنتج بناءً على معرّف المنتج
        product = await db.execute(
            select(models.Products).filter(models.Products.id == product_id)
        )
        db_product = product.scalars().first()

        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")

        if db_product.user_id != db_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this product")

        return db_product

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# ###################### UPDATE PRODUCT #######################
@router.put("/{product_id}", response_model=schemas.ProductCreate)
async def update_product(
    product_id: int, product: schemas.ProductCreate, token: str, db: AsyncSession = Depends(get_db)
):
    try:
        # تحقق من وجود المستخدم بناءً على التوكن
        db_user = await db.execute(
            select(models.User).filter(models.User.token == token)
        )
        db_user = db_user.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # استرجاع المنتج بناءً على معرّف المنتج
        db_product = await db.execute(
            select(models.Products).filter(models.Products.id == product_id)
        )
        db_product = db_product.scalars().first()

        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")

        if db_product.user_id != db_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this product")

        # تحديث المنتج
        db_product.title = product.title
        db_product.description = product.description
        db_product.price = product.price
        db_product.image = product.image
        db_product.available = product.available

        db.add(db_product)
        await db.commit()
        await db.refresh(db_product)

        return db_product

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# ###################### DELETE PRODUCT #######################
@router.delete("/{product_id}")
async def delete_product(
    product_id: int, token: str, db: AsyncSession = Depends(get_db)
):
    try:
        # تحقق من وجود المستخدم بناءً على التوكن
        db_user = await db.execute(
            select(models.User).filter(models.User.token == token)
        )
        db_user = db_user.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # استرجاع المنتج بناءً على معرّف المنتج
        db_product = await db.execute(
            select(models.Products).filter(models.Products.id == product_id)
        )
        db_product = db_product.scalars().first()

        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")

        if db_product.user_id != db_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this product")

        # حذف المنتج
        await db.delete(db_product)
        await db.commit()

        return {"detail": "Product deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
