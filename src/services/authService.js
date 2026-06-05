import { database, ref, get } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$[\]]/g, '_')
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
