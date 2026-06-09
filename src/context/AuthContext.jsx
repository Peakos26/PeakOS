import { createContext, useContext, useState, useEffect } from 'react'
import { database } from '@config/firebase.config'
import { ref, get } from 'firebase/database'

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

  useEffect(() => { loadSession() }, [])

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
      const snapshot = await get(ref(database, `gymai_tokens/${tokenKey}`))
      const tokenData = snapshot.val() || userData

      if (!tokenData) throw new Error('Token inválido')

      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        throw new Error('Acesso expirado')
      }

      // Busca features
      const featuresSnap = await get(ref(database, `gymai_features/${tokenKey}`))
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
    <AuthContext.Provider value={{ user, session, loading, login, logout, hasFeature }}>
      {children}
    </AuthContext.Provider>
  )
}
