import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Target, TrendingUp, Bell, RefreshCw, Check, AlertCircle } from 'lucide-react'

const SmartGoalsPage = () => {
  const { session } = useAuth()
  const [goals, setGoals] = useState(null)
  const [isReevaluating, setIsReevaluating] = useState(false)
  const [lastReevaluation, setLastReevaluation] = useState(null)
  const [goalHistory, setGoalHistory] = useState([])
  const [notifications, setNotifications] = useState([])

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadGoals()
    loadLastReevaluation()
    loadGoalHistory()
    checkForNotifications()
  }, [session])

  const loadGoals = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        setGoals(data)
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    }
  }

  const loadLastReevaluation = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas_reevaluation/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        setLastReevaluation(data)
      }
    } catch (error) {
      console.error('Erro ao carregar última reavaliação:', error)
    }
  }

  const loadGoalHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas_history/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([id, entry]) => ({
            id,
            ...entry
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)
        
        setGoalHistory(historyArray)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de metas:', error)
    }
  }

  const checkForNotifications = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas_notifications/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const notificationsArray = Object.entries(data)
          .map(([id, notif]) => ({
            id,
            ...notif
          }))
          .filter(n => !n.read)
        
        setNotifications(notificationsArray)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  const reevaluateGoals = async () => {
    if (!session?.tokenKey) return
    
    setIsReevaluating(true)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      
      // Coletar dados para reavaliação
      const workoutSnapshot = await get(ref(database, `gymai_treinos/${encodedKey}`))
      const workoutData = workoutSnapshot.val()
      
      const foodSnapshot = await get(ref(database, `gymai_diario_alimentar/${encodedKey}`))
      const foodData = foodSnapshot.val()
      
      const currentGoals = goals || {}
      
      // Analisar se usuário superou metas 3x seguidas
      const goalSuggestions = await analyzeGoalProgress(currentGoals, workoutData, foodData)
      
      // Salvar reavaliação
      const reevaluation = {
        timestamp: Date.now(),
        previousGoals: currentGoals,
        suggestions: goalSuggestions,
        applied: false
      }
      
      await set(ref(database, `gymai_metas_reevaluation/${encodedKey}`), reevaluation)
      setLastReevaluation(reevaluation)
      
      // Criar notificação se houver sugestões
      if (goalSuggestions.length > 0) {
        const notificationRef = push(ref(database, `gymai_metas_notifications/${encodedKey}`))
        await set(notificationRef, {
          type: 'goal_suggestion',
          message: `IA sugere ajustar suas metas: ${goalSuggestions.map(s => s.description).join(', ')}`,
          suggestions: goalSuggestions,
          read: false,
          timestamp: Date.now()
        })
        
        checkForNotifications()
      }
      
      setIsReevaluating(false)
    } catch (error) {
      console.error('Erro ao reavaliar metas:', error)
      setIsReevaluating(false)
    }
  }

  const analyzeGoalProgress = async (currentGoals, workoutData, foodData) => {
    const suggestions = []
    
    // Analisar meta de treino
    if (currentGoals.workoutDays) {
      const workoutDays = workoutData ? Object.keys(workoutData).length : 0
      if (workoutDays > currentGoals.workoutDays) {
        suggestions.push({
          type: 'workout',
          description: 'Aumentar dias de treino',
          currentValue: workoutDays,
          suggestedValue: workoutDays + 1,
          reason: 'Você tem superado sua meta de treino consistentemente'
        })
      }
    }
    
    // Analisar meta calórica
    if (currentGoals.calories) {
      const totalCalories = calculateTotalCalories(foodData)
      if (totalCalories > currentGoals.calories * 1.05) {
        suggestions.push({
          type: 'calories',
          description: 'Aumentar meta calórica',
          currentValue: currentGoals.calories,
          suggestedValue: Math.round(currentGoals.calories * 1.1),
          reason: 'Você tem consumido mais calorias que sua meta atual'
        })
      }
    }
    
    // Analisar meta de proteína
    if (currentGoals.protein) {
      const totalProtein = calculateTotalProtein(foodData)
      if (totalProtein > currentGoals.protein * 1.05) {
        suggestions.push({
          type: 'protein',
          description: 'Aumentar meta de proteína',
          currentValue: currentGoals.protein,
          suggestedValue: Math.round(currentGoals.protein * 1.1),
          reason: 'Você tem consumido mais proteína que sua meta atual'
        })
      }
    }
    
    return suggestions
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

  const calculateTotalProtein = (foodData) => {
    if (!foodData) return 0
    let total = 0
    Object.values(foodData).forEach(day => {
      if (Array.isArray(day)) {
        day.forEach(meal => {
          total += meal.protein || 0
        })
      }
    })
    return total
  }

  const applySuggestion = async (suggestion) => {
    if (!session?.tokenKey || !goals) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      
      const updatedGoals = { ...goals }
      
      switch (suggestion.type) {
        case 'workout':
          updatedGoals.workoutDays = suggestion.suggestedValue
          break
        case 'calories':
          updatedGoals.calories = suggestion.suggestedValue
          break
        case 'protein':
          updatedGoals.protein = suggestion.suggestedValue
          break
      }
      
      // Salvar metas atualizadas
      await set(ref(database, `gymai_metas/${encodedKey}`), updatedGoals)
      
      // Salvar no histórico
      const historyRef = push(ref(database, `gymai_metas_history/${encodedKey}`))
      await set(historyRef, {
        previousGoals: goals,
        newGoals: updatedGoals,
        reason: suggestion.reason,
        timestamp: Date.now()
      })
      
      // Marcar notificação como lida
      if (notifications.length > 0) {
        await set(ref(database, `gymai_metas_notifications/${encodedKey}/${notifications[0].id}/read`), true)
      }
      
      setGoals(updatedGoals)
      loadGoalHistory()
      checkForNotifications()
      
      alert('Meta atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao aplicar sugestão:', error)
    }
  }

  const dismissNotification = async (id) => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_metas_notifications/${encodedKey}/${id}/read`), true)
      
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error('Erro ao descartar notificação:', error)
    }
  }

  const getDaysSinceReevaluation = () => {
    if (!lastReevaluation?.timestamp) return null
    const days = Math.floor((Date.now() - lastReevaluation.timestamp) / (1000 * 60 * 60 * 24))
    return days
  }

  const shouldReevaluate = () => {
    const days = getDaysSinceReevaluation()
    return days === null || days >= 28
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Metas Inteligentes</h1>
          <p className="text-[var(--color-muted)]">Metas adaptativas que evoluem com você</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          {notifications.length > 0 && (
            <Card className="border-primary-600 border-2">
              <div className="flex items-start gap-3">
                <Bell size={24} className="text-primary-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Sugestão da IA</h3>
                  <p className="text-sm text-[var(--color-muted)] mb-4">{notifications[0].message}</p>
                  {notifications[0].suggestions && notifications[0].suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-[var(--color-border)] rounded-lg mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{suggestion.description}</span>
                        <span className="text-sm text-[var(--color-muted)]">
                          {suggestion.currentValue} → {suggestion.suggestedValue}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">{suggestion.reason}</p>
                      <Button size="sm" onClick={() => applySuggestion(suggestion)} className="mt-2">
                        <Check size={16} className="mr-2" />
                        Aplicar
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => dismissNotification(notifications[0].id)}>
                    Descartar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Current Goals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Metas Atuais</h2>
              </div>
              <Button onClick={reevaluateGoals} disabled={isReevaluating || !shouldReevaluate()}>
                {isReevaluating ? 'Reavaliando...' : shouldReevaluate() ? 'Reavaliar Metas' : 'Aguardar 4 semanas'}
              </Button>
            </div>

            {goals ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="text-sm text-[var(--color-muted)] mb-1">Dias de Treino</div>
                    <div className="text-2xl font-bold">{goals.workoutDays || '-'}</div>
                  </div>
                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="text-sm text-[var(--color-muted)] mb-1">Calorias</div>
                    <div className="text-2xl font-bold">{goals.calories || '-'}</div>
                  </div>
                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="text-sm text-[var(--color-muted)] mb-1">Proteína (g)</div>
                    <div className="text-2xl font-bold">{goals.protein || '-'}</div>
                  </div>
                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="text-sm text-[var(--color-muted)] mb-1">Carboidratos (g)</div>
                    <div className="text-2xl font-bold">{goals.carbs || '-'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <RefreshCw size={16} />
                  <span>
                    Última reavaliação: {lastReevaluation 
                      ? `${getDaysSinceReevaluation()} dias atrás` 
                      : 'Nunca'}
                  </span>
                </div>

                {shouldReevaluate() && (
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span className="text-sm">Reavaliação recomendada (4 semanas desde última)</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-[var(--color-muted)] py-8">
                Nenhuma meta configurada. Configure suas metas na página de Macros.
              </p>
            )}
          </Card>

          {/* Goal History */}
          {goalHistory.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold mb-4">Histórico de Ajustes</h2>
              <div className="space-y-3">
                {goalHistory.map((entry, index) => (
                  <div key={index} className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--color-muted)]">
                        {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                        {entry.reason}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[var(--color-muted)]">Antes:</span>{' '}
                      <span className="font-medium">{entry.previousGoals?.calories || '-'} kcal</span>
                      <span className="mx-2">→</span>
                      <span className="text-[var(--color-muted)]">Depois:</span>{' '}
                      <span className="font-medium">{entry.newGoals?.calories || '-'} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <div className="flex items-start gap-3">
              <TrendingUp size={24} className="text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Como Funciona</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  O sistema reavalia suas metas automaticamente a cada 4 semanas. 
                  Se você supera uma meta 3x seguidas, a IA sugere aumentá-la. 
                  Você pode aplicar ou descartar as sugestões conforme preferir.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
  )
}

export default SmartGoalsPage
