import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@context/ThemeContext'
import { useAuth } from '@context/AuthContext'
import { Home, Dumbbell, TrendingUp, Bot, Star, User, LogOut, BookOpen, Layout, Utensils, Droplets, Calculator, Moon, Battery, Brain, Clock, Activity, Ruler, Zap, Camera, Calendar, Target, Trophy, Flame, BarChart3 } from 'lucide-react'

const Navigation = () => {
  const { theme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    { id: 'treinos', label: 'Treinos', icon: Dumbbell, path: '/treinos' },
    { id: 'diario-alimentar', label: 'Diário', icon: Utensils, path: '/diario-alimentar' },
    { id: 'hidratacao', label: 'Água', icon: Droplets, path: '/hidratacao' },
    { id: 'macros', label: 'Macros', icon: Calculator, path: '/macros' },
    { id: 'sono', label: 'Sono', icon: Moon, path: '/sono' },
    { id: 'recuperacao', label: 'Recuperação', icon: Battery, path: '/recuperacao' },
    { id: 'mindset', label: 'Mindset', icon: Brain, path: '/mindset' },
    { id: 'jejum', label: 'Jejum', icon: Clock, path: '/jejum' },
    { id: 'cardio', label: 'Cardio', icon: Activity, path: '/cardio' },
    { id: 'medidas', label: 'Medidas', icon: Ruler, path: '/medidas' },
    { id: 'gerador-treino', label: 'Gerador IA', icon: Zap, path: '/gerador-treino' },
    { id: 'analise-alimento', label: 'Foto IA', icon: Camera, path: '/analise-alimento' },
    { id: 'insights', label: 'Insights', icon: Calendar, path: '/insights' },
    { id: 'metas-inteligentes', label: 'Metas IA', icon: Target, path: '/metas-inteligentes' },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy, path: '/conquistas' },
    { id: 'gamificacao', label: 'Gamificação', icon: Flame, path: '/gamificacao' },
    { id: 'dashboard-evolucao', label: 'Dashboard', icon: BarChart3, path: '/dashboard-evolucao' },
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
      <div className="flex md:flex-col items-center justify-around md:justify-start md:p-4 md:gap-2 overflow-x-auto md:overflow-visible">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col md:flex-row items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
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
          className="flex flex-col md:flex-row items-center gap-2 px-4 py-2 rounded-lg transition-colors text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-border)] md:mt-auto flex-shrink-0"
        >
          <LogOut size={20} />
          <span className="text-xs md:text-sm">Sair</span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
