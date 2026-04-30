from pydantic import BaseModel, Field
from typing import Optional, List, Any, Generic, TypeVar
from datetime import datetime

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


# ── Project ──────────────────────────────────────────────────────────────────

class ProjectBase(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = None
    content: Optional[str] = None
    cover_url: Optional[str] = None
    tech_tags: Optional[List[str]] = []
    patent_info: Optional[dict] = {}
    metrics: Optional[dict] = {}
    sort_order: int = 0
    is_published: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Post ─────────────────────────────────────────────────────────────────────

class PostBase(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = None
    content: Optional[str] = None
    cover_url: Optional[str] = None
    tags: Optional[List[str]] = []
    is_published: bool = False
    published_at: Optional[datetime] = None


class PostCreate(PostBase):
    pass


class PostUpdate(PostBase):
    pass


class PostOut(PostBase):
    id: int
    view_count: int
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── KnowledgeDoc ─────────────────────────────────────────────────────────────

class KnowledgeDocBase(BaseModel):
    title: str
    content: str


class KnowledgeDocCreate(KnowledgeDocBase):
    pass


class KnowledgeDocUpdate(KnowledgeDocBase):
    pass


class KnowledgeDocOut(KnowledgeDocBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Comment ──────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    post_id: int
    author_name: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)


class CommentOut(CommentCreate):
    id: int
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── AI ───────────────────────────────────────────────────────────────────────

class RAGRequest(BaseModel):
    question: str = Field(..., min_length=1)


class RAGResponse(BaseModel):
    answer: str
    sources: List[str] = []


class AgentRequest(BaseModel):
    user_role: str = Field(..., description="决策者 / 使用者 / 观望者")


class AgentResponse(BaseModel):
    suggestion: str
