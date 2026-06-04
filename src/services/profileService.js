import { database } from '@config/firebase.config'

export const profileService = {
  async saveProfile(tokenKey, profileData) {
    try {
      await database.ref(`gymai_profile/${tokenKey}`).set({
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
      const snapshot = await database.ref(`gymai_profile/${tokenKey}`).once('value')
      const profile = snapshot.val()
      return { success: true, data: profile }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return { success: false, error: error.message }
    }
  },

  async saveMeasurements(tokenKey, measurementsData) {
    try {
      await database.ref(`gymai_medidas/${tokenKey}`).set({
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
      const snapshot = await database.ref(`gymai_medidas/${tokenKey}`).once('value')
      const measurements = snapshot.val()
      return { success: true, data: measurements }
    } catch (error) {
      console.error('Erro ao buscar medidas:', error)
      return { success: false, error: error.message }
    }
  },

  async saveGoals(tokenKey, goalsData) {
    try {
      await database.ref(`gymai_metas/${tokenKey}`).set({
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
      const snapshot = await database.ref(`gymai_metas/${tokenKey}`).once('value')
      const goals = snapshot.val()
      return { success: true, data: goals }
    } catch (error) {
      console.error('Erro ao buscar metas:', error)
      return { success: false, error: error.message }
    }
  }
}
