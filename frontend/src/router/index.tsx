import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/common/Layout'
import { AdminLayout } from '@/components/common/AdminLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

// 公开页面
import { HomePage } from '@/pages/Home/HomePage'
import { ProjectListPage } from '@/pages/Projects/ProjectListPage'
import { ProjectDetailPage } from '@/pages/Projects/ProjectDetailPage'
import { PostListPage } from '@/pages/Posts/PostListPage'
import { PostDetailPage } from '@/pages/Posts/PostDetailPage'
import { AIPlaygroundPage } from '@/pages/AI/AIPlaygroundPage'
import { AboutPage } from '@/pages/About/AboutPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// 管理后台
import { AdminLoginPage } from '@/pages/Admin/AdminLoginPage'
import { AdminDashboard } from '@/pages/Admin/AdminDashboard'
import { AdminProjects } from '@/pages/Admin/AdminProjects'
import { AdminPosts } from '@/pages/Admin/AdminPosts'
import { AdminKnowledge } from '@/pages/Admin/AdminKnowledge'
import { AdminComments } from '@/pages/Admin/AdminComments'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectListPage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      { path: 'posts', element: <PostListPage /> },
      { path: 'posts/:slug', element: <PostDetailPage /> },
      { path: 'ai', element: <AIPlaygroundPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'projects', element: <AdminProjects /> },
          { path: 'posts', element: <AdminPosts /> },
          { path: 'knowledge', element: <AdminKnowledge /> },
          { path: 'comments', element: <AdminComments /> },
        ],
      },
    ],
  },
])
