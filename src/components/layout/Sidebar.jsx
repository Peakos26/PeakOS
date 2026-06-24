import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import {
  Home, Dumbbell, Zap, Trophy, TrendingUp,
  UtensilsCrossed, Droplets, BarChart3, Camera,
  Moon, Heart, Brain, Clock, Activity,
  Ruler, Scan, Bot, Lightbulb, Target,
  Crown, Users, Settings, LogOut
} from 'lucide-react'

const MENU_ITEMS = [
  {
    group: 'TREINO',
    items: [
      { icon: Home, label: 'Início', to: '/' },
      { icon: Dumbbell, label: 'Treinos', to: '/treinos' },
      { icon: Zap, label: 'Gerador IA', to: '/gerador-treino' },
      { icon: Trophy, label: 'Tá Feito!', to: '/ta-feito' },
      { icon: TrendingUp, label: 'Evolução', to: '/evolucao' },
    ]
  },
  {
    group: 'NUTRIÇÃO',
    items: [
      { icon: UtensilsCrossed, label: 'Diário Alimentar', to: '/diario-alimentar' },
      { icon: Droplets, label: 'Água', to: '/hidratacao' },
      { icon: Camera, label: 'Foto IA', to: '/analise-alimento' },
    ]
  },
  {
    group: 'SAÚDE',
    items: [
      { icon: Moon, label: 'Sono', to: '/sono' },
      { icon: Heart, label: 'Recuperação', to: '/recuperacao' },
      { icon: Brain, label: 'Mindset', to: '/mindset' },
      { icon: Clock, label: 'Jejum', to: '/jejum' },
      { icon: Activity, label: 'Cardio', to: '/cardio' },
    ]
  },
  {
    group: 'CORPO',
    items: [
      { icon: Ruler, label: 'Medidas', to: '/medidas' },
      { icon: Scan, label: 'Scanner Corporal', to: '/scanner' },
    ]
  },
  {
    group: 'INTELIGÊNCIA',
    items: [
      { icon: Bot, label: 'Coach IA', to: '/ia' },
      { icon: Lightbulb, label: 'Insights Semanais', to: '/insights' },
      { icon: Target, label: 'Metas Inteligentes', to: '/metas-inteligentes' },
    ]
  },
  {
    group: 'CONTA',
    items: [
      { icon: Crown, label: 'Apoie o PeakOS', to: '/apoie' },
      { icon: Users, label: 'Comunidade', to: '/comunidade' },
    ]
  }
]

const Sidebar = ({ onClose }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
      {MENU_ITEMS.map((group) => (
        <SidebarGroup key={group.group} title={group.group}>
          {group.items.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </SidebarGroup>
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

const SidebarGroup = ({ title, children }) => {
  return (
    <div>
      <div className="text-xs text-[var(--color-muted)] uppercase tracking-widest px-4 mt-6 mb-2">
        {title}
      </div>
      {children}
    </div>
  )
}

const SidebarItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full ${
          isActive
            ? 'bg-primary-600 text-white'
            : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
        }`
      }
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </NavLink>
  )
}

export default Sidebar
