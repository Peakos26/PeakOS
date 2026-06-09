import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import { Trophy, Award, Star, Zap, Flame, Target, Calendar, TrendingUp, Medal, Crown, Lock, Unlock } from 'lucide-react'

const AchievementsPage = () => {
  const { session } = useAuth()
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [notification, setNotification] = useState(null)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  const achievements = [
    // Volume
    { id: 'volume_100', name: 'Iniciante', description: 'Complete 100 séries totais', icon: '🏋️', category: 'volume', threshold: 100 },
    { id: 'volume_500', name: 'Intermediário', description: 'Complete 500 séries totais', icon: '💪', category: 'volume', threshold: 500 },
    { id: 'volume_1000', name: 'Avançado', description: 'Complete 1000 séries totais', icon: '🔥', category: 'volume', threshold: 1000 },
    { id: 'volume_5000', name: 'Veterano', description: 'Complete 5000 séries totais', icon: '⚡', category: 'volume', threshold: 5000 },
    { id: 'volume_10000', name: 'Lenda', description: 'Complete 10000 séries totais', icon: '👑', category: 'volume', threshold: 10000 },
    
    // Consistência
    { id: 'consistency_3', name: 'Começou Bem', description: 'Treine 3 dias consecutivos', icon: '🌟', category: 'consistency', threshold: 3 },
    { id: 'consistency_7', name: 'Semana Perfeita', description: 'Treine 7 dias consecutivos', icon: '🔥', category: 'consistency', threshold: 7 },
    { id: 'consistency_14', name: 'Duas Semanas', description: 'Treine 14 dias consecutivos', icon: '💎', category: 'consistency', threshold: 14 },
    { id: 'consistency_30', name: 'Mês Ininterrupto', description: 'Treine 30 dias consecutivos', icon: '🏆', category: 'consistency', threshold: 30 },
    { id: 'consistency_100', name: 'Centenário', description: 'Treine 100 dias consecutivos', icon: '👑', category: 'consistency', threshold: 100 },
    
    // PRs
    { id: 'pr_first', name: 'Primeiro PR', description: 'Bata seu primeiro PR', icon: '🎯', category: 'pr', threshold: 1 },
    { id: 'pr_5', name: 'Cinco PRs', description: 'Bate 5 PRs', icon: '🏅', category: 'pr', threshold: 5 },
    { id: 'pr_10', name: 'Dez PRs', description: 'Bate 10 PRs', icon: '🥇', category: 'pr', threshold: 10 },
    { id: 'pr_25', name: 'Vinte e Cinco PRs', description: 'Bate 25 PRs', icon: '🥈', category: 'pr', threshold: 25 },
    { id: 'pr_50', name: 'Cinquenta PRs', description: 'Bate 50 PRs', icon: '🥉', category: 'pr', threshold: 50 },
    
    // Primeiros Logs
    { id: 'first_workout', name: 'Primeiro Treino', description: 'Registre seu primeiro treino', icon: '📝', category: 'first', threshold: 1 },
    { id: 'first_food', name: 'Primeira Refeição', description: 'Registre sua primeira refeição', icon: '🍽️', category: 'first', threshold: 1 },
    { id: 'first_water', name: 'Primeiro Copo', description: 'Registre seu primeiro copo de água', icon: '💧', category: 'first', threshold: 1 },
    { id: 'first_sleep', name: 'Primeiro Sono', description: 'Registre seu primeiro sono', icon: '😴', category: 'first', threshold: 1 },
    { id: 'first_recovery', name: 'Primeira Recuperação', description: 'Registre sua primeira recuperação', icon: '🔋', category: 'first', threshold: 1 },
    
    // Streaks
    { id: 'streak_7', name: 'Streak de 7 Dias', description: 'Mantenha streak por 7 dias', icon: '🔥', category: 'streak', threshold: 7 },
    { id: 'streak_30', name: 'Streak de 30 Dias', description: 'Mantenha streak por 30 dias', icon: '💎', category: 'streak', threshold: 30 },
    { id: 'streak_90', name: 'Streak de 90 Dias', description: 'Mantenha streak por 90 dias', icon: '🏆', category: 'streak', threshold: 90 },
    { id: 'streak_180', name: 'Streak de 180 Dias', description: 'Mantenha streak por 180 dias', icon: '👑', category: 'streak', threshold: 180 },
    { id: 'streak_365', name: 'Streak de 365 Dias', description: 'Mantenha streak por 365 dias', icon: '🌟', category: 'streak', threshold: 365 },
    
    // Especiais
    { id: 'early_bird', name: 'Madrugador', description: 'Treine antes das 6h', icon: '🌅', category: 'special', threshold: 1 },
    { id: 'night_owl', name: 'Coruja', description: 'Treine depois das 22h', icon: '🦉', category: 'special', threshold: 1 },
    { id: 'weekend_warrior', name: 'Guerreiro de Fim de Semana', description: 'Treine no sábado e domingo', icon: '⚔️', category: 'special', threshold: 1 },
    { id: 'full_body', name: 'Corpo Completo', description: 'Treine todos os grupos musculares em uma semana', icon: '🏋️', category: 'special', threshold: 1 },
    { id: 'perfect_week', name: 'Semana Perfeita', description: 'Complete todas as metas da semana', icon: '✨', category: 'special', threshold: 1 }
  ]

  useEffect(() => {
    loadUnlockedAchievements()
  }, [session])

  const loadUnlockedAchievements = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_conquistas/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const unlockedArray = Object.values(data)
        setUnlockedAchievements(unlockedArray)
      }
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error)
    }
  }

  const checkAndUnlockAchievements = async (category, value) => {
    if (!session?.tokenKey) return
    
    const newUnlocks = []
    
    achievements.forEach(achievement => {
      if (achievement.category === category && achievement.threshold <= value) {
        const isUnlocked = unlockedAchievements.some(u => u.id === achievement.id)
        if (!isUnlocked) {
          newUnlocks.push(achievement)
        }
      }
    })
    
    if (newUnlocks.length > 0) {
      try {
        const encodedKey = encodeTokenKey(session.tokenKey)
        
        for (const achievement of newUnlocks) {
          const achievementRef = push(ref(database, `gymai_conquistas/${encodedKey}`))
          await set(achievementRef, {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            unlockedAt: Date.now()
          })
          
          setNotification({
            name: achievement.name,
            icon: achievement.icon,
            description: achievement.description
          })
          
          setTimeout(() => setNotification(null), 5000)
        }
        
        loadUnlockedAchievements()
      } catch (error) {
        console.error('Erro ao desbloquear conquista:', error)
      }
    }
  }

  const isUnlocked = (achievementId) => {
    return unlockedAchievements.some(u => u.id === achievementId)
  }

  const getUnlockedDate = (achievementId) => {
    const unlocked = unlockedAchievements.find(u => u.id === achievementId)
    return unlocked ? new Date(unlocked.unlockedAt).toLocaleDateString('pt-BR') : null
  }

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = []
    }
    acc[achievement.category].push(achievement)
    return acc
  }, {})

  const categoryNames = {
    volume: 'Volume',
    consistency: 'Consistência',
    pr: 'PRs',
    first: 'Primeiros Logs',
    streak: 'Streaks',
    special: 'Especiais'
  }

  const categoryIcons = {
    volume: TrendingUp,
    consistency: Flame,
    pr: Award,
    first: Star,
    streak: Calendar,
    special: Crown
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Conquistas</h1>
          <p className="text-[var(--color-muted)]">Desbloqueie troféus ao atingir seus objetivos</p>
        </div>

        {/* Notification */}
        {notification && (
          <Card className="mb-6 border-primary-600 border-2 bg-gradient-to-r from-primary-100 to-purple-100">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{notification.icon}</div>
              <div>
                <h3 className="font-bold text-lg">Conquista Desbloqueada!</h3>
                <p className="font-semibold">{notification.name}</p>
                <p className="text-sm text-[var(--color-muted)]">{notification.description}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={32} className="text-primary-600" />
              <div>
                <div className="text-2xl font-bold">{unlockedAchievements.length} / {achievements.length}</div>
                <div className="text-sm text-[var(--color-muted)]">Conquistas Desbloqueadas</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-[var(--color-muted)]">Progresso</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-[var(--color-border)] rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
            />
          </div>
        </Card>

        {/* Achievements by Category */}
        <div className="space-y-6">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
            const CategoryIcon = categoryIcons[category]
            return (
              <Card key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryIcon size={24} className="text-primary-600" />
                  <h2 className="text-xl font-bold">{categoryNames[category]}</h2>
                  <span className="text-sm text-[var(--color-muted)]">
                    ({categoryAchievements.filter(a => isUnlocked(a.id)).length} / {categoryAchievements.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAchievements.map((achievement) => {
                    const unlocked = isUnlocked(achievement.id)
                    const unlockedDate = getUnlockedDate(achievement.id)
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          unlocked
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-[var(--color-border)] opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-3xl">{achievement.icon}</div>
                          {unlocked ? (
                            <Unlock size={20} className="text-green-500" />
                          ) : (
                            <Lock size={20} className="text-[var(--color-muted)]" />
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{achievement.name}</h3>
                        <p className="text-sm text-[var(--color-muted)] mb-2">{achievement.description}</p>
                        {unlockedDate && (
                          <div className="text-xs text-green-600 font-medium">
                            Desbloqueado em {unlockedDate}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      </main>
  )
}

export default AchievementsPage
