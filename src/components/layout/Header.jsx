import { useTheme } from '@context/ThemeContext'
import { useAuth } from '@context/AuthContext'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Header = ({ currentPage, setCurrentPage }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'treinos', label: 'Treinos', icon: '💪' },
    { id: 'evolucao', label: 'Evolução', icon: '📈' },
    { id: 'ia', label: 'IA', icon: '🤖' },
    { id: 'perfil', label: 'Perfil', icon: '👤' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-card)] border-b border-[var(--color-border)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display">PeakOS</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
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
                onClick={() => {
                  setCurrentPage(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full px-4 py-3 rounded-lg transition-colors text-left ${
                  currentPage === item.id
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
