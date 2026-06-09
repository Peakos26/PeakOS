import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { Calendar, TrendingUp, CheckCircle, AlertTriangle, BarChart3, Clock, Dumbbell, Utensils } from 'lucide-react'

const WeeklyInsightsPage = () => {
  const { session } = useAuth()
  const [currentInsight, setCurrentInsight] = useState(null)
  const [previousInsight, setPreviousInsight] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [history, setHistory] = useState([])

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  const getWeekId = (date = new Date()) => {
    const year = date.getFullYear()
    const week = Math.ceil(date.getDate() / 7)
    return `${year}-W${week}`
  }

  const getPreviousWeekId = () => {
    const previousDate = new Date()
    previousDate.setDate(previousDate.getDate() - 7)
    return getWeekId(previousDate)
  }

  useEffect(() => {
    loadCurrentInsight()
    loadPreviousInsight()
    loadInsightHistory()
  }, [session])

  const loadCurrentInsight = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const currentWeekId = getWeekId()
      const snapshot = await get(ref(database, `gymai_insights/${encodedKey}/${currentWeekId}`))
      const data = snapshot.val()
      if (data) {
        setCurrentInsight(data)
      }
    } catch (error) {
      console.error('Erro ao carregar insight atual:', error)
    }
  }

  const loadPreviousInsight = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const previousWeekId = getPreviousWeekId()
      const snapshot = await get(ref(database, `gymai_insights/${encodedKey}/${previousWeekId}`))
      const data = snapshot.val()
      if (data) {
        setPreviousInsight(data)
      }
    } catch (error) {
      console.error('Erro ao carregar insight anterior:', error)
    }
  }

  const loadInsightHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_insights/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([weekId, insight]) => ({
            weekId,
            ...insight
          }))
          .sort((a, b) => b.weekId.localeCompare(a.weekId))
          .slice(0, 8)
        
        setHistory(historyArray)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de insights:', error)
    }
  }

  const generateInsight = async () => {
    if (!session?.tokenKey) return
    
    setIsGenerating(true)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const currentWeekId = getWeekId()
      
      // Coletar dados da semana
      const workoutSnapshot = await get(ref(database, `gymai_treinos/${encodedKey}`))
      const workoutData = workoutSnapshot.val()
      
      const foodSnapshot = await get(ref(database, `gymai_diario_alimentar/${encodedKey}`))
      const foodData = foodSnapshot.val()
      
      const sleepSnapshot = await get(ref(database, `gymai_sono/${encodedKey}`))
      const sleepData = sleepSnapshot.val()
      
      const recoverySnapshot = await get(ref(database, `gymai_recuperacao/${encodedKey}`))
      const recoveryData = recoverySnapshot.val()
      
      // Gerar insight (em produção, usar IA)
      setTimeout(async () => {
        const workoutDays = workoutData ? Object.keys(workoutData).length : 0
        const foodDays = foodData ? Object.keys(foodData).length : 0
        const avgSleep = sleepData ? calculateAverageSleep(sleepData) : 7
        const avgRecovery = recoveryData ? calculateAverageRecovery(recoveryData) : 7
        
        const insight = {
          positivePoints: [
            `Você treinou ${workoutDays} dias essa semana`,
            `Manteve registro alimentar em ${foodDays} dias`,
            `Média de sono: ${avgSleep.toFixed(1)} horas`,
            `Média de recuperação: ${avgRecovery.toFixed(1)}/10`
          ],
          improvements: [
            workoutDays < 4 ? 'Aumentar frequência de treino para 4+ dias' : 'Excelente consistência!',
            foodDays < 5 ? 'Registrar alimentação mais frequentemente' : 'Ótimo controle nutricional!',
            avgSleep < 7 ? 'Melhorar qualidade do sono' : 'Sono adequado!',
            avgRecovery < 6 ? 'Focar mais em recuperação' : 'Recuperação excelente!'
          ].filter(item => !item.includes('Excelente') && !item.includes('Ótimo') && !item.includes('adequado') && !item.includes('excelente')),
          comparison: previousInsight 
            ? generateComparison(previousInsight, { workoutDays, foodDays, avgSleep, avgRecovery })
            : 'Primeira semana registrada. Continue assim!',
          metrics: {
            workoutDays,
            foodDays,
            avgSleep,
            avgRecovery,
            totalVolume: calculateTotalVolume(workoutData),
            totalCalories: calculateTotalCalories(foodData)
          },
          timestamp: Date.now()
        }
        
        await set(ref(database, `gymai_insights/${encodedKey}/${currentWeekId}`), insight)
        setCurrentInsight(insight)
        loadInsightHistory()
        setIsGenerating(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao gerar insight:', error)
      setIsGenerating(false)
    }
  }

  const calculateAverageSleep = (sleepData) => {
    const entries = Object.values(sleepData)
    const total = entries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
    return total / entries.length
  }

  const calculateAverageRecovery = (recoveryData) => {
    const entries = Object.values(recoveryData)
    const total = entries.reduce((sum, entry) => sum + (entry.fatigueLevel || 5), 0)
    return total / entries.length
  }

  const calculateTotalVolume = (workoutData) => {
    if (!workoutData) return 0
    let total = 0
    Object.values(workoutData).forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(ex => {
          total += (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0)
        })
      }
    })
    return total
  }

  const calculateTotalCalories = (foodData) => {
    if (!foodData) return 0
    let total = 0
    Object.values(foodData).forEach(day => {
      if (Array.isArray(day)) {
        day.forEach(meal => {
          total += meal.calories || 0
        })
      }
    })
    return total
  }

  const generateComparison = (previous, current) => {
    const workoutChange = current.workoutDays - (previous.metrics?.workoutDays || 0)
    const sleepChange = current.avgSleep - (previous.metrics?.avgSleep || 0)
    
    let comparison = 'Comparado à semana anterior: '
    
    if (workoutChange > 0) {
      comparison += `Você treinou ${workoutChange} dia(s) a mais. `
    } else if (workoutChange < 0) {
      comparison += `Você treinou ${Math.abs(workoutChange)} dia(s) a menos. `
    } else {
      comparison += 'Manteve a mesma frequência de treino. '
    }
    
    if (sleepChange > 0.5) {
      comparison += `Sono melhorou em ${sleepChange.toFixed(1)} horas.`
    } else if (sleepChange < -0.5) {
      comparison += `Sono piorou em ${Math.abs(sleepChange).toFixed(1)} horas.`
    } else {
      comparison += 'Sono se manteve estável.'
    }
    
    return comparison
  }

  const formatWeekId = (weekId) => {
    const [year, week] = weekId.split('-W')
    return `Semana ${week} de ${year}`
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Insights Semanais</h1>
          <p className="text-[var(--color-muted)]">Análise automática da sua semana de treino e nutrição</p>
        </div>

        <div className="space-y-6">
          {/* Current Week Insight */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Semana Atual</h2>
              </div>
              <Button onClick={generateInsight} disabled={isGenerating}>
                {isGenerating ? 'Gerando...' : 'Gerar Insight'}
              </Button>
            </div>

            {currentInsight ? (
              <div className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                    <Dumbbell size={24} className="mx-auto mb-2 text-primary-600" />
                    <div className="text-2xl font-bold">{currentInsight.metrics?.workoutDays || 0}</div>
                    <div className="text-sm text-[var(--color-muted)]">Dias de Treino</div>
                  </div>
                  <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                    <Utensils size={24} className="mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{currentInsight.metrics?.foodDays || 0}</div>
                    <div className="text-sm text-[var(--color-muted)]">Dias de Dieta</div>
                  </div>
                  <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                    <Clock size={24} className="mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{(currentInsight.metrics?.avgSleep || 0).toFixed(1)}h</div>
                    <div className="text-sm text-[var(--color-muted)]">Sono Médio</div>
                  </div>
                  <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
                    <BarChart3 size={24} className="mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">{(currentInsight.metrics?.avgRecovery || 0).toFixed(1)}</div>
                    <div className="text-sm text-[var(--color-muted)]">Recuperação</div>
                  </div>
                </div>

                {/* Positive Points */}
                <div>
                  <h3 className="font-semibold mb-2 text-green-600 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Pontos Positivos
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[var(--color-muted)]">
                    {currentInsight.positivePoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                {currentInsight.improvements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-orange-600 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Áreas de Melhoria
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-[var(--color-muted)]">
                      {currentInsight.improvements.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comparison */}
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <p className="text-sm text-[var(--color-muted)] flex items-center gap-2">
                    <TrendingUp size={16} />
                    {currentInsight.comparison}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-[var(--color-muted)] py-8">
                Clique em "Gerar Insight" para analisar sua semana.
              </p>
            )}
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold mb-4">Histórico (8 semanas)</h2>
              <div className="space-y-3">
                {history.map((insight, index) => (
                  <div key={index} className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{formatWeekId(insight.weekId)}</h3>
                      <span className="text-xs text-[var(--color-muted)]">
                        {new Date(insight.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-[var(--color-muted)]">Treino:</span>{' '}
                        <span className="font-medium">{insight.metrics?.workoutDays || 0} dias</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-muted)]">Dieta:</span>{' '}
                        <span className="font-medium">{insight.metrics?.foodDays || 0} dias</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-muted)]">Sono:</span>{' '}
                        <span className="font-medium">{(insight.metrics?.avgSleep || 0).toFixed(1)}h</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-muted)]">Recup:</span>{' '}
                        <span className="font-medium">{(insight.metrics?.avgRecovery || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
  )
}

export default WeeklyInsightsPage
