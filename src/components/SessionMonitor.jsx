import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { validateSession } from '@services/authService'

const SessionMonitor = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    let sessionCheckInterval
    let lastVisibilityTime = Date.now()

    // Validar sessão
    const checkSession = async () => {
      try {
        const isValid = await validateSession()
        if (!isValid) {
          console.log('⚠️ [SESSION] Sessão inválida, fazendo logout')
          await logout()
          navigate('/login')
        }
      } catch (error) {
        console.error('❌ [SESSION] Erro ao validar sessão:', error)
      }
    }

    // Validar quando a aba voltar a ficar visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeHidden = Date.now() - lastVisibilityTime
        // Se ficou oculto por mais de 1 minuto, validar sessão
        if (timeHidden > 60000) {
          console.log(`👁️ [SESSION] Aba voltou a ficar visível após ${Math.round(timeHidden / 1000)}s, validando sessão`)
          checkSession()
        }
        lastVisibilityTime = Date.now()
      } else {
        lastVisibilityTime = Date.now()
      }
    }

    // Validar sessão a cada 15 minutos
    sessionCheckInterval = setInterval(() => {
      console.log('⏰ [SESSION] Validando sessão periódica (15min)')
      checkSession()
    }, 15 * 60 * 1000) // 15 minutos

    // Escutar mudança de visibilidade da aba
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Escutar evento de sessão expirada (compatibilidade com código existente)
    const handleSessionExpired = (event) => {
      const message = event.detail?.message || 'Sua sessão expirou. Faça login novamente.'
      console.log('⚠️ [SESSION] Evento session-expired recebido')
      alert(message)
      navigate('/login')
    }

    window.addEventListener('session-expired', handleSessionExpired)

    // Cleanup
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('session-expired', handleSessionExpired)
    }
  }, [navigate, logout])

  return null
}

export default SessionMonitor
