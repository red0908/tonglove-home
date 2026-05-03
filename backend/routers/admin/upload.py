import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel

from auth import get_current_user

router = APIRouter(prefix="/admin/upload", tags=["admin-upload"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 20 * 1024 * 1024  # 20MB

# 根据扩展名推断 MIME 类型
EXT_TO_MIME: dict[str, str] = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "static" / "uploads"


class UploadResult(BaseModel):
    url: str


def _upload_to_cloudinary(data: bytes, filename: str) -> str:
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(cloudinary_url=os.getenv("CLOUDINARY_URL"))
    public_id = f"tongai/{Path(filename).stem}-{uuid.uuid4().hex[:8]}"
    result = cloudinary.uploader.upload(
        data,
        public_id=public_id,
        resource_type="image",
        overwrite=True,
    )
    return result["secure_url"]


def _upload_to_local(data: bytes, filename: str) -> str:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ext = Path(filename).suffix or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / unique_name
    dest.write_bytes(data)
    # 返回可访问的相对路径（由 main.py 挂载的 /static 提供）
    return f"/static/uploads/{unique_name}"


@router.post("", response_model=UploadResult)
async def upload_image(
    file: UploadFile = File(...),
    _=Depends(get_current_user),
):
    # content_type 为空或不匹配时按扩展名推断
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    print(f"[upload] filename={file.filename!r}  content_type={content_type!r}")

    if content_type not in ALLOWED_TYPES:
        ext = Path(file.filename or "").suffix.lower()
        content_type = EXT_TO_MIME.get(ext, content_type)
        print(f"[upload] fallback by ext={ext!r}  resolved={content_type!r}")

    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型 '{file.content_type}'，仅支持 JPEG / PNG / WebP / GIF",
        )

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="文件大小不能超过 20MB")

    cloudinary_url = os.getenv("CLOUDINARY_URL")
    if cloudinary_url:
        url = _upload_to_cloudinary(data, file.filename or "upload.jpg")
    else:
        url = _upload_to_local(data, file.filename or "upload.jpg")

    return UploadResult(url=url)
