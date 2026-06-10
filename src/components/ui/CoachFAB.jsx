import { useLocation, useNavigate } from 'react-router-dom'

const RobotIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Cabeça */}
    <rect x="12" y="16" width="40" height="32" rx="8" fill="#1a1a2e" stroke="#c8f04a" strokeWidth="1.5"/>
    {/* Olhos verdes */}
    <circle cx="23" cy="30" r="5" fill="#4ade80"/>
    <circle cx="23" cy="30" r="2" fill="#0a0a0f"/>
    <circle cx="41" cy="30" r="5" fill="#4ade80"/>
    <circle cx="41" cy="30" r="2" fill="#0a0a0f"/>
    {/* Antena */}
    <line x1="32" y1="16" x2="32" y2="8" stroke="#c8f04a" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="6" r="3" fill="#c8f04a"/>
    {/* Boca */}
    <path d="M24 40 Q32 46 40 40" stroke="#c8f04a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Glow */}
    <circle cx="32" cy="32" r="30" fill="rgba(200,240,74,0.05)"/>
  </svg>
)

const CoachFAB = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Não mostrar na página do Coach IA
  if (location.pathname === '/ia') return null

  return (
    <button
      onClick={() => navigate('/ia')}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-2xl bg-card border-2 border-accent/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      style={{ boxShadow: '0 0 20px rgba(200,240,74,0.3)' }}
    >
      <RobotIcon size={32} />
    </button>
  )
}

export default CoachFAB
