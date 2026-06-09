import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { LogOut } from 'lucide-react'

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
      <SidebarGroup title="TREINO">
        <SidebarItem to="/" icon="🏠" label="Início" />
        <SidebarItem to="/treinos" icon="🏋️" label="Treinos" />
        <SidebarItem to="/gerador-treino" icon="⚡" label="Gerador IA" />
        <SidebarItem to="/ta-feito" icon="💪" label="Tá Feito!" />
        <SidebarItem to="/evolucao" icon="📈" label="Evolução" />
      </SidebarGroup>

      <SidebarGroup title="NUTRIÇÃO">
        <SidebarItem to="/diario-alimentar" icon="🍽️" label="Diário" />
        <SidebarItem to="/hidratacao" icon="💧" label="Água" />
        <SidebarItem to="/macros" icon="📊" label="Macros" />
      </SidebarGroup>

      <SidebarGroup title="SAÚDE">
        <SidebarItem to="/sono" icon="🌙" label="Sono" />
        <SidebarItem to="/recuperacao" icon="💪" label="Recuperação" />
        <SidebarItem to="/mindset" icon="🧘" label="Mindset" />
        <SidebarItem to="/jejum" icon="⏱️" label="Jejum" />
        <SidebarItem to="/cardio" icon="❤️" label="Cardio" />
      </SidebarGroup>

      <SidebarGroup title="CORPO">
        <SidebarItem to="/medidas" icon="📏" label="Medidas" />
        <SidebarItem to="/scanner" icon="📸" label="Scanner" />
      </SidebarGroup>

      <SidebarGroup title="INTELIGÊNCIA">
        <SidebarItem to="/ia" icon="🤖" label="Coach IA" />
        <SidebarItem to="/insights" icon="💡" label="Insights" />
        <SidebarItem to="/metas-inteligentes" icon="🎯" label="Metas IA" />
      </SidebarGroup>

      <SidebarGroup title="CONTA">
        <SidebarItem to="/features" icon="👑" label="Features" />
        <SidebarItem to="/comunidade" icon="👥" label="Comunidade" />
      </SidebarGroup>

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

const SidebarItem = ({ to, icon, label }) => {
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
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </NavLink>
  )
}

export default Sidebar
