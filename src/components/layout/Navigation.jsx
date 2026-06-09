import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@context/ThemeContext'
import { useAuth } from '@context/AuthContext'
import { Home, Dumbbell, TrendingUp, Bot, Star, User, LogOut, BookOpen, Layout, Utensils, Droplets, Calculator, Moon, Battery, Brain, Clock, Activity, Ruler, Zap, Camera, Calendar, Target, Trophy, Flame, BarChart3, Pill, Smartphone } from 'lucide-react'

const Navigation = ({ isSidebar = false, isBottomNav = false, onClose }) => {
  const { theme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navGroups = [
    {
      title: 'TREINO',
      items: [
        { id: 'home', label: 'Início', icon: Home, path: '/' },
        { id: 'treinos', label: 'Treinos', icon: Dumbbell, path: '/treinos' },
        { id: 'gerador-treino', label: 'Gerador IA', icon: Zap, path: '/gerador-treino' },
        { id: 'evolucao', label: 'Evolução', icon: TrendingUp, path: '/evolucao' },
      ]
    },
    {
      title: 'NUTRIÇÃO',
      items: [
        { id: 'diario-alimentar', label: 'Diário', icon: Utensils, path: '/diario-alimentar' },
        { id: 'hidratacao', label: 'Água', icon: Droplets, path: '/hidratacao' },
        { id: 'macros', label: 'Macros', icon: Calculator, path: '/macros' },
      ]
    },
    {
      title: 'SAÚDE',
      items: [
        { id: 'sono', label: 'Sono', icon: Moon, path: '/sono' },
        { id: 'recuperacao', label: 'Recuperação', icon: Battery, path: '/recuperacao' },
        { id: 'mindset', label: 'Mindset', icon: Brain, path: '/mindset' },
        { id: 'jejum', label: 'Jejum', icon: Clock, path: '/jejum' },
        { id: 'cardio', label: 'Cardio', icon: Activity, path: '/cardio' },
      ]
    },
    {
      title: 'CORPO',
      items: [
        { id: 'medidas', label: 'Medidas', icon: Ruler, path: '/medidas' },
      ]
    },
    {
      title: 'INTELIGÊNCIA',
      items: [
        { id: 'ia', label: 'Coach IA', icon: Bot, path: '/ia' },
        { id: 'insights', label: 'Insights', icon: Calendar, path: '/insights' },
        { id: 'metas-inteligentes', label: 'Metas IA', icon: Target, path: '/metas-inteligentes' },
      ]
    },
    {
      title: 'CONTA',
      items: [
        { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil' },
        { id: 'features', label: 'Features', icon: Star, path: '/features' },
      ]
    },
    {
      title: 'EXTRAS',
      items: [
        { id: 'conquistas', label: 'Conquistas', icon: Trophy, path: '/conquistas' },
        { id: 'gamificacao', label: 'Gamificação', icon: Flame, path: '/gamificacao' },
        { id: 'dashboard-evolucao', label: 'Dashboard', icon: BarChart3, path: '/dashboard-evolucao' },
        { id: 'suplementacao', label: 'Suplementos', icon: Pill, path: '/suplementacao' },
        { id: 'integracoes', label: 'Integrações', icon: Smartphone, path: '/integracoes' },
        { id: 'exercicios', label: 'Exercícios', icon: BookOpen, path: '/exercicios' },
        { id: 'programas', label: 'Programas', icon: Layout, path: '/programas' },
      ]
    }
  ]

  // Itens exclusivos do menu hamburguer (não estão na barra inferior)
  const hamburgerExclusiveItems = [
    { id: 'scanner', label: 'Scanner Corporal', icon: Camera, path: '/scanner' },
    { id: 'features', label: 'Features Premium', icon: Star, path: '/features' },
    { id: 'comunidade', label: 'Comunidade', icon: User, path: '/comunidade' },
  ]

  const currentPage = location.pathname === '/' ? 'home' : location.pathname.replace('/', '')
  
  const getActiveItem = () => {
    if (location.pathname === '/log-treino') return 'treinos'
    return currentPage
  }
  
  const activeItem = getActiveItem()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = (path) => {
    navigate(path)
    if (onClose) onClose()
  }

  // Bottom Navigation (mobile)
  if (isBottomNav) {
    return (
      <nav className="flex items-center justify-around bg-[var(--color-card)] border-t border-[var(--color-border)] h-16 px-2">
        {navGroups.flatMap(group => group.items).filter(item =>
          ['home', 'treinos', 'evolucao', 'ia', 'perfil'].includes(item.id)
        ).map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                activeItem === item.id
                  ? 'text-primary-600'
                  : 'text-[var(--color-muted)]'
              }`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  // Sidebar (desktop e mobile overlay)
  if (isSidebar) {
    return (
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        {/* Botão fechar — apenas mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden self-end mb-4 p-2"
          >
            ✕
          </button>
        )}

        {/* Logo no topo da sidebar */}
        <div className="mb-6">
          <span className="text-xl">
            <span className="font-bold text-white">Peak</span>
            <span className="font-black text-[#84CC16]">OS</span>
          </span>
        </div>

        {/* Grupos de menu */}
        {navGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {groupIndex > 0 && (
              <div className="border-t border-[var(--color-border)] my-4" />
            )}
            <div className="text-xs text-[var(--color-muted)] uppercase tracking-widest px-4 mt-6 mb-2">
              {group.title}
            </div>
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full ${
                    activeItem === item.id
                      ? 'bg-primary-600 text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}

        {/* Botão Sair */}
        <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-border)] w-full"
          >
            <LogOut size={20} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>
    )
  }

  // Comportamento padrão (legado - não usado mais)
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border)] md:top-16 md:bottom-0 md:w-64 md:border-t-0 md:border-r md:h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:p-4 md:gap-2 overflow-x-auto md:overflow-visible">
        {/* Mobile: mostrar apenas itens da barra inferior */}
        <div className="flex md:hidden">
          {navGroups.flatMap(group => group.items).filter(item =>
            ['home', 'treinos', 'evolucao', 'ia', 'perfil'].includes(item.id)
          ).map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  activeItem === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Desktop: mostrar com agrupamento */}
        <div className="hidden md:flex flex-col w-full">
          {navGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {groupIndex > 0 && (
                <div className="border-t border-[var(--color-border)] my-4" />
              )}
              <div className="text-xs text-[var(--color-muted)] uppercase tracking-widest px-4 mt-6 mb-2">
                {group.title}
              </div>
              {group.items.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full ${
                      activeItem === item.id
                        ? 'bg-primary-600 text-white'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}

          <div className="border-t border-[var(--color-border)] my-4" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-[var(--color-muted)] hover:text-red-400 hover:bg-[var(--color-border)] w-full"
          >
            <LogOut size={20} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
