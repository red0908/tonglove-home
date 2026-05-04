"""
从环境变量自动创建管理员账号（用于生产环境启动时执行）。
需设置环境变量：ADMIN_USERNAME 和 ADMIN_PASSWORD
若账号已存在则跳过，不会报错。
"""
import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "").strip()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "").strip()


def main():
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        print("[init_admin] ADMIN_USERNAME 或 ADMIN_PASSWORD 未设置，跳过管理员初始化")
        return

    from database import SessionLocal
    from models import User
    from auth import get_password_hash

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if existing:
            print(f"[init_admin] 管理员 '{ADMIN_USERNAME}' 已存在，跳过")
            return
        user = User(username=ADMIN_USERNAME, hashed_password=get_password_hash(ADMIN_PASSWORD))
        db.add(user)
        db.commit()
        print(f"[init_admin] 管理员 '{ADMIN_USERNAME}' 创建成功")
    except Exception as e:
        db.rollback()
        print(f"[init_admin] 创建失败: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
