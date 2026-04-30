"""
运行此脚本创建管理员账户：
    python create_admin.py
"""
import os
from dotenv import load_dotenv

load_dotenv()

from database import SessionLocal
from models import User
from auth import get_password_hash

def main():
    username = input("请输入管理员用户名: ").strip()
    password = input("请输入管理员密码: ").strip()
    if not username or not password:
        print("用户名和密码不能为空")
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"用户 '{username}' 已存在")
            return
        user = User(username=username, hashed_password=get_password_hash(password))
        db.add(user)
        db.commit()
        print(f"管理员账户 '{username}' 创建成功！")
    except Exception as e:
        db.rollback()
        print(f"创建失败: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
