// ========================
// 通用分页类型
// ========================
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ========================
// 作品集
// ========================
export interface Project {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  cover_url: string
  tech_tags: string[]
  patent_info: PatentInfo | null
  metrics: ProjectMetrics | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface PatentInfo {
  name: string
  status: string
  is_first_inventor: boolean
}

export interface ProjectMetrics {
  efficiency?: string
  award?: string
  coverage?: string
  [key: string]: string | undefined
}

// ========================
// 博文
// ========================
export interface Post {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  cover_url: string | null
  tags: string[]
  view_count: number
  is_published: boolean
  published_at: string
  updated_at: string
}

// ========================
// 评论
// ========================
export interface Comment {
  id: number
  post_id: number
  author_name: string
  content: string
  is_approved: boolean
  created_at: string
}

export interface CreateCommentPayload {
  post_id: number
  author_name: string
  content: string
}

// ========================
// 知识库（RAG）
// ========================
export interface KnowledgeDoc {
  id: number
  title: string
  content: string
}

// ========================
// 个人信息
// ========================
export interface PersonalInfo {
  name: string
  title: string
  bio: string
  avatar_url: string
  github: string
  linkedin: string
  email: string
  skills: SkillGroup[]
  experiences: WorkExperience[]
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface WorkExperience {
  company: string
  role: string
  start_date: string
  end_date: string | null
  description: string
}

// ========================
// AI 接口
// ========================
export interface RagRequest {
  question: string
  conversation_id?: string
}

export interface RagResponse {
  answer: string
  sources: string[]
  conversation_id: string
}

export interface AgentRequest {
  user_role: '决策者' | '使用者' | '观望者'
}

export interface AgentResponse {
  suggestion: string
}

// ========================
// 认证
// ========================
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface AuthUser {
  username: string
}
