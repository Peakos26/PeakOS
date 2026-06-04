import { database } from '@config/firebase.config'

export const trainingService = {
  async saveWorkoutLog(tokenKey, workoutData) {
    try {
      const logRef = database.ref(`gymai_log/${tokenKey}`).push()
      await logRef.set({
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
      const snapshot = await database.ref(`gymai_log/${tokenKey}`).once('value')
      const logs = snapshot.val()
      return { success: true, data: logs }
    } catch (error) {
      console.error('Erro ao buscar logs de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveTrainingPlan(tokenKey, planData) {
    try {
      await database.ref(`gymai_treinos/${tokenKey}`).set(planData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar plano de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async getTrainingPlan(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_treinos/${tokenKey}`).once('value')
      const plan = snapshot.val()
      return { success: true, data: plan }
    } catch (error) {
      console.error('Erro ao buscar plano de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveWorkoutSheet(tokenKey, sheetId, sheetData) {
    try {
      await database.ref(`gymai_fichas/${tokenKey}/${sheetId}`).set(sheetData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar ficha de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async getWorkoutSheets(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_fichas/${tokenKey}`).once('value')
      const sheets = snapshot.val()
      return { success: true, data: sheets }
    } catch (error) {
      console.error('Erro ao buscar fichas de treino:', error)
      return { success: false, error: error.message }
    }
  },

  async saveCheckIn(tokenKey, day, location) {
    try {
      const diaData = {
        dia,
        timestamp: Date.now(),
        location
      }
      await database.ref(`gymai_dias_treino/${tokenKey}/${day}`).set(diaData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar check-in:', error)
      return { success: false, error: error.message }
    }
  },

  async getCheckIns(tokenKey) {
    try {
      const snapshot = await database.ref(`gymai_dias_treino/${tokenKey}`).once('value')
      const checkIns = snapshot.val()
      return { success: true, data: checkIns }
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error)
      return { success: false, error: error.message }
    }
  }
}
