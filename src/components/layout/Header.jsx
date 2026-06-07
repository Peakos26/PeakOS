import { useTheme } from '@context/ThemeContext'
import { useAuth } from '@context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useState } from 'react'

const APP_VERSION = '1.0.10'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Início', icon: '🏠', path: '/' },
    { id: 'treinos', label: 'Treinos', icon: '💪', path: '/treinos' },
    { id: 'evolucao', label: 'Evolução', icon: '📈', path: '/evolucao' },
    { id: 'ia', label: 'IA', icon: '🤖', path: '/ia' },
    { id: 'features', label: 'Features', icon: '⭐', path: '/features' },
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
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-card)] border-b border-[var(--color-border)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold font-display">
                Peak<span className="font-bold text-primary-600">OS</span>
              </h1>
              <p className="text-xs text-[var(--color-muted)]">v{APP_VERSION}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[var(--color-border)]">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full px-4 py-3 rounded-lg transition-colors text-left ${
                  activeItem === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
