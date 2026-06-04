import { useTheme } from '@context/ThemeContext'
import { Home, Dumbbell, TrendingUp, Bot, User, LogOut } from 'lucide-react'

const Navigation = ({ currentPage, setCurrentPage }) => {
  const { theme } = useTheme()

  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'treinos', label: 'Treinos', icon: Dumbbell },
    { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
    { id: 'ia', label: 'IA', icon: Bot },
    { id: 'perfil', label: 'Perfil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border)] md:top-16 md:bottom-0 md:w-64 md:border-t-0 md:border-r md:h-[calc(100vh-4rem)]">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:p-4 md:gap-2">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col md:flex-row items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs md:text-sm">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation
