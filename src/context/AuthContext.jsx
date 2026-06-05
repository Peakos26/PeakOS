import { createContext, useContext, useState, useEffect } from 'react'
import { database, ref, get, onValue } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$[\]]/g, '_')
}

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

  useEffect(() => {
    if (!session?.tokenKey) return

    // Listener para monitorar mudanças no token do usuário
    const encodedKey = encodeTokenKey(session.tokenKey)
    const tokenRef = ref(database, `gymai_tokens/${encodedKey}`)
    console.log('🔐 [AUTH] Listener iniciado para:', session.tokenKey, 'encoded:', encodedKey)
    
    let isFirstSnapshot = true
    
    const unsubscribe = onValue(tokenRef, (snapshot) => {
      const tokenData = snapshot.val()
      console.log('🔐 [AUTH] Listener snapshot:', tokenData)
      
      // Ignorar o primeiro snapshot null (race condition)
      if (isFirstSnapshot && !tokenData) {
        console.log('🔐 [AUTH] Primeiro snapshot null ignorado (race condition)')
        isFirstSnapshot = false
        return
      }
      
      isFirstSnapshot = false
      
      // Se o token não existir mais (foi deletado/revogado), fazer logout
      if (!tokenData) {
        console.log('🔐 [AUTH] Token não existe mais, fazendo logout')
        logout()
        return
      }

      // Verificar se a licença expirou
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        console.log('🔐 [AUTH] Licença expirada, fazendo logout')
        alert('Sua licença expirou. Entre em contato para renovar.')
        logout()
        return
      }
    }, (error) => {
      console.error('Erro ao monitorar token:', error)
    })

    return () => {
      unsubscribe()
    }
  }, [session?.tokenKey])

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
    console.log('🔐 [AUTH] Iniciando login')
    console.log('🔐 [AUTH] TokenKey:', tokenKey)
    console.log('🔐 [AUTH] UserData:', userData)
    try {
      let tokenData = userData

      // Se não foi passado userData, tenta obter do gymai_tokens
      if (!tokenData) {
        console.log('🔐 [AUTH] Buscando tokenData no Firebase')
        try {
          const encodedKey = encodeTokenKey(tokenKey)
          const snapshot = await get(ref(database, `gymai_tokens/${encodedKey}`))
          console.log('🔐 [AUTH] Snapshot:', snapshot.val())
          tokenData = snapshot.val()
        } catch (err) {
          console.error('❌ [AUTH] Erro ao acessar gymai_tokens:', err)
          // Se falhar ao acessar gymai_tokens, usa userData ou retorna erro
          if (!userData) {
            throw new Error('Token inválido ou sem permissão')
          }
        }
      }

      console.log('🔐 [AUTH] TokenData final:', tokenData)

      if (!tokenData) {
        console.log('❌ [AUTH] Token inválido - tokenData é null')
        throw new Error('Token inválido')
      }

      const sessionData = {
        tokenKey,
        email: tokenKey,
        nome: tokenData.nome || 'Usuário',
        features: tokenData.features || []
      }

      console.log('🔐 [AUTH] SessionData:', sessionData)
      localStorage.setItem('gymai_session', JSON.stringify(sessionData))
      setSession(sessionData)
      setUser({ email: tokenKey, nome: sessionData.nome })

      console.log('✅ [AUTH] Login sucesso')
      return { success: true }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao fazer login:', error)
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
