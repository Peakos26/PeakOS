import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { 
  Dumbbell, 
  Zap, 
  TrendingUp, 
  Utensils, 
  Droplets, 
  BarChart3, 
  Moon, 
  Heart, 
  Brain, 
  Clock, 
  Ruler, 
  Camera, 
  Bot, 
  Lightbulb, 
  Target, 
  Crown, 
  Users, 
  Settings, 
  LogOut,
  X,
  Trophy
} from 'lucide-react'

const ProfileDrawer = ({ isOpen, onClose }) => {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleNavigate = (path) => {
    navigate(path)
    // Não fecha o drawer ao navegar
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!isOpen) return null

  // Iniciais do nome para avatar
  const initials = session?.nome
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <>
      {/* Overlay escuro com blur - não fecha ao clicar */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
      />

      {/* Drawer lateral esquerdo com animação */}
      <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-[#1C1C1E] z-50 flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out">

        {/* Header do drawer */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#84CC16] to-[#65A30D] flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white hover:bg-[#3C3C3E] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {/* Nome e email */}
          <div className="font-bold text-lg text-white">{session?.nome}</div>
          <div className="text-[#6e6e73] text-sm">@{session?.email}</div>
        </div>

        <div className="border-t border-[#2C2C2E]" />

        {/* Menu principal */}
        <nav className="flex-1 p-4 space-y-1">

          <DrawerGroup title="TREINO">
            <DrawerItem icon={<Dumbbell size={20} />} label="Treinos" onClick={() => handleNavigate('/treinos')} />
            <DrawerItem icon={<Zap size={20} />} label="Gerador IA" onClick={() => handleNavigate('/gerador-treino')} />
            <DrawerItem icon={<Trophy size={20} />} label="Tá Feito!" onClick={() => handleNavigate('/ta-feito')} />
            <DrawerItem icon={<TrendingUp size={20} />} label="Evolução" onClick={() => handleNavigate('/evolucao')} />
          </DrawerGroup>

          <DrawerGroup title="NUTRIÇÃO">
            <DrawerItem icon={<Utensils size={20} />} label="Diário Alimentar" onClick={() => handleNavigate('/diario-alimentar')} />
            <DrawerItem icon={<Droplets size={20} />} label="Água" onClick={() => handleNavigate('/hidratacao')} />
            <DrawerItem icon={<BarChart3 size={20} />} label="Macros" onClick={() => handleNavigate('/macros')} />
            <DrawerItem icon={<Camera size={20} />} label="Foto IA" onClick={() => handleNavigate('/analise-alimento')} />
          </DrawerGroup>

          <DrawerGroup title="SAÚDE">
            <DrawerItem icon={<Moon size={20} />} label="Sono" onClick={() => handleNavigate('/sono')} />
            <DrawerItem icon={<Heart size={20} />} label="Recuperação" onClick={() => handleNavigate('/recuperacao')} />
            <DrawerItem icon={<Brain size={20} />} label="Mindset" onClick={() => handleNavigate('/mindset')} />
            <DrawerItem icon={<Clock size={20} />} label="Jejum" onClick={() => handleNavigate('/jejum')} />
            <DrawerItem icon={<Heart size={20} />} label="Cardio" onClick={() => handleNavigate('/cardio')} />
          </DrawerGroup>

          <DrawerGroup title="CORPO">
            <DrawerItem icon={<Ruler size={20} />} label="Medidas" onClick={() => handleNavigate('/medidas')} />
            <DrawerItem icon={<Camera size={20} />} label="Scanner Corporal" onClick={() => handleNavigate('/scanner')} />
          </DrawerGroup>

          <DrawerGroup title="INTELIGÊNCIA">
            <DrawerItem icon={<Bot size={20} />} label="Coach IA" onClick={() => handleNavigate('/ia')} />
            <DrawerItem icon={<Lightbulb size={20} />} label="Insights Semanais" onClick={() => handleNavigate('/insights')} />
            <DrawerItem icon={<Target size={20} />} label="Metas Inteligentes" onClick={() => handleNavigate('/metas-inteligentes')} />
          </DrawerGroup>

          <DrawerGroup title="CONTA">
            <DrawerItem icon={<Crown size={20} />} label="Apoie o PeakOS" onClick={() => handleNavigate('/apoie')} />
            <DrawerItem icon={<Users size={20} />} label="Comunidade" onClick={() => handleNavigate('/comunidade')} />
          </DrawerGroup>

        </nav>

        {/* Footer do drawer */}
        <div className="border-t border-[#2C2C2E] p-4 space-y-1">
          <DrawerItem icon={<Settings size={20} />} label="Configurações" onClick={() => handleNavigate('/perfil')} />
          <DrawerItem
            icon={<LogOut size={20} />}
            label="Sair"
            onClick={handleLogout}
            className="text-red-500"
          />
        </div>

      </div>
    </>
  )
}

const DrawerGroup = ({ title, children }) => (
  <div className="mb-4">
    <div className="text-xs text-[#6e6e73] uppercase tracking-widest px-3 mb-1">{title}</div>
    {children}
  </div>
)

const DrawerItem = ({ icon, label, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#2C2C2E] transition-colors text-left text-white ${className}`}
  >
    {icon}
    <span className="text-base font-medium">{label}</span>
  </button>
)

export default ProfileDrawer
