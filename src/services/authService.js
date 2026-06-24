import { database, ref, get, set, push } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$[\]]/g, '_')
}

// Função de logout e limpeza
const logoutAndCleanup = (message) => {
  localStorage.removeItem('gymai_session')
  localStorage.removeItem('gymai_token')
  
  // Disparar evento global de sessão expirada
  window.dispatchEvent(new CustomEvent('session-expired', { detail: { message } }))
  
  // Redirecionar para login se não estiver já na página de login
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Registrar login com timestamp completo
export const recordLogin = async (tokenKey, nome, location = null) => {
  const agora = new Date()
  const timestamp = agora.getTime()
  const date = agora.toISOString().split('T')[0] // YYYY-MM-DD
  const time = agora.toTimeString().split(' ')[0] // HH:MM:SS
  const datetime = `${date} ${time}`
  const hour = agora.getHours()
  const minute = agora.getMinutes()
  const weekday = agora.getDay() // 0 = Domingo, 1 = Segunda...
  
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const weekday_name = weekdays[weekday]
  
  // Detectar navegador e dispositivo
  const userAgent = navigator.userAgent
  let browser = 'Desconhecido'
  let device = 'Desktop'
  
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  
  if (/(android|iphone|ipad|mobile)/i.test(userAgent)) device = 'Mobile'
  else if (/(tablet|ipad)/i.test(userAgent)) device = 'Tablet'
  
  const loginData = {
    tokenKey,
    nome,
    timestamp,
    date,
    time,           // ⭐ NOVO
    datetime,       // ⭐ NOVO
    hour,           // ⭐ NOVO
    minute,         // ⭐ NOVO
    weekday,        // ⭐ NOVO
    weekday_name,   // ⭐ NOVO
    userAgent,
    browser,
    device,
    language: navigator.language,
    latitude: location?.latitude || null,
    longitude: location?.longitude || null
  }
  
  const loginsRef = ref(database, 'gymai_logins')
  const newLoginRef = push(loginsRef)
  await set(newLoginRef, loginData)
  
  return loginData
}

// Verificar se conta está ativa (gymai_requests.status === 'approved')
export const checkAccountActive = async (tokenKey, celular) => {
  try {
    // Buscar status do cadastro em gymai_requests
    const requestsRef = ref(database, 'gymai_requests')
    const snapshot = await get(requestsRef)
    
    let requestData = null
    snapshot.forEach(child => {
      if (child.val().tokenKey === tokenKey || child.val().celular === celular) {
        requestData = child.val()
      }
    })
    
    if (!requestData) {
      // Cadastro não encontrado - fazer logout
      logoutAndCleanup('Cadastro não encontrado')
      return false
    }
    
    if (requestData.status !== 'approved') {
      // Cadastro não está mais aprovado (pode ter sido revogado pelo admin)
      logoutAndCleanup('Sua conta foi desativada. Entre em contato com o suporte.')
      return false
    }
    
    // Verificar se token expirou (se tiver expiresAt)
    if (requestData.expiresAt && requestData.expiresAt < Date.now()) {
      logoutAndCleanup('Seu acesso expirou. Solicite um novo token ao administrador.')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao verificar status da conta:', error)
    // Em caso de erro de rede, manter sessão mas logar erro
    return true // Assume ativo para não prejudicar experiência
  }
}

export const authService = {
  async login(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_tokens/${encodedKey}`))
      const tokenData = snapshot.val()
      
      if (!tokenData) {
        throw new Error('Token inválido')
      }

      return {
        success: true,
        data: {
          tokenKey,
          email: tokenKey,
          nome: tokenData.nome || 'Usuário',
          features: tokenData.features || []
        }
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return { success: false, error: error.message }
    }
  },

  logout() {
    localStorage.removeItem('gymai_session')
  },

  getSession() {
    const savedSession = localStorage.getItem('gymai_session')
    if (savedSession) {
      try {
        return JSON.parse(savedSession)
      } catch (e) {
        console.error('Erro ao carregar sessão:', e)
        return null
      }
    }
    return null
  },

  saveSession(sessionData) {
    localStorage.setItem('gymai_session', JSON.stringify(sessionData))
  }
}

// Validar sessão - verificar se token ainda existe e conta está ativa
export const validateSession = async () => {
  try {
    const session = authService.getSession()
    if (!session) {
      console.log('❌ [SESSION] Nenhuma sessão encontrada')
      return false
    }

    const tokenKey = session.tokenKey
    if (!tokenKey) {
      console.log('❌ [SESSION] tokenKey não encontrado na sessão')
      return false
    }

    // Verificar se token existe no Firebase
    const encodedKey = encodeTokenKey(tokenKey)
    const tokenSnapshot = await get(ref(database, `gymai_tokens/${encodedKey}`))
    
    if (!tokenSnapshot.exists()) {
      console.log('❌ [SESSION] Token não encontrado no Firebase')
      return false
    }

    // Verificar se conta está ativa
    const isActive = await checkAccountActive(tokenKey, session.celular)
    if (!isActive) {
      console.log('❌ [SESSION] Conta não está ativa')
      return false
    }

    console.log('✅ [SESSION] Sessão válida')
    return true
  } catch (error) {
    console.error('❌ [SESSION] Erro ao validar sessão:', error)
    // Em caso de erro de rede, manter sessão
    return true
  }
}

// Verificar se usuário ainda existe em gymai_requests com status approved
export const checkUserStillExists = async (tokenKey) => {
  try {
    const requestsRef = ref(database, 'gymai_requests')
    const snapshot = await get(requestsRef)
    let userExists = false
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        if (child.val().tokenKey === tokenKey && child.val().status === 'approved') {
          userExists = true
        }
      })
    }
    return userExists
  } catch (error) {
    console.error('Erro ao verificar existência do usuário:', error)
    return true // Em caso de erro, assume que existe (evita logout falso)
  }
}
