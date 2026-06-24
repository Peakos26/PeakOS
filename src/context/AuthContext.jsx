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
    if (!session?.tokenKey) return;

    let isMounted = true;
    let consecutiveErrors = 0;

    const validateUser = async () => {
      try {
        const { tokenKey } = session;
        
        // Buscar em gymai_requests
        const requestsRef = ref(database, 'gymai_requests');
        const snapshot = await get(requestsRef);
        
        let userValid = false;
        if (snapshot.exists()) {
          snapshot.forEach(child => {
            const data = child.val();
            if (data.tokenKey === tokenKey && data.status === 'approved') {
              userValid = true;
            }
          });
        }
        
        if (!userValid && isMounted) {
          // Sessão inválida
          localStorage.removeItem('gymai_session');
          localStorage.removeItem('gymai_token');
          
          const event = new CustomEvent('session-expired', { 
            detail: { message: 'Sua conta foi desativada. Faça login novamente.' }
          });
          window.dispatchEvent(event);
          
          // Redirecionar se não estiver já na página de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        consecutiveErrors = 0; // reset em caso de sucesso
      } catch (error) {
        console.error('Erro na validação periódica da conta:', error);
        consecutiveErrors++;
        
        if (consecutiveErrors >= 3 && isMounted) {
          // Notificar usuário que há problema de conexão, mas manter sessão
          console.warn('Múltiplas falhas na validação da conta. Verifique sua internet.');
        }
      }
    };

    // Primeira validação imediata
    validateUser();
    
    // Intervalo a cada 30 segundos (30000 ms)
    const intervalId = setInterval(validateUser, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [session]);

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

      // Busca celular do gymai_requests para incluir na sessão
      let celular = ''
      try {
        const requestsRef = ref(database, 'gymai_requests')
        const requestsSnap = await get(requestsRef)
        if (requestsSnap.exists()) {
          requestsSnap.forEach(child => {
            const data = child.val()
            if (data.tokenKey === tokenKey) {
              celular = data.celular || ''
            }
          })
        }
      } catch (error) {
        console.error('Erro ao buscar celular:', error)
      }

      const sessionData = {
        tokenKey,
        email: tokenKey,
        nome: tokenData.nome || userData?.nome || 'Usuário',
        celular,
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
