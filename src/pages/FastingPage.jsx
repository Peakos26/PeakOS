import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Clock, TrendingUp, Calendar, Play, Pause, RotateCcw } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const fastingModes = [
  { id: '12h', label: '12 Horas', hours: 12 },
  { id: '14h', label: '14 Horas', hours: 14 },
  { id: '16h', label: '16 Horas', hours: 16 },
  { id: '18h', label: '18 Horas', hours: 18 },
  { id: '5:2', label: '5:2 (5 dias jejum, 2 dias normal)', hours: 16 },
  { id: 'omad', label: 'OMAD (One Meal A Day)', hours: 23 },
]

const FastingPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMode, setSelectedMode] = useState('16h')
  const [isFasting, setIsFasting] = useState(false)
  const [fastingStartTime, setFastingStartTime] = useState(null)
  const [fastingEndTime, setFastingEndTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [fastingHistory, setFastingHistory] = useState([])
  const [consistency, setConsistency] = useState(0)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadFastingData()
    loadFastingHistory()
  }, [selectedDate, session])

  useEffect(() => {
    let interval
    if (isFasting && fastingStartTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - fastingStartTime) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isFasting, fastingStartTime])

  const loadFastingData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_jejum/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setSelectedMode(data.mode || '16h')
        setIsFasting(data.isFasting || false)
        setFastingStartTime(data.startTime || null)
        setFastingEndTime(data.endTime || null)
        
        if (data.startTime && data.isFasting) {
          const elapsed = Math.floor((Date.now() - data.startTime) / 1000)
          setElapsedTime(elapsed)
        }
      } else {
        setIsFasting(false)
        setFastingStartTime(null)
        setFastingEndTime(null)
        setElapsedTime(0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de jejum:', error)
    }
  }

  const loadFastingHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_jejum/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            mode: entry.mode,
            duration: entry.duration || 0,
            completed: entry.completed || false
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-30)
        
        setFastingHistory(historyArray)
        
        const completedDays = historyArray.filter(entry => entry.completed).length
        setConsistency(historyArray.length > 0 ? Math.round((completedDays / historyArray.length) * 100) : 0)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de jejum:', error)
    }
  }

  const startFasting = async () => {
    if (!session?.tokenKey) return
    
    try {
      const startTime = Date.now()
      const modeData = fastingModes.find(m => m.id === selectedMode)
      const endTime = startTime + (modeData.hours * 60 * 60 * 1000)
      
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_jejum/${encodedKey}/${selectedDate}`), {
        mode: selectedMode,
        isFasting: true,
        startTime,
        endTime,
        duration: 0,
        completed: false,
        timestamp: Date.now()
      })
      
      setIsFasting(true)
      setFastingStartTime(startTime)
      setFastingEndTime(endTime)
      setElapsedTime(0)
    } catch (error) {
      console.error('Erro ao iniciar jejum:', error)
    }
  }

  const stopFasting = async () => {
    if (!session?.tokenKey) return
    
    try {
      const duration = elapsedTime
      const modeData = fastingModes.find(m => m.id === selectedMode)
      const targetDuration = modeData.hours * 60 * 60
      const completed = duration >= targetDuration
      
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_jejum/${encodedKey}/${selectedDate}`), {
        mode: selectedMode,
        isFasting: false,
        startTime: fastingStartTime,
        endTime: Date.now(),
        duration,
        completed,
        timestamp: Date.now()
      })
      
      setIsFasting(false)
      setFastingEndTime(Date.now())
      loadFastingHistory()
    } catch (error) {
      console.error('Erro ao parar jejum:', error)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!isFasting || !fastingEndTime) return 0
    const totalDuration = fastingEndTime - fastingStartTime
    const elapsed = Date.now() - fastingStartTime
    return Math.min((elapsed / totalDuration) * 100, 100)
  }

  const getRemainingTime = () => {
    if (!isFasting || !fastingEndTime) return 0
    const remaining = Math.max(0, Math.floor((fastingEndTime - Date.now()) / 1000))
    return remaining
  }

  const chartData = {
    labels: fastingHistory.map(entry => new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: 'Duração (horas)',
        data: fastingHistory.map(entry => Math.round(entry.duration / 3600)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Jejum Intermitente</h1>
        <p className="text-[var(--color-muted)]">Acompanhe suas janelas de jejum</p>
      </div>

      {/* Seleção de data */}
      <Card className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
        />
      </Card>

      {/* Timer de jejum */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Timer de Jejum</h2>
        </div>
        
        {!isFasting ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Modo de Jejum</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {fastingModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedMode === mode.id
                        ? 'border-primary-600 bg-primary-600/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border)]'
                    }`}
                  >
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-[var(--color-muted)]">{mode.hours}h</div>
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={startFasting} className="w-full">
              <Play size={20} className="mr-2" />
              Iniciar Jejum
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-primary-600 mb-4">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-lg mb-2">Tempo decorrido</div>
            
            <div className="mb-4">
              <div className="text-sm text-[var(--color-muted)] mb-1">Progresso</div>
              <div className="w-full bg-[var(--color-border)] rounded-full h-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <div className="text-sm text-[var(--color-muted)] mt-1">
                {getProgress().toFixed(0)}% concluído
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-[var(--color-muted)] mb-1">Tempo restante</div>
              <div className="text-2xl font-bold text-green-600">
                {formatTime(getRemainingTime())}
              </div>
            </div>
            
            <Button onClick={stopFasting} className="w-full" variant="outline">
              <Pause size={20} className="mr-2" />
              Encerrar Jejum
            </Button>
          </div>
        )}
      </Card>

      {/* Consistência */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <Calendar size={32} className="mx-auto mb-2 text-blue-600" />
            <div className="text-3xl font-bold">{consistency}%</div>
            <div className="text-sm text-[var(--color-muted)]">Consistência (30 dias)</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-green-600" />
            <div className="text-3xl font-bold">{fastingHistory.length}</div>
            <div className="text-sm text-[var(--color-muted)]">Registros (30 dias)</div>
          </div>
        </div>
      </Card>

      {/* Gráfico histórico */}
      {fastingHistory.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Histórico (30 dias)</h2>
          <Line data={chartData} options={chartOptions} />
        </Card>
      )}
    </div>
  )
}

export default FastingPage
