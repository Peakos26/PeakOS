import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { DIAS_LABEL } from '@constants/trainingConstants'
import { trainingService } from '@services/trainingService'
import { reportService } from '@services/reportService'

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

  useEffect(() => {
    loadDiasFeitos()
    loadTrainingPlan()
  }, [session])

  const loadDiasFeitos = async () => {
    if (!session) return
    const result = await trainingService.getCheckIns(session.tokenKey)
    if (result.success && result.data) {
      const dias = Object.values(result.data).map(d => d.dia)
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
    navigate('/treinos', { state: { selectedDay: nextWorkout.dia } })
  }

  const handleCheckIn = async () => {
    if (!session) return
    
    const hoje = new Date().getDay()
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          
          const result = await trainingService.saveCheckIn(session.tokenKey, hoje, location)
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

  const renderDias = () => {
    const hoje = new Date().getDay()
    
    return DIAS_LABEL.map((dia, index) => {
      const isHoje = index === hoje
      const isFeito = diasFeitos.includes(index)
      
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
        >
          <span className="text-lg font-bold">{dia}</span>
          <span className="text-xs">
            {isHoje && !isFeito ? 'Check-in' : isHoje ? 'Hj' : ''}
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
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display mb-2">Olá, {session?.nome || 'Usuário'}</h1>
          <p className="text-[var(--color-muted)]">Bem-vindo de volta ao Peak<span className="font-bold text-primary-600">OS</span></p>
        </div>

        {/* Validade de Acesso */}
        {session?.expiresAt && (
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Validade de Acesso</h2>
                <p className="text-sm text-[var(--color-muted)]">Sua licença expira em breve</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{formatExpirationDate(session.expiresAt)}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Dias da semana */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Dias de Treino</h2>
          <div className="grid grid-cols-7 gap-2">
            {renderDias()}
          </div>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-sm text-[var(--color-muted)]">Séries Hoje</div>
            <div className="text-2xl font-bold">{stats.seriesHoje}</div>
          </Card>
          <Card>
            <div className="text-sm text-[var(--color-muted)]">Volume Hoje</div>
            <div className="text-2xl font-bold">{stats.volumeHoje} kg</div>
          </Card>
          <Card>
            <div className="text-sm text-[var(--color-muted)]">Sequência</div>
            <div className="text-2xl font-bold">{stats.sequencia} dias</div>
          </Card>
          <Card>
            <div className="text-sm text-[var(--color-muted)]">Esta Semana</div>
            <div className="text-2xl font-bold">{diasFeitos.length} / 5</div>
          </Card>
        </div>

        {/* Próximo treino */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Próximo Treino</h2>
          {nextWorkout ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{nextWorkout.nome} — {nextWorkout.nomeDia}</div>
                <div className="text-sm text-[var(--color-muted)]">
                  {nextWorkout.totalExercicios} exercícios · ~{nextWorkout.duracaoEstimada || '50'} min
                </div>
              </div>
              <Button onClick={handleStartNextWorkout}>Iniciar</Button>
            </div>
          ) : (
            <div className="text-sm text-[var(--color-muted)]">
              Nenhum treino agendado. Crie seu plano de treino na aba Treinos.
            </div>
          )}
        </Card>
      </main>

      <Navigation />
    </div>
  )
}

export default HomePage
