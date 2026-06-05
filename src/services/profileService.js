import { database, ref, get, set } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$[\]]/g, '_')
}

export const profileService = {
  async saveProfile(tokenKey, profileData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      await set(ref(database, `gymai_profile/${encodedKey}`), {
        ...profileData,
        updatedAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      return { success: false, error: error.message }
    }
  },

  async getProfile(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_profile/${encodedKey}`))
      const profile = snapshot.val()
      return { success: true, data: profile }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return { success: false, error: error.message }
    }
  },

  async saveMeasurements(tokenKey, measurementsData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      await set(ref(database, `gymai_medidas/${encodedKey}`), {
        ...measurementsData,
        updatedAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar medidas:', error)
      return { success: false, error: error.message }
    }
  },

  async getMeasurements(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_medidas/${encodedKey}`))
      const measurements = snapshot.val()
      return { success: true, data: measurements }
    } catch (error) {
      console.error('Erro ao buscar medidas:', error)
      return { success: false, error: error.message }
    }
  },

  async saveGoals(tokenKey, goalsData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      await set(ref(database, `gymai_metas/${encodedKey}`), {
        ...goalsData,
        updatedAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar metas:', error)
      return { success: false, error: error.message }
    }
  },

  async getGoals(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const goals = snapshot.val()
      return { success: true, data: goals }
    } catch (error) {
      console.error('Erro ao buscar metas:', error)
      return { success: false, error: error.message }
    }
  }
}
