# AI 体验专区升级规划：Dify + DeepSeek RAG

> 文档版本：v1.0  
> 创建日期：2026-05-05  
> 状态：规划中

---

## 一、现状分析

### 1.1 已有功能

官网 `/ai` 页面（`AIPlaygroundPage.tsx`）已上线两个 Demo：

| Demo | 实现方式 | 状态 |
|------|----------|------|
| Demo 1：智能 RAG 问答 | 关键词粗排 + DeepSeek Chat | 已上线，RAG 质量弱 |
| Demo 2：虚拟 Agent 话术生成 | 按角色选 Prompt + DeepSeek Chat | 已上线，有角色枚举 Bug |

全局悬浮 AI 助手（`AiChatWidget.tsx`）复用同一套 RAG 接口。

### 1.2 已有资源

- **DeepSeek API Key**：已配置在 `backend/.env`，`deepseek-chat` 模型调用正常
- **Dify 经验**：熟悉 Dify 工作流编排与知识库管理
- **后端知识库表**：`KnowledgeDoc`（title + content），通过管理后台可 CRUD

### 1.3 当前 RAG 的核心缺陷

```python
# 现有检索：简单关键词词频匹配
def _keyword_search(question: str, docs: list, top_k: int = 2):
    q_words = set(question.lower().split())
    score = sum(1 for w in q_words if w in text)
```

| 问题 | 影响 |
|------|------|
| 无语义理解，只做词频匹配 | "你有哪些项目经验" 无法匹配"项目案例"文档 |
| Top-K 固定为 2，无阈值过滤 | 不相关文档也会被拼入 context |
| 无 Embedding 向量检索 | 近义词、同义句无法命中 |
| Agent Demo 角色 Bug | 前端传 `decision_maker`，后端只识别中文 `决策者` |
| 知识库内容依赖手动录入 | 官网信息更新后知识库不同步 |

---

## 二、目标与定位

### 2.1 核心目标

> **将官网打造成一个"会介绍自己"的 AI 站点**：访客可以用自然语言问任何关于我的问题，AI 基于真实内容精准回答，同时展示 RAG + Dify 工程能力。

### 2.2 功能目标

- [ ] 基于 Dify 知识库 + 向量检索替换现有关键词 RAG
- [ ] 知识库覆盖官网所有核心内容（项目、文章、关于我、专利等）
- [ ] 修复 Agent Demo 角色枚举问题
- [ ] 支持多轮对话上下文（当前为单轮）
- [ ] 悬浮助手升级为更智能的问答体验
- [ ] 管理后台支持一键同步官网内容到知识库

---

## 三、技术架构方案

### 3.1 整体架构

```
用户提问
    │
    ▼
前端（React）
    │  POST /api/v1/ai/rag
    ▼
FastAPI 后端（ai.py）
    │  HTTP 调用 Dify API
    ▼
Dify 平台
    ├─ 知识库检索（向量检索，Embedding 模型）
    │      └─ 召回 Top-K 相关文档片段
    ├─ LLM 生成（DeepSeek API）
    │      └─ 基于检索结果生成回答
    └─ 返回 answer + sources
    │
    ▼
FastAPI 格式化响应
    │
    ▼
前端展示答案 + 来源引用
```

### 3.2 方案选型：为什么选 Dify

| 维度 | 自建向量 RAG（Chroma/Weaviate） | Dify 托管 RAG |
|------|-------------------------------|---------------|
| 开发成本 | 高（需自写 chunking、embedding、检索管线） | 低（UI 配置即可） |
| 检索质量 | 取决于自己的实现 | 开箱即用的混合检索（向量+关键词） |
| 知识库管理 | 需开发后台界面 | Dify 自带美观管理 UI |
| 工作流编排 | 需自建 | 可视化拖拽 |
| 与 DeepSeek 集成 | 需手动对接 | Dify 已集成，直接配置 |
| 运维 | 需维护向量数据库 | Dify Cloud 免运维 |
| **结论** | 适合深度定制 | **适合快速落地，适合本项目** |

### 3.3 Dify 接入方式

Dify 提供两种调用方式，推荐使用**对话型应用 API**：

```
Dify 应用类型：对话型应用（Chatbot）
调用端点：POST https://api.dify.ai/v1/chat-messages
认证方式：Authorization: Bearer {DIFY_API_KEY}
```

后端只需将现有 `ai.py` 中的 DeepSeek 直接调用替换为 Dify API 调用：

```python
# 新的 ai.py 调用逻辑（伪代码）
async def call_dify_rag(question: str, conversation_id: str = "") -> dict:
    payload = {
        "inputs": {},
        "query": question,
        "response_mode": "blocking",
        "conversation_id": conversation_id,
        "user": "website-visitor",
    }
    resp = await httpx_client.post(
        "https://api.dify.ai/v1/chat-messages",
        headers={"Authorization": f"Bearer {DIFY_API_KEY}"},
        json=payload,
    )
    data = resp.json()
    return {
        "answer": data["answer"],
        "conversation_id": data["conversation_id"],
        "sources": extract_sources(data.get("metadata", {})),
    }
```

---

## 四、知识库内容规划

### 4.1 知识库分类

| 知识库名称 | 内容来源 | 更新频率 |
|-----------|---------|---------|
| `个人简介` | About 页面、自我介绍文本 | 低（半年一次） |
| `项目案例` | Projects 页面所有项目 | 中（新项目时） |
| `博客文章` | Posts 页面已发布文章 | 高（持续更新） |
| `技术专利` | 专利描述（现有 RAG 文档中提及） | 低 |
| `AI 能力介绍` | AI 体验专区说明、工具使用经验 | 中 |
| `联系与合作` | 联系方式、合作意向说明 | 低 |

### 4.2 文档分块策略（Chunk Strategy）

```
推荐参数（在 Dify 知识库设置中配置）：
- 分块方式：按段落 + 最大 Token 限制
- 最大 Token 数：512 tokens / chunk
- 重叠 Token：50 tokens（保持上下文连贯）
- 检索方式：混合检索（向量 + 关键词）
- Top-K：3
- 相关度阈值：0.5
```

### 4.3 典型问答覆盖（QA 测试用例）

| 用户问题类型 | 期望命中的知识库 |
|------------|----------------|
| "你做过哪些 AI 项目？" | 项目案例 |
| "你有哪些专利？" | 技术专利 |
| "你熟悉哪些技术栈？" | 个人简介 + 项目案例 |
| "如何与你合作？" | 联系与合作 |
| "你写过关于 RAG 的文章吗？" | 博客文章 |
| "你用过 Dify 吗？" | AI 能力介绍 |

---

## 五、实施路线图

### Phase 1：Dify 知识库搭建（预计 1-2 天）

**步骤 1：Dify 平台配置**
1. 登录 [cloud.dify.ai](https://cloud.dify.ai)，创建新工作区
2. 在「模型供应商」中配置 DeepSeek API Key
3. 配置 Embedding 模型（推荐：`text-embedding-3-small` via OpenAI，或 DeepSeek 兼容端点）

**步骤 2：创建知识库**
1. 创建「官网知识库」
2. 按上述分类上传初始文档（Markdown / TXT 格式）
3. 等待向量化完成，测试检索效果

**步骤 3：创建对话型应用**
1. 新建「AI 助手」对话型应用
2. 关联「官网知识库」
3. 配置系统提示词（见附录 A）
4. 获取 API Key

---

### Phase 2：后端接入 Dify（预计 0.5 天）

**修改 `backend/routers/ai.py`**：

```python
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "")
DIFY_API_URL = "https://api.dify.ai/v1/chat-messages"

@router.post("/rag", response_model=schemas.RAGResponse)
async def rag_query(payload: schemas.RAGRequest, db: Session = Depends(get_db)):
    if not DIFY_API_KEY:
        return schemas.RAGResponse(answer="AI 服务未配置，请联系管理员。", sources=[])
    
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            DIFY_API_URL,
            headers={"Authorization": f"Bearer {DIFY_API_KEY}", "Content-Type": "application/json"},
            json={
                "inputs": {},
                "query": payload.question,
                "response_mode": "blocking",
                "conversation_id": payload.conversation_id or "",
                "user": "website-visitor",
            },
        )
        resp.raise_for_status()
        data = resp.json()
    
    # 提取引用来源
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
```

**新增环境变量** `backend/.env`：
```
DIFY_API_KEY=app-xxxxxxxxxxxxxxxx
```

**Schema 扩展** `backend/schemas.py`：
```python
class RAGRequest(BaseModel):
    question: str
    conversation_id: str = ""   # 支持多轮对话

class RAGResponse(BaseModel):
    answer: str
    sources: list[str]
    conversation_id: str = ""   # 回传给前端保持上下文
```

---

### Phase 3：前端升级（预计 1 天）

**3.1 修复 Agent Demo 角色 Bug**

```typescript
// 前端角色值改为与后端一致
const ROLE_OPTIONS = [
  { value: '决策者', label: '决策者', desc: '关注 ROI、风险与战略价值' },
  { value: '使用者', label: '使用者', desc: '关注易用性、效率与日常体验' },
  { value: '观望者', label: '观望者', desc: '关注技术成熟度与行业趋势' },
]
```

**3.2 RAG 对话支持多轮**

```typescript
const [conversationId, setConversationId] = useState('')

// 发送时携带 conversation_id
const resp = await aiApi.rag({ question: q, conversation_id: conversationId })
// 保存新的 conversation_id
setConversationId(resp.conversation_id)
```

**3.3 展示引用来源（已有，优化显示）**

当前 `sources` 只显示文档标题，升级后可显示具体片段内容（Dify 返回 `content` 字段）。

**3.4 新增「清空对话」按钮**

多轮对话模式下，需要支持重置 `conversationId` 开启新会话。

---

### Phase 4：知识库自动同步（预计 1-2 天，可选）

在管理后台新增「同步到 AI 知识库」功能：

```
管理后台 → 文章/项目编辑器 → 保存 → 触发同步
     │
     ▼
backend/routers/admin/knowledge_sync.py
     │  调用 Dify Dataset API
     ▼
Dify 知识库（自动更新文档）
```

Dify 提供 Dataset API 支持程序化上传/更新文档：
```
POST https://api.dify.ai/v1/datasets/{dataset_id}/document/create_by_text
Authorization: Bearer {DIFY_DATASET_API_KEY}
```

---

## 六、系统提示词设计（附录 A）

```
你是张润桐（Runtong Zhang）的个人网站智能助手，名叫「同 AI」。

你的职责：
- 用友好、专业的语气回答关于张润桐的问题
- 基于知识库内容精准回答，不编造信息
- 如果知识库中没有相关内容，诚实告知并引导用户查看具体页面

你擅长介绍：
- 张润桐的 AI 项目经验与技术专利
- 他写过的技术博客和案例
- 合作意向与联系方式

语气要求：
- 中文为主，专业但不生硬
- 回答简洁，关键信息用列表或加粗突出
- 适当引导用户探索网站其他内容

如果用户问的内容知识库无法覆盖，回复：
"这个问题我暂时没有相关资料，你可以直接在[联系页]留言或发邮件给他～"
```

---

## 七、成本与资源估算

| 资源 | 用量估算 | 费用 |
|------|---------|------|
| Dify Cloud 免费版 | 200 消息/月 | 免费（个人展示足够） |
| Dify Cloud 专业版 | 5000 消息/月 | $59/月（按需升级） |
| DeepSeek API | ~100 次/天，约 500 Token/次 | ≈ $0.5/天（极低） |
| Embedding | 初始化一次性 | < $1 |
| **合计** | 个人展示场景 | **近乎免费** |

> 注：DeepSeek `deepseek-chat` 定价约 $0.14/百万 Token（input），极为经济。

---

## 八、知识库初始内容准备清单

完成 Phase 1 前，需准备以下 Markdown 文档：

```
docs/knowledge-base/
├── 01_个人简介.md          # 姓名、背景、专业方向、工作经历
├── 02_技术专长.md          # 技术栈、熟悉的框架工具
├── 03_项目案例/
│   ├── 项目A.md
│   └── 项目B.md
├── 04_AI能力介绍.md        # RAG、Dify、DeepSeek、多智能体经验
├── 05_技术专利.md          # 专利名称、摘要、应用场景
├── 06_博客精选.md          # 代表性文章摘要
└── 07_联系与合作.md        # 邮箱、社交媒体、合作意向
```

---

## 九、验收标准

| 功能点 | 验收方式 |
|--------|---------|
| RAG 问答语义准确 | 测试用例 10 条，命中率 ≥ 80% |
| 多轮对话 | 连续追问可保持上下文 |
| 来源引用展示 | 每条回答显示知识库来源文档名 |
| Agent Demo Bug 修复 | 三种角色均能生成不同话术 |
| 响应速度 | 首 Token < 3 秒（blocking 模式） |
| 知识库覆盖度 | 上述 7 类文档全部入库 |

---

## 十、后续扩展方向

| 方向 | 技术方案 | 优先级 |
|------|---------|--------|
| 流式输出（打字机效果） | Dify SSE 模式 + 前端 EventSource | 高 |
| 访客提问统计分析 | 记录问题到 DB，分析热门话题 | 中 |
| 知识库定期自动同步 | Cron Job + Dify Dataset API | 中 |
| 多语言支持（英文） | Dify 多语言知识库 + 语言检测 | 低 |
| 语音输入 | Web Speech API + 转文字发送 | 低 |

---

*文档由 Cursor AI 辅助生成，基于现有代码库分析。*
