from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/admin/posts", tags=["admin-posts"])


@router.get("", response_model=List[schemas.PostOut])
def list_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Post).order_by(models.Post.updated_at.desc()).all()


@router.post("", response_model=schemas.PostOut, status_code=201)
def create(payload: schemas.PostCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if db.query(models.Post).filter(models.Post.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="slug 已存在")
    post = models.Post(**payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=schemas.PostOut)
def update(post_id: int, payload: schemas.PostUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    for k, v in payload.model_dump().items():
        setattr(post, k, v)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
def delete(post_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    db.delete(post)
    db.commit()
