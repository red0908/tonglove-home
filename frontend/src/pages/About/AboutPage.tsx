import { Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'

const EXPERIENCES = [
  {
    company: '某科技公司',
    role: '高级全栈工程师 / AI 研发负责人',
    period: '2022 — 至今',
    desc: '主导多项 AI 落地项目，完成语音质检、RAG 智能客服、多智能体系统的工程化实现，获企业创新奖。',
  },
  {
    company: '某互联网公司',
    role: '全栈工程师',
    period: '2018 — 2022',
    desc: '负责核心业务系统前后端开发，带领小团队完成多个千万级 DAU 产品迭代。',
  },
  {
    company: '某软件公司',
    role: '初级开发工程师',
    period: '2016 — 2018',
    desc: '参与 ToB SaaS 产品开发，积累扎实的工程基础。',
  },
]

const SKILL_GROUPS = [
  { category: '前端', items: ['React', 'TypeScript', 'Next.js', 'Vite', 'TailwindCSS', 'Vue 3'] },
  { category: '后端', items: ['FastAPI', 'Python', 'Node.js', 'PostgreSQL', 'Redis', 'SQLAlchemy'] },
  { category: 'AI / LLM', items: ['LangChain', 'RAG', 'DeepSeek', 'OpenAI API', 'Chroma', 'Prompt Engineering'] },
  { category: '工程', items: ['Docker', 'GitHub Actions', 'Nginx', 'Vercel', 'Railway', 'Git'] },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      {/* 个人简介 */}
      <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="h-32 w-32 shrink-0 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center shadow-lg">
          <span className="text-5xl font-bold text-white">张</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">彤爱</h1>
          <p className="mt-1 text-lg text-primary-600 font-medium">全栈 AI 开发工程师</p>
          <p className="mt-3 text-gray-600 leading-relaxed max-w-xl">
            8年全栈经验，2年专注AI工程落地。拥有3项AI相关发明专利，在语音质检、智能客服、多智能体决策等方向有丰富实践。
            致力于将大模型能力转化为真实的业务价值。
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition">
              <GithubIcon size={15} /> GitHub
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition">
              <LinkedinIcon size={15} /> LinkedIn
            </a>
            <a href="mailto:hello@example.com"
               className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition">
              <Mail size={15} /> 邮箱
            </a>
          </div>
        </div>
      </section>

      {/* 工作经历 */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">工作经历</h2>
        <div className="relative pl-6">
          <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200" />
          <div className="flex flex-col gap-8">
            {EXPERIENCES.map((exp, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border-2 border-primary-500 bg-white" />
                <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">{exp.period}</p>
                <h3 className="mt-0.5 font-semibold text-gray-900">{exp.role}</h3>
                <p className="text-sm font-medium text-gray-500">{exp.company}</p>
                <p className="mt-1.5 text-sm text-gray-600">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技能图谱 */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">技能图谱</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {SKILL_GROUPS.map(({ category, items }) => (
            <div key={category} className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
