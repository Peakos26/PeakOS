import { database, ref, get, set, push } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$[\]]/g, '_')
}

export const reportService = {
  async saveReport(tokenKey, reportData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const reportRef = push(ref(database, `gymai_relatorios/${encodedKey}`))
      await set(reportRef, {
        ...reportData,
        createdAt: Date.now()
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar relatório:', error)
      return { success: false, error: error.message }
    }
  },

  async getReports(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_relatorios/${encodedKey}`))
      const reports = snapshot.val()
      return { success: true, data: reports }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      return { success: false, error: error.message }
    }
  },

  async generateWeeklyReport(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const logsSnapshot = await get(ref(database, `gymai_log/${encodedKey}`))
      const logs = logsSnapshot.val()

      const diasSnapshot = await get(ref(database, `gymai_dias_treino/${encodedKey}`))
      const dias = diasSnapshot.val()

      let totalSeries = 0
      let totalVolume = 0
      const treinoDays = new Set()

      if (logs) {
        Object.values(logs).forEach(log => {
          if (log.series) {
            log.series.forEach(serie => {
              totalSeries++
              totalVolume += (serie.peso || 0) * (serie.reps || 0)
            })
          }
          if (log.dia !== undefined) {
            treinoDays.add(log.dia)
          }
        })
      }

      const diasMarcados = dias ? Object.keys(dias).length : 0

      return {
        success: true,
        data: {
          period: 'weekly',
          totalSeries,
          totalVolume,
          treinoDays: Array.from(treinoDays),
          diasMarcados,
          generatedAt: Date.now()
        }
      }
    } catch (error) {
      console.error('Erro ao gerar relatório semanal:', error)
      return { success: false, error: error.message }
    }
  },

  async generateMonthlyReport(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const logsSnapshot = await get(ref(database, `gymai_log/${encodedKey}`))
      const logs = logsSnapshot.val()

      const diasSnapshot = await get(ref(database, `gymai_dias_treino/${encodedKey}`))
      const dias = diasSnapshot.val()

      const medidasSnapshot = await get(ref(database, `gymai_medidas/${encodedKey}`))
      const medidas = medidasSnapshot.val()

      const metasSnapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const metas = metasSnapshot.val()

      let totalSeries = 0
      let totalVolume = 0
      const treinoDays = new Set()

      if (logs) {
        Object.values(logs).forEach(log => {
          if (log.series) {
            log.series.forEach(serie => {
              totalSeries++
              totalVolume += (serie.peso || 0) * (serie.reps || 0)
            })
          }
          if (log.dia !== undefined) {
            treinoDays.add(log.dia)
          }
        })
      }

      const diasMarcados = dias ? Object.keys(dias).length : 0

      return {
        success: true,
        data: {
          period: 'monthly',
          totalSeries,
          totalVolume,
          treinoDays: Array.from(treinoDays),
          diasMarcados,
          medidas,
          metas,
          generatedAt: Date.now()
        }
      }
    } catch (error) {
      console.error('Erro ao gerar relatório mensal:', error)
      return { success: false, error: error.message }
    }
  }
}
