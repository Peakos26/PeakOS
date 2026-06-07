import { database, ref, get, set, push, update, remove } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

export const performanceService = {
  // Calcula o score de performance detalhado
  async calculateDetailedPerformanceScore(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      // Buscar dados de treino
      const logsSnapshot = await get(ref(database, `gymai_log/${encodedKey}`))
      const logs = logsSnapshot.val() || {}

      // Buscar dados de check-in
      const diasSnapshot = await get(ref(database, `gymai_dias_treino/${encodedKey}`))
      const dias = diasSnapshot.val() || {}

      // Buscar metas (Sprint 0.4: para cardio score)
      const metasSnapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const metas = metasSnapshot.val() || {}

      // Buscar jejum_sono (Sprint 0.4: para sono score)
      const jejumSonoSnapshot = await get(ref(database, `gymai_jejum_sono/${encodedKey}`))
      const jejumSono = jejumSonoSnapshot.val() || {}

      // Buscar medidas
      const medidasSnapshot = await get(ref(database, `gymai_medidas/${encodedKey}`))
      const medidas = medidasSnapshot.val() || {}

      // Calcular componentes do score (Sprint 0.4: passar metas e jejumSono corretos)
      const treinoScore = this.calculateTreinoScore(logs, dias)
      const sonoScore = this.calculateSonoScore(jejumSono) // Sprint 0.4: usar gymai_jejum_sono
      const nutricaoScore = this.calculateNutricaoScore(metas)
      const cardioScore = this.calculateCardioScore(metas) // Sprint 0.4: usar gymai_metas para passos
      const consistenciaScore = this.calculateConsistenciaScore(dias)

      // Score composto (peso: treino 30%, sono 20%, nutrição 20%, cardio 15%, consistência 15%)
      const totalScore = Math.round(
        (treinoScore * 0.30) +
        (sonoScore * 0.20) +
        (nutricaoScore * 0.20) +
        (cardioScore * 0.15) +
        (consistenciaScore * 0.15)
      )

      return {
        success: true,
        data: {
          totalScore,
          components: {
            treino: treinoScore,
            sono: sonoScore,
            nutricao: nutricaoScore,
            cardio: cardioScore,
            consistencia: consistenciaScore
          },
          details: {
            treino: this.getTreinoDetails(logs),
            sono: this.getSonoDetails(metas),
            nutricao: this.getNutricaoDetails(metas),
            cardio: this.getCardioDetails(logs),
            consistencia: this.getConsistenciaDetails(dias)
          },
          trends: this.calculateTrends(logs, dias, medidas),
          recommendations: this.generateRecommendations(treinoScore, sonoScore, nutricaoScore, cardioScore, consistenciaScore),
          calculatedAt: Date.now()
        }
      }
    } catch (error) {
      console.error('Erro ao calcular performance score:', error)
      return { success: false, error: error.message }
    }
  },

  calculateTreinoScore(logs, dias) {
    let score = 0
    const logsArray = Object.values(logs)
    const diasArray = Object.values(dias)

    // Volume total
    let totalVolume = 0
    logsArray.forEach(log => {
      if (log.series) {
        log.series.forEach(serie => {
          totalVolume += (serie.peso || 0) * (serie.reps || 0)
        })
      }
    })

    // Séries totais
    let totalSeries = 0
    logsArray.forEach(log => {
      if (log.series) {
        totalSeries += log.series.length
      }
    })

    // Score baseado em volume e séries (máximo 100)
    score = Math.min(100, (totalVolume / 10000) * 50 + (totalSeries / 100) * 50)

    return Math.round(score)
  },

  calculateSonoScore(jejumSono) {
    // Sprint 0.4: Sono score = min(100, horas_dormidas / meta_sono × 100)
    // [buscar de gymai_jejum_sono/{tokenKey}.sonoHoras]
    let score = 0
    const sonoHoras = jejumSono.sonoHoras || 0
    const metaSono = jejumSono.metaSono || 8

    // Score baseado em horas de sono (máximo 100)
    score = Math.min(100, (sonoHoras / metaSono) * 100)

    return Math.round(score)
  },

  calculateNutricaoScore(metas) {
    let score = 0
    const calorias = metas.calorias || 0
    const caloriasMeta = metas.caloriasMeta || 2000
    const proteina = metas.proteina || 0
    const proteinaMeta = metas.proteinaMeta || 150
    const agua = metas.agua || 0
    const aguaMeta = metas.aguaMeta || 2000

    // Score baseado em calorias, proteína e água (máximo 100)
    const caloriasScore = Math.min(100, (calorias / caloriasMeta) * 100)
    const proteinaScore = Math.min(100, (proteina / proteinaMeta) * 100)
    const aguaScore = Math.min(100, (agua / aguaMeta) * 100)

    score = (caloriasScore * 0.4) + (proteinaScore * 0.3) + (aguaScore * 0.3)

    return Math.round(score)
  },

  calculateCardioScore(metas) {
    // Sprint 0.4: Cardio score = min(100, passos_atuais / meta_passos × 100)
    // [buscar de gymai_metas/{tokenKey}.passos]
    let score = 0
    const passosAtuais = metas.passos || 0
    const metaPassos = metas.metaPassos || 10000

    // Score baseado em passos (máximo 100)
    score = Math.min(100, (passosAtuais / metaPassos) * 100)

    return Math.round(score)
  },

  calculateConsistenciaScore(dias) {
    let score = 0
    const diasArray = Object.values(dias)
    const diasMarcados = diasArray.length

    // Score baseado em dias de treino na semana (máximo 100)
    score = (diasMarcados / 5) * 100

    return Math.round(score)
  },

  getTreinoDetails(logs) {
    const logsArray = Object.values(logs)
    let totalVolume = 0
    let totalSeries = 0

    logsArray.forEach(log => {
      if (log.series) {
        log.series.forEach(serie => {
          totalVolume += (serie.peso || 0) * (serie.reps || 0)
          totalSeries++
        })
      }
    })

    return {
      totalVolume,
      totalSeries,
      averageVolume: totalSeries > 0 ? Math.round(totalVolume / totalSeries) : 0
    }
  },

  getSonoDetails(jejumSono) {
    // Sprint 0.4: usar gymai_jejum_sono
    return {
      horas: jejumSono.sonoHoras || 0,
      meta: jejumSono.metaSono || 8,
      qualidade: jejumSono.qualidade || 'boa'
    }
  },

  getNutricaoDetails(metas) {
    return {
      calorias: metas.calorias || 0,
      caloriasMeta: metas.caloriasMeta || 2000,
      proteina: metas.proteina || 0,
      proteinaMeta: metas.proteinaMeta || 150,
      agua: metas.agua || 0,
      aguaMeta: metas.aguaMeta || 2000
    }
  },

  getCardioDetails(metas) {
    // Sprint 0.4: usar gymai_metas para passos
    return {
      passos: metas.passos || 0,
      metaPassos: metas.metaPassos || 10000,
      porcentagem: Math.round(((metas.passos || 0) / (metas.metaPassos || 10000)) * 100)
    }
  },

  getConsistenciaDetails(dias) {
    const diasArray = Object.values(dias)
    return {
      diasMarcados: diasArray.length,
      metaSemanal: 5,
      porcentagem: Math.round((diasArray.length / 5) * 100)
    }
  },

  calculateTrends(logs, dias, medidas) {
    // Calcular tendências de melhoria
    const logsArray = Object.values(logs).sort((a, b) => a.createdAt - b.createdAt)
    
    if (logsArray.length < 2) {
      return { improving: false, stable: true, declining: false }
    }

    const recentLogs = logsArray.slice(-7)
    const olderLogs = logsArray.slice(-14, -7)

    let recentVolume = 0
    let olderVolume = 0

    recentLogs.forEach(log => {
      if (log.series) {
        log.series.forEach(serie => {
          recentVolume += (serie.peso || 0) * (serie.reps || 0)
        })
      }
    })

    olderLogs.forEach(log => {
      if (log.series) {
        log.series.forEach(serie => {
          olderVolume += (serie.peso || 0) * (serie.reps || 0)
        })
      }
    })

    if (recentVolume > olderVolume * 1.1) {
      return { improving: true, stable: false, declining: false }
    } else if (recentVolume < olderVolume * 0.9) {
      return { improving: false, stable: false, declining: true }
    } else {
      return { improving: false, stable: true, declining: false }
    }
  },

  generateRecommendations(treinoScore, sonoScore, nutricaoScore, cardioScore, consistenciaScore) {
    const recommendations = []

    if (treinoScore < 60) {
      recommendations.push('Aumente a intensidade ou volume dos treinos')
    }
    if (sonoScore < 60) {
      recommendations.push('Melhore a qualidade e quantidade do sono')
    }
    if (nutricaoScore < 60) {
      recommendations.push('Ajuste sua dieta para atingir as metas de calorias e proteína')
    }
    if (cardioScore < 60) {
      recommendations.push('Adicione mais sessões de cardio à sua rotina')
    }
    if (consistenciaScore < 60) {
      recommendations.push('Mantenha a consistência nos dias de treino')
    }

    if (recommendations.length === 0) {
      recommendations.push('Excelente trabalho! Continue assim!')
    }

    return recommendations
  },

  async savePerformanceScore(tokenKey, scoreData) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const scoreRef = push(ref(database, `gymai_performance/${encodedKey}`))
      await set(scoreRef, scoreData)
      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar performance score:', error)
      return { success: false, error: error.message }
    }
  },

  async getPerformanceHistory(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_performance/${encodedKey}`))
      const history = snapshot.val()
      return { success: true, data: history }
    } catch (error) {
      console.error('Erro ao buscar histórico de performance:', error)
      return { success: false, error: error.message }
    }
  }
}
