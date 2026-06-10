import { database, ref, get } from '@config/firebase.config'

// Calcular streak real de dias consecutivos
const calcStreak = (dias) => {
  if (!dias) return 0
  
  const diasArray = Object.values(dias)
    .sort((a, b) => b.timestamp - a.timestamp)
  
  let streak = 0
  let currentDate = new Date()
  
  for (const dia of diasArray) {
    const diaDate = new Date(dia.timestamp)
    const diffDays = Math.floor((currentDate - diaDate) / (1000 * 60 * 60 * 24))
    if (diffDays <= 1) {
      streak++
      currentDate = diaDate
    } else break
  }
  
  return streak
}

const calculateAchievements = async (tokenKey) => {
  try {
    const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
    
    const [logSnap, diasSnap, hidratacaoSnap, sonoSnap] = await Promise.all([
      get(ref(database, `gymai_log/${encodedKey}`)),
      get(ref(database, `gymai_dias_treino/${encodedKey}`)),
      get(ref(database, `gymai_hidratacao/${encodedKey}`)),
      get(ref(database, `gymai_sono/${encodedKey}`))
    ])

    const logs = logSnap.val() || {}
    const dias = diasSnap.val() || {}
    const hidratacao = hidratacaoSnap.val() || {}
    const sono = sonoSnap.val() || {}

    // Total de treinos
    const totalTreinos = Object.keys(logs).length

    // Streak de dias consecutivos
    const streak = calcStreak(dias)

    // Meta de água atingida hoje
    const today = new Date().toISOString().split('T')[0]
    const aguaHoje = hidratacao[today]?.intake || 0
    const metaAgua = hidratacao[today]?.goal || 2000
    const aguaMeta = aguaHoje >= metaAgua

    // Meta de sono atingida
    const sonoHoje = sono[today]?.duration || 0
    const sonoMeta = sonoHoje >= 7

    return {
      streak,           // número real de dias consecutivos
      totalTreinos,     // número real de treinos
      aguaMeta,         // boolean
      sonoMeta,         // boolean
    }
  } catch (error) {
    console.error('Erro ao calcular conquistas:', error)
    return {
      streak: 0,
      totalTreinos: 0,
      aguaMeta: false,
      sonoMeta: false,
    }
  }
}

export { calculateAchievements }
