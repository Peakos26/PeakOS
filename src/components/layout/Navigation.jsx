import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@context/ThemeContext'
import { useAuth } from '@context/AuthContext'
import { Home, Dumbbell, TrendingUp, Bot, Star, User, LogOut, BookOpen, Layout } from 'lucide-react'

const Navigation = () => {
  const { theme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    { id: 'treinos', label: 'Treinos', icon: Dumbbell, path: '/treinos' },
    { id: 'exercicios', label: 'Exercícios', icon: BookOpen, path: '/exercicios' },
    { id: 'programas', label: 'Programas', icon: Layout, path: '/programas' },
    { id: 'evolucao', label: 'Evolução', icon: TrendingUp, path: '/evolucao' },
    { id: 'ia', label: 'IA', icon: Bot, path: '/ia' },
    { id: 'features', label: 'Features', icon: Star, path: '/features' },
    { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil' },
  ]

  const currentPage = location.pathname === '/' ? 'home' : location.pathname.replace('/', '')
  
  // Mapear rotas especiais para itens de navegação
  const getActiveItem = () => {
    if (location.pathname === '/log-treino') return 'treinos'
    return currentPage
  }
  
  const activeItem = getActiveItem()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border)] md:top-16 md:bottom-0 md:w-64 md:border-t-0 md:border-r md:h-[calc(100vh-4rem)]">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:p-4 md:gap-2">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col md:flex-row items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeItem === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs md:text-sm">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col md:flex-row items-center gap-2 px-4 py-2 rounded-lg transition-colors text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-border)] md:mt-auto"
        >
          <LogOut size={20} />
          <span className="text-xs md:text-sm">Sair</span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
