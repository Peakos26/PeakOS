import { useTheme } from '@context/ThemeContext'
import { useAuth } from '@context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu } from 'lucide-react'
import { useState } from 'react'
import ProfileDrawer from './ProfileDrawer'

const APP_VERSION = '1.0.10'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Início', icon: '🏠', path: '/' },
    { id: 'treinos', label: 'Treinos', icon: '💪', path: '/treinos' },
    { id: 'evolucao', label: 'Evolução', icon: '📈', path: '/evolucao' },
    { id: 'ia', label: 'IA', icon: '🤖', path: '/ia' },
    { id: 'perfil', label: 'Perfil', icon: '👤', path: '/perfil' },
  ]

  const currentPage = location.pathname === '/' ? 'home' : location.pathname.replace('/', '')

  // Mapear rotas especiais para itens de navegação
  const getActiveItem = () => {
    if (location.pathname === '/log-treino') return 'treinos'
    return currentPage
  }

  const activeItem = getActiveItem()

  const handleNavClick = (path) => {
    navigate(path)
  }

  // Iniciais do nome para avatar
  const initials = session?.nome
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <>
      <header className="sticky top-0 z-30 bg-[var(--color-card)] border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-4 h-14">

          {/* Avatar — apenas mobile — abre drawer */}
          <button
            className="md:hidden w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground"
            onClick={() => setDrawerOpen(true)}
          >
            {initials}
          </button>

          {/* Logo — centralizado no mobile, à esquerda no desktop */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              Peak<span className="text-primary">OS</span>
            </span>
            <span className="text-xs text-[var(--color-muted)] hidden md:block">v{APP_VERSION}</span>
          </div>

          {/* Nav horizontal — apenas desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeItem === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Ações direita */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* Profile Drawer — apenas mobile */}
      <div className="md:hidden">
        <ProfileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </>
  )
}

export default Header
