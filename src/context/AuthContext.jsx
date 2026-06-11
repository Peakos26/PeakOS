import { createContext, useContext, useState, useEffect } from 'react'
import { database, ref, get } from '@config/firebase.config'
import { checkAccountActive, recordLogin } from '@services/authService'
import { useToast } from '@components/Toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [userActive, setUserActive] = useState(true)
  const { showToast } = useToast()

  useEffect(() => { loadSession() }, [])

  useEffect(() => {
    if (!session?.tokenKey) return

    // Verificação imediata ao carregar
    checkAccountActive(session.tokenKey, session.email)

    // Configurar intervalo a cada 5 minutos
    const interval = setInterval(() => {
      checkAccountActive(session.tokenKey, session.email)
    }, 5 * 60 * 1000) // 5 minutos

    // Verificação ao focar a aba/janela
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAccountActive(session.tokenKey, session.email)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Verificação quando o app volta ao foreground (PWA)
    const handleAppResume = () => {
      checkAccountActive(session.tokenKey, session.email)
    }
    window.addEventListener('focus', handleAppResume)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleAppResume)
    }
  }, [session])

  const loadSession = () => {
    const savedSession = localStorage.getItem('gymai_session')
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession)
        setSession(sessionData)
        setUser({ email: sessionData.email, nome: sessionData.nome })
      } catch (e) {
        console.error('Erro ao carregar sessão:', e)
      }
    }
    setLoading(false)
  }

  const login = async (tokenKey, userData = null) => {
    try {
      const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
      const snapshot = await get(ref(database, `gymai_tokens/${encodedKey}`))
      const tokenData = snapshot.val() || userData

      if (!tokenData) throw new Error('Token inválido')

      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        throw new Error('Acesso expirado')
      }

      // Busca features
      const featuresSnap = await get(ref(database, `gymai_features/${encodedKey}`))
      const features = featuresSnap.val() || {}

      const sessionData = {
        tokenKey,
        email: tokenKey,
        nome: tokenData.nome || userData?.nome || 'Usuário',
        features: Object.keys(features).filter(k => features[k] === true)
      }

      localStorage.setItem('gymai_session', JSON.stringify(sessionData))
      setSession(sessionData)
      setUser({ email: tokenKey, nome: sessionData.nome })

      // Registrar login com timestamp completo
      try {
        await recordLogin(tokenKey, sessionData.nome)
        showToast('success', `Bem-vindo de volta, ${sessionData.nome}!`)
      } catch (error) {
        console.error('Erro ao registrar login:', error)
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('gymai_session')
    setSession(null)
    setUser(null)
  }

  const hasFeature = (featureId) => {
    return session?.features?.includes(featureId) || false
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, hasFeature, userActive }}>
      {children}
    </AuthContext.Provider>
  )
}
