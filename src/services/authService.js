import { database } from '@config/firebase.config'

export const authService = {
  async login(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_tokens/${tokenKey}`).once('value')
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
