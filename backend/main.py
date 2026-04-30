import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import projects, posts, comments, auth, ai
from routers.admin import projects as admin_projects
from routers.admin import posts as admin_posts
from routers.admin import knowledge as admin_knowledge

app = FastAPI(
    title="TongAI 个人官网 API",
    description="个人作品集官网后端接口",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由注册
API_PREFIX = "/api/v1"
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(posts.router, prefix=API_PREFIX)
app.include_router(comments.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(admin_projects.router, prefix=API_PREFIX)
app.include_router(admin_posts.router, prefix=API_PREFIX)
app.include_router(admin_knowledge.router, prefix=API_PREFIX)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "TongAI API is running. Visit /docs for API documentation."}
