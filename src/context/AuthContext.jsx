import { createContext, useContext, useState, useEffect } from 'react'
import { database } from '@config/firebase.config'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    loadSession()
  }, [])

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

  const login = async (tokenKey) => {
    try {
      const snapshot = await database.ref(`gymai_tokens/${tokenKey}`).once('value')
      const tokenData = snapshot.val()
      
      if (!tokenData) {
        throw new Error('Token inválido')
      }

      const sessionData = {
        tokenKey,
        email: tokenKey,
        nome: tokenData.nome || 'Usuário',
        features: tokenData.features || []
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
