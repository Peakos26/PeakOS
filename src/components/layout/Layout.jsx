import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      <div className="flex flex-col md:flex-row">

        {/* Sidebar — visível em tablet e desktop */}
        <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-[var(--color-border)]">
          <Sidebar />
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 pb-20 md:pb-0 min-h-screen w-full">
          {children}
        </main>

      </div>

      {/* Bottom Navigation — visível apenas no mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </nav>

    </div>
  )
}

export default Layout
