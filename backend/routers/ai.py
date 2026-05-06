import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import schemas

router = APIRouter(prefix="/ai", tags=["ai"])

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

DIFY_API_KEY = os.getenv("DIFY_API_KEY", "")
DIFY_API_URL = "https://api.dify.ai/v1/chat-messages"


@router.post("/rag", response_model=schemas.RAGResponse)
async def rag_query(payload: schemas.RAGRequest):
    if not DIFY_API_KEY:
        return schemas.RAGResponse(
            answer="AI 服务未配置，请联系管理员。",
            sources=[],
            conversation_id="",
        )

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                DIFY_API_URL,
                headers={
                    "Authorization": f"Bearer {DIFY_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    k: v for k, v in {
                        "inputs": {},
                        "query": payload.question,
                        "response_mode": "blocking",
                        "conversation_id": payload.conversation_id or None,
                        "user": "website-visitor",
                    }.items() if v is not None
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Dify 服务调用失败: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI 服务调用失败: {str(e)}")

    sources = []
    retriever_resources = data.get("metadata", {}).get("retriever_resources", [])
    for r in retriever_resources:
        if r.get("document_name"):
            sources.append(r["document_name"])

    return schemas.RAGResponse(
        answer=data["answer"],
        sources=list(set(sources)),
        conversation_id=data.get("conversation_id", ""),
    )


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
