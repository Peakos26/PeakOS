import { database, ref, get, set, push, update } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

export const rewardsService = {
  // Definição de conquistas
  ACHIEVEMENTS: {
    first_workout: {
      id: 'first_workout',
      name: 'Primeiro Treino',
      description: 'Complete seu primeiro treino',
      icon: '🏋️',
      points: 100,
      type: 'milestone'
    },
    week_streak: {
      id: 'week_streak',
      name: 'Semana Perfeita',
      description: 'Treine 7 dias seguidos',
      icon: '🔥',
      points: 500,
      type: 'streak'
    },
    month_streak: {
      id: 'month_streak',
      name: 'Mês de Ferro',
      description: 'Treine 30 dias seguidos',
      icon: '💪',
      points: 2000,
      type: 'streak'
    },
    volume_10000: {
      id: 'volume_10000',
      name: 'Volume King',
      description: 'Acumule 10.000kg de volume',
      icon: '🏆',
      points: 300,
      type: 'volume'
    },
    volume_50000: {
      id: 'volume_50000',
      name: 'Volume Master',
      description: 'Acumule 50.000kg de volume',
      icon: '👑',
      points: 1500,
      type: 'volume'
    },
    early_bird: {
      id: 'early_bird',
      name: 'Madrugador',
      description: 'Treine antes das 6h',
      icon: '🌅',
      points: 200,
      type: 'special'
    },
    night_owl: {
      id: 'night_owl',
      name: 'Coruja Noturna',
      description: 'Treine depois das 22h',
      icon: '🦉',
      points: 200,
      type: 'special'
    },
    consistency_30: {
      id: 'consistency_30',
      name: 'Consistente',
      description: 'Treine 30 dias em um mês',
      icon: '📅',
      points: 1000,
      type: 'consistency'
    },
    body_scan_first: {
      id: 'body_scan_first',
      name: 'Scanner Iniciante',
      description: 'Faça sua primeira análise corporal',
      icon: '📸',
      points: 150,
      type: 'feature'
    },
    goals_met: {
      id: 'goals_met',
      name: 'Meta Atingida',
      description: 'Atinja todas as metas semanais',
      icon: '🎯',
      points: 400,
      type: 'goals'
    }
  },

  // Níveis e XP
  LEVELS: [
    { level: 1, name: 'Iniciante', xpRequired: 0, icon: '🌱' },
    { level: 2, name: 'Aprendiz', xpRequired: 500, icon: '🌿' },
    { level: 3, name: 'Atleta', xpRequired: 1500, icon: '💪' },
    { level: 4, name: 'Pro', xpRequired: 3000, icon: '🏆' },
    { level: 5, name: 'Elite', xpRequired: 5000, icon: '👑' },
    { level: 6, name: 'Lenda', xpRequired: 10000, icon: '⭐' },
    { level: 7, name: 'Mestre', xpRequired: 20000, icon: '🌟' },
    { level: 8, name: 'Grão-Mestre', xpRequired: 35000, icon: '💎' },
    { level: 9, name: 'Campeão', xpRequired: 50000, icon: '🏅' },
    { level: 10, name: 'Imortal', xpRequired: 100000, icon: '🔥' }
  ],

  async getUserRewards(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_rewards/${encodedKey}`))
      const rewards = snapshot.val()

      if (!rewards) {
        return {
          success: true,
          data: {
            xp: 0,
            level: 1,
            achievements: [],
            points: 0
          }
        }
      }

      return { success: true, data: rewards }
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error)
      return { success: false, error: error.message }
    }
  },

  async addXP(tokenKey, amount) {
    try {
      const result = await this.getUserRewards(tokenKey)
      if (!result.success) {
        return result
      }

      const rewards = result.data
      const newXP = rewards.xp + amount
      const newLevel = this.calculateLevel(newXP)

      const encodedKey = encodeTokenKey(tokenKey)
      await update(ref(database, `gymai_rewards/${encodedKey}`), {
        xp: newXP,
        level: newLevel,
        lastXPUpdate: Date.now()
      })

      // Verificar se subiu de nível
      if (newLevel > rewards.level) {
        await this.unlockAchievement(tokenKey, 'level_up', {
          name: `Subiu para nível ${newLevel}`,
          points: newLevel * 100
        })
      }

      return { success: true, data: { xp: newXP, level: newLevel } }
    } catch (error) {
      console.error('Erro ao adicionar XP:', error)
      return { success: false, error: error.message }
    }
  },

  calculateLevel(xp) {
    for (let i = this.LEVELS.length - 1; i >= 0; i--) {
      if (xp >= this.LEVELS[i].xpRequired) {
        return this.LEVELS[i].level
      }
    }
    return 1
  },

  async unlockAchievement(tokenKey, achievementId, customData = null) {
    try {
      const achievement = customData || this.ACHIEVEMENTS[achievementId]
      if (!achievement) {
        return { success: false, error: 'Conquista não encontrada' }
      }

      const result = await this.getUserRewards(tokenKey)
      if (!result.success) {
        return result
      }

      const rewards = result.data

      // Verificar se já desbloqueou
      if (rewards.achievements && rewards.achievements.includes(achievementId)) {
        return { success: true, alreadyUnlocked: true }
      }

      // Adicionar conquista
      const achievements = rewards.achievements || []
      achievements.push(achievementId)

      const points = rewards.points + achievement.points

      const encodedKey = encodeTokenKey(tokenKey)
      await update(ref(database, `gymai_rewards/${encodedKey}`), {
        achievements,
        points,
        lastAchievement: {
          id: achievementId,
          unlockedAt: Date.now()
        }
      })

      // Adicionar XP
      await this.addXP(tokenKey, achievement.points)

      return { success: true, data: { achievement, points } }
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error)
      return { success: false, error: error.message }
    }
  },

  async checkAchievements(tokenKey, workoutData) {
    try {
      const result = await this.getUserRewards(tokenKey)
      if (!result.success) {
        return result
      }

      const rewards = result.data
      const unlockedAchievements = []

      // Verificar primeiro treino
      if (!rewards.achievements.includes('first_workout')) {
        await this.unlockAchievement(tokenKey, 'first_workout')
        unlockedAchievements.push('first_workout')
      }

      // Verificar volume
      const totalVolume = this.calculateTotalVolume(workoutData)
      if (totalVolume >= 10000 && !rewards.achievements.includes('volume_10000')) {
        await this.unlockAchievement(tokenKey, 'volume_10000')
        unlockedAchievements.push('volume_10000')
      }
      if (totalVolume >= 50000 && !rewards.achievements.includes('volume_50000')) {
        await this.unlockAchievement(tokenKey, 'volume_50000')
        unlockedAchievements.push('volume_50000')
      }

      // Verificar horário do treino
      const hour = new Date().getHours()
      if (hour < 6 && !rewards.achievements.includes('early_bird')) {
        await this.unlockAchievement(tokenKey, 'early_bird')
        unlockedAchievements.push('early_bird')
      }
      if (hour >= 22 && !rewards.achievements.includes('night_owl')) {
        await this.unlockAchievement(tokenKey, 'night_owl')
        unlockedAchievements.push('night_owl')
      }

      return { success: true, data: unlockedAchievements }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error)
      return { success: false, error: error.message }
    }
  },

  calculateTotalVolume(workoutData) {
    let totalVolume = 0
    if (workoutData.series) {
      workoutData.series.forEach(serie => {
        totalVolume += (serie.peso || 0) * (serie.reps || 0)
      })
    }
    return totalVolume
  },

  async checkStreakAchievements(tokenKey) {
    try {
      const encodedKey = encodeTokenKey(tokenKey)
      const snapshot = await get(ref(database, `gymai_dias_treino/${encodedKey}`))
      const dias = snapshot.val()

      if (!dias) {
        return { success: true, data: [] }
      }

      const diasArray = Object.values(dias)
      const diasMarcados = diasArray.length

      const result = await this.getUserRewards(tokenKey)
      if (!result.success) {
        return result
      }

      const rewards = result.data
      const unlockedAchievements = []

      // Verificar semana perfeita (7 dias)
      if (diasMarcados >= 7 && !rewards.achievements.includes('week_streak')) {
        await this.unlockAchievement(tokenKey, 'week_streak')
        unlockedAchievements.push('week_streak')
      }

      // Verificar mês perfeito (30 dias)
      if (diasMarcados >= 30 && !rewards.achievements.includes('month_streak')) {
        await this.unlockAchievement(tokenKey, 'month_streak')
        unlockedAchievements.push('month_streak')
      }

      return { success: true, data: unlockedAchievements }
    } catch (error) {
      console.error('Erro ao verificar conquistas de streak:', error)
      return { success: false, error: error.message }
    }
  },

  async getLeaderboard(limit = 10) {
    try {
      const snapshot = await get(ref(database, 'gymai_rewards'))
      const allRewards = snapshot.val()

      if (!allRewards) {
        return { success: true, data: [] }
      }

      const leaderboard = Object.entries(allRewards)
        .map(([tokenKey, rewards]) => ({
          tokenKey,
          xp: rewards.xp || 0,
          level: rewards.level || 1,
          points: rewards.points || 0
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit)

      return { success: true, data: leaderboard }
    } catch (error) {
      console.error('Erro ao buscar leaderboard:', error)
      return { success: false, error: error.message }
    }
  },

  async getLevelProgress(tokenKey) {
    try {
      const result = await this.getUserRewards(tokenKey)
      if (!result.success) {
        return result
      }

      const rewards = result.data
      const currentLevel = rewards.level || 1
      const currentXP = rewards.xp || 0

      const currentLevelData = this.LEVELS[currentLevel - 1]
      const nextLevelData = this.LEVELS[currentLevel]

      if (!nextLevelData) {
        return {
          success: true,
          data: {
            currentLevel,
            currentXP,
            maxLevel: true,
            progress: 100
          }
        }
      }

      const xpRequired = nextLevelData.xpRequired
      const xpInCurrentLevel = currentXP - currentLevelData.xpRequired
      const xpToNextLevel = xpRequired - currentLevelData.xpRequired
      const progress = Math.min(100, Math.round((xpInCurrentLevel / xpToNextLevel) * 100))

      return {
        success: true,
        data: {
          currentLevel,
          currentXP,
          nextLevel: nextLevelData.level,
          xpRequired,
          xpInCurrentLevel,
          progress
        }
      }
    } catch (error) {
      console.error('Erro ao buscar progresso de nível:', error)
      return { success: false, error: error.message }
    }
  }
}
