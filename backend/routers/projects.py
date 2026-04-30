from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from database import get_db
import models, schemas

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=schemas.PaginatedResponse[schemas.ProjectOut])
def list_projects(
    tag: Optional[str] = Query(None, description="按技术标签筛选"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Project).filter(models.Project.is_published == True)
    if tag:
        query = query.filter(models.Project.tech_tags.contains([tag]))
    query = query.order_by(models.Project.sort_order.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return schemas.PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get("/{slug}", response_model=schemas.ProjectOut)
def get_project(slug: str, db: Session = Depends(get_db)):
    project = (
        db.query(models.Project)
        .filter(models.Project.slug == slug, models.Project.is_published == True)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project
