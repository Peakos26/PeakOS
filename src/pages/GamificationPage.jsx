import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { Trophy, Star, Zap, Flame, Target, Calendar, TrendingUp, Medal, Crown, Shield, Share2, Award } from 'lucide-react'

const GamificationPage = () => {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState('levels')
  const [userLevel, setUserLevel] = useState(1)
  const [userXP, setUserXP] = useState(0)
  const [workoutStreak, setWorkoutStreak] = useState(0)
  const [foodStreak, setFoodStreak] = useState(0)
  const [maxWorkoutStreak, setMaxWorkoutStreak] = useState(0)
  const [maxFoodStreak, setMaxFoodStreak] = useState(0)
  const [streakProtectors, setStreakProtectors] = useState(0)
  const [weeklyChallenges, setWeeklyChallenges] = useState([])
  const [isGeneratingChallenges, setIsGeneratingChallenges] = useState(false)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  const levels = [
    { level: 1, name: 'Iniciante', icon: '🌱', xpRequired: 0, color: 'text-green-500' },
    { level: 2, name: 'Bronze', icon: '🥉', xpRequired: 100, color: 'text-orange-500' },
    { level: 3, name: 'Prata', icon: '🥈', xpRequired: 300, color: 'text-gray-400' },
    { level: 4, name: 'Ouro', icon: '🥇', xpRequired: 600, color: 'text-yellow-500' },
    { level: 5, name: 'Platina', icon: '💎', xpRequired: 1000, color: 'text-blue-400' },
    { level: 6, name: 'Diamante', icon: '💠', xpRequired: 1500, color: 'text-cyan-400' },
    { level: 7, name: 'Mestre', icon: '🏆', xpRequired: 2500, color: 'text-purple-500' },
    { level: 8, name: 'Grão-Mestre', icon: '👑', xpRequired: 4000, color: 'text-yellow-400' },
    { level: 9, name: 'Lenda', icon: '⭐', xpRequired: 6000, color: 'text-amber-400' },
    { level: 10, name: 'Imortal', icon: '🌟', xpRequired: 10000, color: 'text-red-500' }
  ]

  useEffect(() => {
    loadUserData()
    loadStreaks()
    loadWeeklyChallenges()
  }, [session])

  const loadUserData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_gamification/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        setUserLevel(data.level || 1)
        setUserXP(data.xp || 0)
        setStreakProtectors(data.streakProtectors || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error)
    }
  }

  const loadStreaks = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_streaks/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        setWorkoutStreak(data.workoutStreak || 0)
        setFoodStreak(data.foodStreak || 0)
        setMaxWorkoutStreak(data.maxWorkoutStreak || 0)
        setMaxFoodStreak(data.maxFoodStreak || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar streaks:', error)
    }
  }

  const loadWeeklyChallenges = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const currentWeek = getCurrentWeekId()
      const snapshot = await get(ref(database, `gymai_desafios/${encodedKey}/${currentWeek}`))
      const data = snapshot.val()
      if (data) {
        setWeeklyChallenges(data.challenges || [])
      }
    } catch (error) {
      console.error('Erro ao carregar desafios:', error)
    }
  }

  const getCurrentWeekId = () => {
    const now = new Date()
    const year = now.getFullYear()
    const week = Math.ceil(now.getDate() / 7)
    return `${year}-W${week}`
  }

  const addXP = async (amount, reason) => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const newXP = userXP + amount
      const newLevel = calculateLevel(newXP)
      
      await set(ref(database, `gymai_gamification/${encodedKey}`), {
        level: newLevel,
        xp: newXP,
        streakProtectors,
        lastUpdated: Date.now()
      })
      
      setUserLevel(newLevel)
      setUserXP(newXP)
      
      if (newLevel > userLevel) {
        alert(`🎉 Parabéns! Você alcançou o nível ${newLevel} - ${levels[newLevel - 1].name}!`)
      }
    } catch (error) {
      console.error('Erro ao adicionar XP:', error)
    }
  }

  const calculateLevel = (xp) => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].xpRequired) {
        return levels[i].level
      }
    }
    return 1
  }

  const getXPToNextLevel = () => {
    const currentLevelObj = levels[userLevel - 1]
    const nextLevelObj = levels[userLevel]
    if (!nextLevelObj) return 0
    return nextLevelObj.xpRequired - userXP
  }

  const getXPProgress = () => {
    const currentLevelObj = levels[userLevel - 1]
    const nextLevelObj = levels[userLevel]
    if (!nextLevelObj) return 100
    const xpInRange = nextLevelObj.xpRequired - currentLevelObj.xpRequired
    const xpProgress = userXP - currentLevelObj.xpRequired
    return (xpProgress / xpInRange) * 100
  }

  const updateStreak = async (type, increment) => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      
      let newWorkoutStreak = workoutStreak
      let newFoodStreak = foodStreak
      let newMaxWorkoutStreak = maxWorkoutStreak
      let newMaxFoodStreak = maxFoodStreak
      
      if (type === 'workout') {
        newWorkoutStreak = increment ? workoutStreak + 1 : 0
        if (newWorkoutStreak > maxWorkoutStreak) {
          newMaxWorkoutStreak = newWorkoutStreak
        }
      } else if (type === 'food') {
        newFoodStreak = increment ? foodStreak + 1 : 0
        if (newFoodStreak > maxFoodStreak) {
          newMaxFoodStreak = newFoodStreak
        }
      }
      
      await set(ref(database, `gymai_streaks/${encodedKey}`), {
        workoutStreak: newWorkoutStreak,
        foodStreak: newFoodStreak,
        maxWorkoutStreak: newMaxWorkoutStreak,
        maxFoodStreak: newMaxFoodStreak,
        lastUpdated: Date.now()
      })
      
      setWorkoutStreak(newWorkoutStreak)
      setFoodStreak(newFoodStreak)
      setMaxWorkoutStreak(newMaxWorkoutStreak)
      setMaxFoodStreak(newMaxFoodStreak)
      
      if (increment) {
        addXP(10, 'streak mantida')
      }
    } catch (error) {
      console.error('Erro ao atualizar streak:', error)
    }
  }

  const useStreakProtector = async () => {
    if (streakProtectors <= 0) {
      alert('Você não tem protetores de streak disponíveis.')
      return
    }
    
    if (!confirm('Deseja usar um protetor de streak para salvar sua sequência atual?')) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const newProtectors = streakProtectors - 1
      
      await set(ref(database, `gymai_gamification/${encodedKey}/streakProtectors`), newProtectors)
      setStreakProtectors(newProtectors)
      
      alert('Protetor de streak usado! Sua sequência foi salva.')
    } catch (error) {
      console.error('Erro ao usar protetor de streak:', error)
    }
  }

  const generateWeeklyChallenges = async () => {
    if (!session?.tokenKey) return
    
    setIsGeneratingChallenges(true)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const currentWeek = getCurrentWeekId()
      
      // Em produção, usar IA para gerar desafios personalizados
      const challenges = [
        {
          id: 1,
          title: '100 Séries',
          description: 'Complete 100 séries essa semana',
          target: 100,
          progress: 0,
          xpReward: 200,
          completed: false,
          icon: '🏋️'
        },
        {
          id: 2,
          title: '5 Dias de Treino',
          description: 'Treine 5 dias essa semana',
          target: 5,
          progress: 0,
          xpReward: 150,
          completed: false,
          icon: '📅'
        },
        {
          id: 3,
          title: 'Meta de Proteína',
          description: 'Atinja sua meta de proteína 5 dias',
          target: 5,
          progress: 0,
          xpReward: 100,
          completed: false,
          icon: '💪'
        }
      ]
      
      await set(ref(database, `gymai_desafios/${encodedKey}/${currentWeek}`), {
        challenges,
        createdAt: Date.now()
      })
      
      setWeeklyChallenges(challenges)
      setIsGeneratingChallenges(false)
    } catch (error) {
      console.error('Erro ao gerar desafios:', error)
      setIsGeneratingChallenges(false)
    }
  }

  const updateChallengeProgress = async (challengeId, progress) => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const currentWeek = getCurrentWeekId()
      
      const updatedChallenges = weeklyChallenges.map(challenge => {
        if (challenge.id === challengeId) {
          const newProgress = progress
          const completed = newProgress >= challenge.target
          return {
            ...challenge,
            progress: newProgress,
            completed
          }
        }
        return challenge
      })
      
      await set(ref(database, `gymai_desafios/${encodedKey}/${currentWeek}/challenges`), updatedChallenges)
      
      const completedChallenge = updatedChallenges.find(c => c.id === challengeId && c.completed && !weeklyChallenges.find(oc => oc.id === challengeId)?.completed)
      
      if (completedChallenge) {
        addXP(completedChallenge.xpReward * 2, 'desafio completado')
        alert(`🎉 Desafio "${completedChallenge.title}" completado! +${completedChallenge.xpReward * 2} XP`)
      }
      
      setWeeklyChallenges(updatedChallenges)
    } catch (error) {
      console.error('Erro ao atualizar progresso do desafio:', error)
    }
  }

  const shareWorkout = async (workoutData) => {
    if (!navigator.share) {
      alert('Seu navegador não suporta compartilhamento nativo.')
      return
    }
    
    try {
      const shareData = {
        title: 'Meu Treino - PeakOS',
        text: `Treino de hoje:\n${workoutData.exercises.map(e => `${e.name} - ${e.sets}x${e.reps}`).join('\n')}\n\nVolume Total: ${workoutData.totalVolume}kg`,
        url: window.location.href
      }
      
      await navigator.share(shareData)
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const currentLevelData = levels[userLevel - 1]

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Gamificação</h1>
          <p className="text-[var(--color-muted)]">Suba de nível, conquiste troféus e complete desafios</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('levels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'levels'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Star size={20} />
            Níveis
          </button>
          <button
            onClick={() => setActiveTab('streaks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'streaks'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Flame size={20} />
            Streaks
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'challenges'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Target size={20} />
            Desafios
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'share'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Share2 size={20} />
            Compartilhar
          </button>
        </div>

        {activeTab === 'levels' && (
          <div className="space-y-6">
            {/* Current Level */}
            <Card>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl">{currentLevelData.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold">Nível {userLevel} - {currentLevelData.name}</h2>
                  <p className="text-[var(--color-muted)]">{userXP} XP</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso para o próximo nível</span>
                  <span>{getXPToNextLevel()} XP restantes</span>
                </div>
                <div className="w-full bg-[var(--color-border)] rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-purple-600 h-4 rounded-full transition-all"
                    style={{ width: `${getXPProgress()}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-[var(--color-border)] rounded-lg">
                  <div className="font-medium">XP Ganho Hoje</div>
                  <div className="text-2xl font-bold text-primary-600">0</div>
                </div>
                <div className="p-3 bg-[var(--color-border)] rounded-lg">
                  <div className="font-medium">Protetores de Streak</div>
                  <div className="text-2xl font-bold text-orange-600">{streakProtectors}</div>
                </div>
              </div>
            </Card>

            {/* All Levels */}
            <Card>
              <h3 className="font-bold mb-4">Todos os Níveis</h3>
              <div className="space-y-2">
                {levels.map((level) => (
                  <div
                    key={level.level}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      level.level === userLevel
                        ? 'bg-primary-100 border-2 border-primary-600'
                        : level.level < userLevel
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-[var(--color-border)] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <div className="font-medium">Nível {level.level} - {level.name}</div>
                        <div className="text-sm text-[var(--color-muted)]">{level.xpRequired} XP</div>
                      </div>
                    </div>
                    {level.level < userLevel && <Award size={20} className="text-green-500" />}
                  </div>
                ))}
              </div>
            </Card>

            {/* XP Rewards */}
            <Card>
              <h3 className="font-bold mb-4">Como Ganhar XP</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-[var(--color-border)] rounded">
                  <span>Treino logado</span>
                  <span className="font-bold text-primary-600">+50 XP</span>
                </div>
                <div className="flex justify-between p-2 bg-[var(--color-border)] rounded">
                  <span>Meta de calorias atingida</span>
                  <span className="font-bold text-primary-600">+30 XP</span>
                </div>
                <div className="flex justify-between p-2 bg-[var(--color-border)] rounded">
                  <span>Meta de proteína atingida</span>
                  <span className="font-bold text-primary-600">+30 XP</span>
                </div>
                <div className="flex justify-between p-2 bg-[var(--color-border)] rounded">
                  <span>Streak mantida</span>
                  <span className="font-bold text-primary-600">+10 XP</span>
                </div>
                <div className="flex justify-between p-2 bg-[var(--color-border)] rounded">
                  <span>Desafio completado</span>
                  <span className="font-bold text-primary-600">+100-200 XP (dobrado!)</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'streaks' && (
          <div className="space-y-6">
            {/* Workout Streak */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Flame size={32} className="text-orange-500" />
                  <div>
                    <h3 className="text-xl font-bold">Streak de Treino</h3>
                    <p className="text-[var(--color-muted)]">Dias consecutivos treinando</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">{workoutStreak}</div>
                  <div className="text-sm text-[var(--color-muted)]">dias</div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-sm">
                <span className="font-medium">Recorde:</span> {maxWorkoutStreak} dias
              </div>
            </Card>

            {/* Food Streak */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Trophy size={32} className="text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold">Streak de Dieta</h3>
                    <p className="text-[var(--color-muted)]">Dias consecutivos registrando alimentação</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500">{foodStreak}</div>
                  <div className="text-sm text-[var(--color-muted)]">dias</div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-sm">
                <span className="font-medium">Recorde:</span> {maxFoodStreak} dias
              </div>
            </Card>

            {/* Streak Protector */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield size={32} className="text-blue-500" />
                  <div>
                    <h3 className="text-xl font-bold">Protetor de Streak</h3>
                    <p className="text-[var(--color-muted)]">Salve seu streak 1x por mês</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-500">{streakProtectors}</div>
                  <div className="text-sm text-[var(--color-muted)]">disponíveis</div>
                </div>
              </div>
              <Button onClick={useStreakProtector} disabled={streakProtectors <= 0} className="w-full">
                Usar Protetor de Streak
              </Button>
            </Card>

            {/* Test Buttons */}
            <Card>
              <h3 className="font-bold mb-4">Testar Streaks</h3>
              <div className="space-y-2">
                <Button onClick={() => updateStreak('workout', true)} variant="outline" className="w-full">
                  +1 Dia de Treino
                </Button>
                <Button onClick={() => updateStreak('workout', false)} variant="outline" className="w-full">
                  -1 Dia de Treino (quebrar streak)
                </Button>
                <Button onClick={() => updateStreak('food', true)} variant="outline" className="w-full">
                  +1 Dia de Dieta
                </Button>
                <Button onClick={() => updateStreak('food', false)} variant="outline" className="w-full">
                  -1 Dia de Dieta (quebrar streak)
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Desafios da Semana</h2>
                  <p className="text-sm text-[var(--color-muted)]">Complete para ganhar XP dobrado!</p>
                </div>
                <Button onClick={generateWeeklyChallenges} disabled={isGeneratingChallenges}>
                  {isGeneratingChallenges ? 'Gerando...' : 'Gerar Novos Desafios'}
                </Button>
              </div>

              {weeklyChallenges.length === 0 ? (
                <p className="text-center text-[var(--color-muted)] py-8">
                  Nenhum desafio ativo. Clique em "Gerar Novos Desafios" para começar!
                </p>
              ) : (
                <div className="space-y-4">
                  {weeklyChallenges.map((challenge) => (
                    <Card key={challenge.id} className={challenge.completed ? 'border-green-500 border-2' : ''}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{challenge.icon}</span>
                          <div>
                            <h3 className="font-semibold">{challenge.title}</h3>
                            <p className="text-sm text-[var(--color-muted)]">{challenge.description}</p>
                          </div>
                        </div>
                        {challenge.completed && <Award size={24} className="text-green-500" />}
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progresso</span>
                          <span>{challenge.progress} / {challenge.target}</span>
                        </div>
                        <div className="w-full bg-[var(--color-border)] rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${challenge.completed ? 'bg-green-500' : 'bg-primary-600'}`}
                            style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary-600">
                          {challenge.completed ? '✓ Completado!' : `+${challenge.xpReward * 2} XP`}
                        </span>
                        {!challenge.completed && (
                          <Button size="sm" onClick={() => updateChallengeProgress(challenge.id, challenge.progress + 1)}>
                            +1 Progresso
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Share2 size={32} className="text-primary-600" />
                <div>
                  <h2 className="text-xl font-bold">Compartilhar Treino</h2>
                  <p className="text-sm text-[var(--color-muted)]">Mostre seus resultados nas redes sociais</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <h3 className="font-semibold mb-2">Como funciona</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    Após completar um treino, você pode gerar um card visual com seus resultados
                    e compartilhar diretamente no WhatsApp, Instagram, Twitter e outras redes sociais.
                  </p>
                </div>

                <Button onClick={() => shareWorkout({ exercises: [{ name: 'Agachamento', sets: 4, reps: 10 }], totalVolume: 4000 })} className="w-full">
                  <Share2 size={20} className="mr-2" />
                  Testar Compartilhamento
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4">Informações do Card</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-primary-600" />
                  <span>Exercícios realizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary-600" />
                  <span>Volume total levantado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-primary-600" />
                  <span>PRs batidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary-600" />
                  <span>Data do treino</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}

export default GamificationPage
