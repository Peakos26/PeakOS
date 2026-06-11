import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SessionMonitor = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleSessionExpired = (event) => {
      const message = event.detail?.message || 'Sua sessão expirou. Faça login novamente.'
      
      // Exibir modal ou toast amigável
      alert(message)
      
      // Redirecionar para login
      navigate('/login')
    }

    window.addEventListener('session-expired', handleSessionExpired)

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired)
    }
  }, [navigate])

  return null
}

export default SessionMonitor
