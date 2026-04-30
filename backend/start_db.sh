#!/bin/bash
set -e  # 任何命令失败立即退出

CONTAINER_NAME="personal-postgres"
POSTGRES_USER="myuser"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="mydb"
PORT=5432

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "容器 ${CONTAINER_NAME} 已存在，启动中..."
    docker start ${CONTAINER_NAME}
else
    echo "创建并启动容器 ${CONTAINER_NAME}..."
    docker run --name ${CONTAINER_NAME} \
        -e POSTGRES_USER=${POSTGRES_USER} \
        -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
        -e POSTGRES_DB=${POSTGRES_DB} \
        -p ${PORT}:5432 \
        -v personal_postgres_data:/var/lib/postgresql/data \
        -d postgres:15
fi

echo "PostgreSQL 已启动，端口：${PORT}"
echo "连接字符串：postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PORT}/${POSTGRES_DB}"
