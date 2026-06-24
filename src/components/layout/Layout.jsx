import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import CoachFAB from '@components/ui/CoachFAB'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      <div className="flex flex-col md:flex-row">

        {/* Sidebar — visível em tablet e desktop */}
        <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-[var(--color-border)]">
          <Sidebar />
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 pb-20 md:pb-0 min-h-screen w-full" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
          <Header />
          {children}
        </main>

      </div>

      {/* Bottom Navigation — visível apenas no mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </nav>

      {/* Coach FAB — aparece em todas as páginas exceto /ia */}
      <CoachFAB />

    </div>
  )
}

export default Layout
