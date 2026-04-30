from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/admin/projects", tags=["admin-projects"])


@router.get("", response_model=List[schemas.ProjectOut])
def list_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Project).order_by(models.Project.sort_order.desc()).all()


@router.post("", response_model=schemas.ProjectOut, status_code=201)
def create(payload: schemas.ProjectCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if db.query(models.Project).filter(models.Project.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="slug 已存在")
    project = models.Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update(project_id: int, payload: schemas.ProjectUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    for k, v in payload.model_dump().items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete(project_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    db.delete(project)
    db.commit()
