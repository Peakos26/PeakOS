import { useAuth } from '@context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Menu, Lightbulb, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import ProfileDrawer from '@components/layout/ProfileDrawer'
import { NotificationBell } from '@components/NotificationBell'
import { database, ref, get, set } from '@config/firebase.config'

const wisdomMessages = [
  "Disciplina supera motivação.",
  "O progresso é construído nos dias comuns.",
  "Pequenas ações criam grandes resultados.",
  "Consistência é a chave do sucesso.",
  "Cada dia é uma nova oportunidade.",
  "O esforço de hoje é o resultado de amanhã.",
  "Não desista, continue avançando.",
  "Seu limite é apenas o começo.",
  "A transformação acontece diariamente.",
  "Foco no processo, o resultado vem naturalmente."
]

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

const HeaderSummary = ({ showActions = true }) => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentWisdom, setCurrentWisdom] = useState(wisdomMessages[0])

  const handleCheckIn = async () => {
    if (!session) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const encodedKey = encodeTokenKey(session.tokenKey)
      const checkInRef = ref(database, `checkins/${encodedKey}/${today}`)
      
      // Verificar se já fez check-in hoje
      const snapshot = await get(checkInRef)
      if (snapshot.exists()) {
        alert('Você já fez check-in hoje!')
        navigate('/evolucao')
        return
      }

      // Fazer check-in
      await set(checkInRef, {
        date: today,
        timestamp: Date.now(),
        tokenKey: session.tokenKey
      })

      alert('Check-in realizado com sucesso!')
      navigate('/evolucao')
    } catch (error) {
      console.error('Erro ao fazer check-in:', error)
      alert('Erro ao fazer check-in')
    }
  }

  const navItems = [
    { id: 'home', label: 'Início', path: '/' },
    { id: 'treinos', label: 'Treinos', path: '/treinos' },
    { id: 'evolucao', label: 'Evolução', path: '/evolucao' },
    { id: 'ia', label: 'IA', path: '/ia' },
    { id: 'perfil', label: 'Perfil', path: '/perfil' },
  ]

  const currentPage = location.pathname === '/' ? 'home' : location.pathname.replace('/', '')

  const getActiveItem = () => {
    if (location.pathname === '/log-treino') return 'treinos'
    return currentPage
  }

  const activeItem = getActiveItem()

  const handleNavClick = (path) => {
    navigate(path)
  }

  const handleWisdomClick = () => {
    let newWisdom
    do {
      newWisdom = wisdomMessages[Math.floor(Math.random() * wisdomMessages.length)]
    } while (newWisdom === currentWisdom)
    setCurrentWisdom(newWisdom)
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
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 mb-3 sm:mb-4">
        <div className="flex items-center justify-between">
        {/* Avatar — apenas mobile — abre drawer */}
        <button
          className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#84CC16] to-[#65A30D] flex items-center justify-center text-white font-bold text-xs sm:text-sm"
          onClick={() => setDrawerOpen(true)}
        >
          {initials}
        </button>

        {/* Logo PeakOS */}
        <div className="text-xl sm:text-2xl">
          <span className="font-bold text-white">Peak</span>
          <span className="font-black text-[#84CC16]">OS</span>
        </div>

        {/* Ações direita */}
        {showActions && (
          <div className="flex items-center gap-2">
            {/* Sabedoria do Dia */}
            <button
              onClick={handleWisdomClick}
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white hover:bg-[#3C3C3E] transition-colors"
              title="Sabedoria do Dia"
            >
              <Lightbulb size={18} />
            </button>

            {/* Check-in */}
            <button
              onClick={handleCheckIn}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#84CC16] flex items-center justify-center text-white hover:bg-[#65A30D] transition-colors"
              title="Check-in"
            >
              <CheckCircle size={18} />
            </button>

            {/* Notificação */}
            <NotificationBell />

            {/* Hamburger — apenas desktop */}
            <button
              className="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white hover:bg-[#3C3C3E] transition-colors"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        )}

        {/* Hamburger — sempre visível quando showActions é false */}
        {!showActions && (
          <button
            className="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white hover:bg-[#3C3C3E] transition-colors"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={18} />
          </button>
        )}
        </div>
      </div>

      {/* Sabedoria do Dia — mobile */}
      <div className="sm:hidden mb-3">
        <button
          onClick={handleWisdomClick}
          className="w-full p-3 rounded-xl bg-[#2C2C2E] text-left hover:bg-[#3C3C3E] transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={16} className="text-[#84CC16]" />
            <span className="text-xs text-[#6e6e73]">Sabedoria do Dia</span>
          </div>
          <p className="text-sm text-white italic">"{currentWisdom}"</p>
        </button>
      </div>

      {/* Profile Drawer — mobile e desktop */}
      <div>
        <ProfileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </>
  )
}

export default HeaderSummary
