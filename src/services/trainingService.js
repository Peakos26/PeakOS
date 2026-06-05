import { database, ref, set, get, push } from '@config/firebase.config'

export const trainingService = {
  async saveWorkoutLog(tokenKey, workoutData) {
    try {
      const logRef = push(ref(database, `gymai_log/${tokenKey}`))
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
      const snapshot = await get(ref(database, `gymai_log/${tokenKey}`))
      const logs = snapshot.val()
      return { success: true, data: logs }
    } catch (error) {
      console.error('Erro ao buscar logs de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveTrainingPlan(tokenKey, planData) {
    try {
      await set(ref(database, `gymai_treinos/${tokenKey}`), planData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar plano de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async getTrainingPlan(tokenKey) {
    try {
      const snapshot = await get(ref(database, `gymai_treinos/${tokenKey}`))
      const plan = snapshot.val()
      return { success: true, data: plan }
    } catch (error) {
      console.error('Erro ao buscar plano de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveWorkoutSheet(tokenKey, sheetId, sheetData) {
    try {
      await set(ref(database, `gymai_fichas/${tokenKey}/${sheetId}`), sheetData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar ficha de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async getWorkoutSheets(tokenKey) {
    try {
      const snapshot = await get(ref(database, `gymai_fichas/${tokenKey}`))
      const sheets = snapshot.val()
      return { success: true, data: sheets }
    } catch (error) {
      console.error('Erro ao buscar fichas de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteWorkoutSheet(tokenKey, sheetId) {
    try {
      await set(ref(database, `gymai_fichas/${tokenKey}/${sheetId}`), null)
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar ficha de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveCheckIn(tokenKey, day, location) {
    try {
      const diaData = {
        day,
        timestamp: Date.now(),
        location
      }
      await set(ref(database, `gymai_dias_treino/${tokenKey}/${day}`), diaData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar check-in:', error)
      return { success: false, error: error.message }
    }
  },

  async getCheckIns(tokenKey) {
    try {
      const snapshot = await get(ref(database, `gymai_dias_treino/${tokenKey}`))
      const checkIns = snapshot.val()
      return { success: true, data: checkIns }
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error)
      return { success: false, error: error.message }
    }
  }
}
