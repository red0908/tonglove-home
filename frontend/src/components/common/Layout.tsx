import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { AiChatWidget, AiFloatButton } from './AiChatWidget'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AiFloatButton />
      <AiChatWidget />
    </div>
  )
}
