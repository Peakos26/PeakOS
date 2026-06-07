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
  },

  // Sprint 1.1: Buscar último log de treino para progressive overload
  async getLastWorkoutLog(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_log/${encodedKey}`))
      const logs = snapshot.val()
      if (!logs) return { success: true, data: null }
      
      // Converter objeto em array e buscar o mais recente
      const logsArray = Object.values(logs).sort((a, b) => b.createdAt - a.createdAt)
      return { success: true, data: logsArray[0] || null }
    } catch (error) {
      console.error('Erro ao buscar último log de treino:', error)
      return { success: false, error: error.message }
    }
  },

  // Sprint 1.3: Salvar PR (Personal Record) de 1RM
  async savePR(tokenKey, exerciseName, oneRM) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const prRef = ref(database, `gymai_prs/${encodedKey}/${encodeTokenKey(exerciseName)}`)
      const snapshot = await get(prRef)
      const currentPR = snapshot.val()
      
      // Atualizar apenas se for maior que o PR atual
      if (!currentPR || oneRM > currentPR.oneRM) {
        await set(prRef, {
          oneRM,
          exerciseName,
          updatedAt: Date.now()
        })
        return { success: true, isNewPR: true }
      }
      return { success: true, isNewPR: false }
    } catch (error) {
      console.error('Erro ao salvar PR:', error)
      return { success: false, error: error.message }
    }
  },

  // Sprint 1.3: Buscar PRs do usuário
  async getPRs(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_prs/${encodedKey}`))
      const prs = snapshot.val()
      return { success: true, data: prs }
    } catch (error) {
      console.error('Erro ao buscar PRs:', error)
      return { success: false, error: error.message }
    }
  }
}
