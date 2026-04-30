from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("", response_model=schemas.CommentOut, status_code=201)
def create_comment(payload: schemas.CommentCreate, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(
        models.Post.id == payload.post_id, models.Post.is_published == True
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="博文不存在")
    comment = models.Comment(**payload.model_dump())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/{post_id}", response_model=List[schemas.CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Comment)
        .filter(models.Comment.post_id == post_id, models.Comment.is_approved == True)
        .order_by(models.Comment.created_at.asc())
        .all()
    )
