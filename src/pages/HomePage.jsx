import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { DIAS_LABEL } from '@constants/trainingConstants'
import { trainingService } from '@services/trainingService'
import { reportService } from '@services/reportService'
import HeaderSummary from '@components/dashboard/HeaderSummary'
import PeakRings from '@components/dashboard/PeakRings'
import TrendsCard from '@components/dashboard/TrendsCard'
import TodayCard from '@components/dashboard/TodayCard'
import LatestWorkoutCard from '@components/dashboard/LatestWorkoutCard'
import AchievementsCard from '@components/dashboard/AchievementsCard'
import CoachCard from '@components/dashboard/CoachCard'
import WorkoutMusicCard from '@components/dashboard/WorkoutMusicCard'

const HomePage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [diasFeitos, setDiasFeitos] = useState([])
  const [stats, setStats] = useState({
    seriesHoje: 0,
    volumeHoje: 0,
    sequencia: 0
  })
  const [trainingPlan, setTrainingPlan] = useState(null)
  const [nextWorkout, setNextWorkout] = useState(null)
  const [iaWorkouts, setIaWorkouts] = useState([])

  useEffect(() => {
    loadDiasFeitos()
    loadTrainingPlan()
    loadIaWorkouts()
  }, [session])

  const loadDiasFeitos = async () => {
    if (!session) return
    
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = getWeekNumber(now)
    const weekKey = `${year}-${weekNumber}`
    
    // Carregar apenas check-ins da semana atual
    const result = await trainingService.getCheckInsByWeek(session.tokenKey, weekKey)
    if (result.success && result.data) {
      const dias = Object.values(result.data).map(d => d.day)
      setDiasFeitos(dias)
      // Calcular sequência após carregar dias feitos
      loadStats(dias)
    }
  }

  const loadStats = async (diasFeitosData = null) => {
    if (!session) return
    const result = await trainingService.getWorkoutLogs(session.tokenKey)
    if (result.success && result.data) {
      const logs = Object.values(result.data)
      const today = new Date().getDay()
      const logsHoje = logs.filter(log => log.dia === today)

      let seriesHoje = 0
      let volumeHoje = 0

      logsHoje.forEach(log => {
        if (log.series) {
          log.series.forEach(serie => {
            seriesHoje++
            volumeHoje += (serie.peso || 0) * (serie.reps || 0)
          })
        }
      })

      // Usar dados passados como parâmetro ou estado atual
      const sequencia = diasFeitosData ? diasFeitosData.length : diasFeitos.length

      setStats({
        seriesHoje,
        volumeHoje,
        sequencia
      })
    }
  }

  const loadTrainingPlan = async () => {
    if (!session) return
    const result = await trainingService.getTrainingPlan(session.tokenKey)
    if (result.success && result.data) {
      setTrainingPlan(result.data)
      calculateNextWorkout(result.data)
    }
  }

  const loadIaWorkouts = async () => {
    if (!session) return
    const result = await trainingService.getWorkouts(session.tokenKey)
    if (result.success && result.data) {
      const workoutsArray = Object.entries(result.data).map(([id, workout]) => ({
        id,
        ...workout
      }))
      setIaWorkouts(workoutsArray)
      
      // Se não há próximo treino do plano, usar o primeiro treino IA
      if (!nextWorkout && workoutsArray.length > 0) {
        const latestWorkout = workoutsArray[0]
        setNextWorkout({
          dia: null,
          nomeDia: 'Treino IA',
          nome: latestWorkout.nome,
          exercicios: latestWorkout.exercicios,
          totalExercicios: latestWorkout.exercicios.length,
          duracaoEstimada: latestWorkout.duracao,
          workoutId: latestWorkout.id
        })
      }
    }
  }

  const calculateNextWorkout = (plan) => {
    if (!plan || !plan.planoSemanal) return
    
    const today = new Date().getDay()
    const nextDay = (today + 1) % 7
    
    const nextWorkoutDay = plan.planoSemanal.find(day => day.dia === nextDay)
    
    if (nextWorkoutDay) {
      setNextWorkout({
        dia: nextDay,
        nomeDia: DIAS_LABEL[nextDay],
        nome: plan.nome,
        exercicios: nextWorkoutDay.exercicios,
        totalExercicios: nextWorkoutDay.exercicios.length,
        duracaoEstimada: plan.duracao
      })
    }
  }

  const handleStartNextWorkout = () => {
    if (!nextWorkout) return
    if (nextWorkout.workoutId) {
      // É um treino IA gerado
      navigate('/log-treino', { state: { workoutId: nextWorkout.workoutId } })
    } else {
      // É um treino do plano semanal
      navigate('/treinos', { state: { selectedDay: nextWorkout.dia } })
    }
  }

  const handleCheckIn = async () => {
    if (!session) return
    
    const hoje = new Date().getDay()
    const now = new Date()
    
    // Calcular ano-semana (YYYY-WW)
    const year = now.getFullYear()
    const weekNumber = getWeekNumber(now)
    const weekKey = `${year}-${weekNumber}`
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          
          // Salvar com formato gymai_dias_treino/{tokenKey}/{YYYY-WW}/{dia}
          const result = await trainingService.saveCheckInWithWeek(session.tokenKey, weekKey, hoje, location)
          if (result.success) {
            setDiasFeitos([...diasFeitos, hoje])
            alert('Check-in realizado com sucesso!')
          } else {
            alert('Erro ao realizar check-in')
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          alert('Erro ao obter localização')
        }
      )
    } else {
      alert('Geolocalização não suportada')
    }
  }

  // Função para calcular o número da semana (ISO 8601)
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    return weekNo
  }

  const renderDias = () => {
    const hoje = new Date().getDay()
    const now = new Date()
    
    return DIAS_LABEL.map((dia, index) => {
      const isHoje = index === hoje
      const isFeito = diasFeitos.includes(index)
      
      // Calcular a data para este dia da semana
      const currentDayOfWeek = now.getDay()
      const diff = index - currentDayOfWeek
      const targetDate = new Date(now)
      targetDate.setDate(now.getDate() + diff)
      const dateString = targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      
      let className = 'flex flex-col items-center justify-center p-3 rounded-lg transition-colors'
      
      if (isHoje && !isFeito) {
        className += ' bg-primary-600 text-white hover:bg-primary-700 cursor-pointer'
      } else if (isFeito) {
        className += ' bg-green-500 text-white cursor-not-allowed opacity-80'
      } else {
        className += ' bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed'
      }
      
      return (
        <div
          key={index}
          className={className}
          onClick={isHoje && !isFeito ? handleCheckIn : undefined}
          title={`${dia} - ${dateString}`}
        >
          <span className="text-lg font-bold">{dia}</span>
          <span className="text-xs">
            {isHoje && !isFeito ? 'Check-in' : dateString}
          </span>
        </div>
      )
    })
  }

  const formatExpirationDate = (expiresAt) => {
    if (!expiresAt) return 'Sem validade definida'
    const date = new Date(expiresAt)
    const daysRemaining = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24))
    if (daysRemaining <= 0) return 'Expirado'
    if (daysRemaining === 1) return 'Expira em 1 dia'
    return `Expira em ${daysRemaining} dias (${date.toLocaleDateString('pt-BR')})`
  }

  return (
    <main className="w-full px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      {/* Header Summary */}
      <HeaderSummary />

      {/* Peak Rings + Hoje */}
      <div className="premium-card mb-3 sm:mb-4 card-entry" style={{ animationDelay: '0ms' }}>
        <PeakRings />
      </div>

      {/* Tendências */}
      <div className="premium-card mb-3 sm:mb-4 card-entry" style={{ animationDelay: '100ms' }}>
        <TrendsCard />
      </div>

      {/* Último Treino */}
      <div className="premium-card mb-3 sm:mb-4 card-entry" style={{ animationDelay: '200ms' }}>
        <LatestWorkoutCard />
      </div>

      {/* Músicas */}
      <div className="premium-card mb-3 sm:mb-4 card-entry" style={{ animationDelay: '300ms' }}>
        <WorkoutMusicCard />
      </div>

      {/* Conquistas */}
      <div className="premium-card mb-3 sm:mb-4 card-entry" style={{ animationDelay: '400ms' }}>
        <AchievementsCard />
      </div>

      {/* Coach IA */}
      <div className="premium-card mb-3 sm:mb-4 card-entry" style={{ animationDelay: '500ms' }}>
        <CoachCard />
      </div>

      {/* Validade de Acesso */}
      {session?.expiresAt && (
        <div className="premium-card card-entry" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Validade de Acesso</h2>
              <p className="text-sm opacity-60">Sua licença expira em breve</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{formatExpirationDate(session.expiresAt)}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default HomePage
