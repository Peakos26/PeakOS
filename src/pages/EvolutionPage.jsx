import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { reportService } from '@services/reportService'
import { trainingService } from '@services/trainingService'
import { database, ref, get } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

const EvolutionPage = () => {
  const { session } = useAuth()
  const [currentPage, setCurrentPage] = useState('evolucao')
  const [weeklyReport, setWeeklyReport] = useState(null)
  const [monthlyReport, setMonthlyReport] = useState(null)
  
  // Sprint 1.5: Analytics de Treino
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [muscleVolume, setMuscleVolume] = useState({})
  const [trainingFrequency, setTrainingFrequency] = useState([])
  const [consistencyCalendar, setConsistencyCalendar] = useState([])

  useEffect(() => {
    loadReports()
    loadWorkoutAnalytics()
  }, [session])

  const loadReports = async () => {
    if (!session) return

    const weeklyResult = await reportService.generateWeeklyReport(session.tokenKey)
    if (weeklyResult.success) {
      setWeeklyReport(weeklyResult.data)
    }

    const monthlyResult = await reportService.generateMonthlyReport(session.tokenKey)
    if (monthlyResult.success) {
      setMonthlyReport(monthlyResult.data)
    }
  }

  // Sprint 1.5: Carregar analytics de treino
  const loadWorkoutAnalytics = async () => {
    if (!session) return

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_log/${encodedKey}`))
      const logs = snapshot.val() || {}
      const logsArray = Object.values(logs).sort((a, b) => b.createdAt - a.createdAt)
      setWorkoutLogs(logsArray)

      // Sprint 1.5: Calcular volume por grupo muscular
      calculateMuscleVolume(logsArray)

      // Sprint 1.5: Calcular frequência de treino
      calculateTrainingFrequency(logsArray)

      // Sprint 1.5: Calcular calendário de consistência
      calculateConsistencyCalendar(logsArray)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    }
  }

  // Sprint 1.5: Calcular volume por grupo muscular por semana
  const calculateMuscleVolume = (logs) => {
    const volumeByMuscle = {}
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    logs.forEach(log => {
      if (log.createdAt < oneWeekAgo) return

      log.exercicios?.forEach(exercicio => {
        const muscle = exercicio.grupoMuscular || 'Geral'
        if (!volumeByMuscle[muscle]) {
          volumeByMuscle[muscle] = 0
        }

        exercicio.series?.forEach(serie => {
          volumeByMuscle[muscle] += (serie.peso * serie.reps) || 0
        })
      })
    })

    setMuscleVolume(volumeByMuscle)
  }

  // Sprint 1.5: Calcular frequência de treino (dias/semana)
  const calculateTrainingFrequency = (logs) => {
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]
    const frequency = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

    logs.forEach(log => {
      const dayOfWeek = new Date(log.createdAt).getDay()
      frequency[dayOfWeek]++
    })

    const frequencyArray = daysOfWeek.map(day => ({
      day: dayNames[day],
      count: frequency[day]
    }))

    setTrainingFrequency(frequencyArray)
  }

  // Sprint 1.5: Calcular calendário de consistência (últimos 30 dias)
  const calculateConsistencyCalendar = (logs) => {
    const calendar = []
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()

      // Verificar se houve treino neste dia
      const hasWorkout = logs.some(log => {
        const logDate = new Date(log.createdAt).toISOString().split('T')[0]
        return logDate === dateStr
      })

      calendar.push({
        date: dateStr,
        dayOfWeek,
        hasWorkout
      })
    }

    setConsistencyCalendar(calendar)
  }

  // Sprint 1.5: Calcular intensidade de cor para o heatmap
  const getHeatmapColor = (volume) => {
    if (volume === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (volume < 1000) return 'bg-green-100 dark:bg-green-900/30'
    if (volume < 3000) return 'bg-green-300 dark:bg-green-700/50'
    if (volume < 5000) return 'bg-green-500 dark:bg-green-600'
    return 'bg-green-700 dark:bg-green-500'
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Evolução</h1>

        {/* Sprint 1.5: Analytics de Treino */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Analytics de Treino</h2>
          
          {/* Sprint 1.5: Volume por grupo muscular */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Volume por Grupo Muscular (Última Semana)</h3>
            <div className="space-y-2">
              {Object.entries(muscleVolume).map(([muscle, volume]) => (
                <div key={muscle} className="flex items-center gap-3">
                  <div className="w-32 text-sm">{muscle}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, volume / 100)}%` }}
                    />
                  </div>
                  <div className="w-20 text-sm text-right">{Math.round(volume)} kg</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint 1.5: Frequência de treino */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Frequência de Treino (Dias da Semana)</h3>
            <div className="flex items-end gap-2 h-32">
              {trainingFrequency.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-600 rounded-t transition-all"
                    style={{ height: `${Math.min(100, item.count * 20)}%` }}
                  />
                  <div className="text-xs mt-2">{item.day.substring(0, 3)}</div>
                  <div className="text-xs text-[var(--color-muted)]">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint 1.5: Calendário de consistência */}
          <div>
            <h3 className="font-semibold mb-3">Consistência (Últimos 30 dias)</h3>
            <div className="grid grid-cols-7 gap-1">
              {consistencyCalendar.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded ${day.hasWorkout ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  title={day.date}
                />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-[var(--color-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-600 rounded" />
                <span>Treino</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <span>Descanso</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Relatório Semanal */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Relatório Semanal</h2>
          {weeklyReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Total de Séries</div>
                  <div className="text-2xl font-bold">{weeklyReport.totalSeries}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Volume Total</div>
                  <div className="text-2xl font-bold">{weeklyReport.totalVolume} kg</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Dias de Treino</div>
                  <div className="text-2xl font-bold">{weeklyReport.treinoDays.length}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Check-ins</div>
                  <div className="text-2xl font-bold">{weeklyReport.diasMarcados}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">Carregando...</p>
          )}
        </Card>

        {/* Relatório Mensal */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Relatório Mensal</h2>
          {monthlyReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Total de Séries</div>
                  <div className="text-2xl font-bold">{monthlyReport.totalSeries}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Volume Total</div>
                  <div className="text-2xl font-bold">{monthlyReport.totalVolume} kg</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Dias de Treino</div>
                  <div className="text-2xl font-bold">{monthlyReport.treinoDays.length}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)]">Check-ins</div>
                  <div className="text-2xl font-bold">{monthlyReport.diasMarcados}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">Carregando...</p>
          )}
        </Card>

        {/* Medidas */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Medidas Atuais</h2>
          {monthlyReport?.medidas ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[var(--color-muted)]">Peso</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.peso || 0} kg</div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-muted)]">Altura</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.altura || 0} cm</div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-muted)]">Cintura</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.cintura || 0} cm</div>
              </div>
              <div>
                <div className="text-sm text-[var(--color-muted)]">Peito</div>
                <div className="text-xl font-bold">{monthlyReport.medidas.peito || 0} cm</div>
              </div>
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">Nenhuma medida registrada</p>
          )}
        </Card>
      </main>

      <Navigation />
    </div>
  )
}

export default EvolutionPage
