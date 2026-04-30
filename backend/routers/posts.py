from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import math

from database import get_db
import models, schemas

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=schemas.PaginatedResponse[schemas.PostOut])
def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = (
        db.query(models.Post)
        .filter(models.Post.is_published == True)
        .order_by(models.Post.published_at.desc())
    )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return schemas.PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get("/{slug}", response_model=schemas.PostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(models.Post)
        .filter(models.Post.slug == slug, models.Post.is_published == True)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    post.view_count += 1
    db.commit()
    db.refresh(post)
    return post
