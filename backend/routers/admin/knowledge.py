from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/admin/knowledge", tags=["admin-knowledge"])


@router.get("", response_model=List[schemas.KnowledgeDocOut])
def list_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.KnowledgeDoc).order_by(models.KnowledgeDoc.updated_at.desc()).all()


@router.post("", response_model=schemas.KnowledgeDocOut, status_code=201)
def create(payload: schemas.KnowledgeDocCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    doc = models.KnowledgeDoc(**payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.put("/{doc_id}", response_model=schemas.KnowledgeDocOut)
def update(doc_id: int, payload: schemas.KnowledgeDocUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    doc = db.query(models.KnowledgeDoc).filter(models.KnowledgeDoc.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    for k, v in payload.model_dump().items():
        setattr(doc, k, v)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=204)
def delete(doc_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    doc = db.query(models.KnowledgeDoc).filter(models.KnowledgeDoc.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    db.delete(doc)
    db.commit()


@router.get("/admin/comments", response_model=List[schemas.CommentOut], tags=["admin-comments"])
def list_unapproved(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return (
        db.query(models.Comment)
        .filter(models.Comment.is_approved == False)
        .order_by(models.Comment.created_at.desc())
        .all()
    )


@router.put("/admin/comments/{comment_id}/approve", response_model=schemas.CommentOut, tags=["admin-comments"])
def approve_comment(comment_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    comment.is_approved = True
    db.commit()
    db.refresh(comment)
    return comment
