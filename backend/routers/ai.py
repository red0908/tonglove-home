import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas

router = APIRouter(prefix="/ai", tags=["ai"])

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"


def _keyword_search(question: str, docs: list, top_k: int = 2) -> list:
    """简易关键词检索：按问题词在文档中的命中数排序，返回 top_k。"""
    q_words = set(question.lower().split())
    scored = []
    for doc in docs:
        text = (doc.title + " " + doc.content).lower()
        score = sum(1 for w in q_words if w in text)
        scored.append((score, doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [doc for _, doc in scored[:top_k] if _ > 0] or [doc for _, doc in scored[:top_k]]


@router.post("/rag", response_model=schemas.RAGResponse)
async def rag_query(payload: schemas.RAGRequest, db: Session = Depends(get_db)):
    docs = db.query(models.KnowledgeDoc).all()
    if not docs:
        return schemas.RAGResponse(answer="知识库暂无内容，请先在管理后台添加文档。", sources=[])

    top_docs = _keyword_search(payload.question, docs)
    context = "\n\n".join(f"【{d.title}】\n{d.content}" for d in top_docs)
    sources = [d.title for d in top_docs]

    if not DEEPSEEK_API_KEY:
        return schemas.RAGResponse(
            answer=f"（AI Key 未配置，以下为检索到的原文）\n\n{context}",
            sources=sources,
        )

    prompt = (
        f"你是一个个人助理，请基于以下资料回答用户问题。\n\n"
        f"资料：\n{context}\n\n"
        f"问题：{payload.question}\n\n"
        "请只根据资料回答，若资料无法回答则说'资料库中暂无相关信息'。"
    )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                DEEPSEEK_API_URL,
                headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                },
            )
            resp.raise_for_status()
            answer = resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI 服务调用失败: {str(e)}")

    return schemas.RAGResponse(answer=answer, sources=sources)


@router.post("/agent/demo", response_model=schemas.AgentResponse)
async def agent_demo(payload: schemas.AgentRequest):
    role_prompts = {
        "决策者": "你是一个AI采购决策顾问，请为决策者生成一段简洁有力的AI项目投资价值陈述（不超过150字）。",
        "使用者": "你是一个AI产品体验顾问，请为最终使用者生成一段贴近日常工作的AI工具使用收益描述（不超过150字）。",
        "观望者": "你是一个AI布道师，请为持观望态度的人生成一段消除顾虑、激发兴趣的AI入门建议（不超过150字）。",
    }
    system_prompt = role_prompts.get(
        payload.user_role,
        f"你是一个AI顾问，请针对'{payload.user_role}'角色生成一段推荐话术（不超过150字）。",
    )

    if not DEEPSEEK_API_KEY:
        return schemas.AgentResponse(
            suggestion=f"（AI Key 未配置）针对'{payload.user_role}'角色的推荐话术功能需要配置 DEEPSEEK_API_KEY 后启用。"
        )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                DEEPSEEK_API_URL,
                headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": system_prompt}],
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            suggestion = resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI 服务调用失败: {str(e)}")

    return schemas.AgentResponse(suggestion=suggestion)
