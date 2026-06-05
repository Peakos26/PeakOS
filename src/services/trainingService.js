import { database, ref, set, get, push } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$[\]]/g, '_')
}

export const trainingService = {
  async saveWorkoutLog(tokenKey, workoutData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const logRef = push(ref(database, `gymai_log/${encodedKey}`))
      await set(logRef, {
        ...workoutData,
        createdAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar log de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async getWorkoutLogs(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_log/${encodedKey}`))
      const logs = snapshot.val()
      return { success: true, data: logs }
    } catch (error) {
      console.error('Erro ao buscar logs de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveTrainingPlan(tokenKey, planData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      await set(ref(database, `gymai_treinos/${encodedKey}`), planData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar plano de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async getTrainingPlan(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_treinos/${encodedKey}`))
      const plan = snapshot.val()
      return { success: true, data: plan }
    } catch (error) {
      console.error('Erro ao buscar plano de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveWorkoutSheet(tokenKey, sheetId, sheetData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      await set(ref(database, `gymai_fichas/${encodedKey}/${sheetId}`), sheetData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar ficha de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async getWorkoutSheets(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_fichas/${encodedKey}`))
      const sheets = snapshot.val()
      return { success: true, data: sheets }
    } catch (error) {
      console.error('Erro ao buscar fichas de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteWorkoutSheet(tokenKey, sheetId) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      await set(ref(database, `gymai_fichas/${encodedKey}/${sheetId}`), null)
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar ficha de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveCheckIn(tokenKey, day, location) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const diaData = {
        day,
        timestamp: Date.now(),
        location
      }
      await set(ref(database, `gymai_dias_treino/${encodedKey}/${day}`), diaData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar check-in:', error)
      return { success: false, error: error.message }
    }
  },

  async getCheckIns(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_dias_treino/${encodedKey}`))
      const checkIns = snapshot.val()
      return { success: true, data: checkIns }
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error)
      return { success: false, error: error.message }
    }
  }
}
