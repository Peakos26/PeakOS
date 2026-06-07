import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Moon, Star, TrendingUp, Clock } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const SleepPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [bedtime, setBedtime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [quality, setQuality] = useState(3)
  const [sleepHistory, setSleepHistory] = useState([])
  const [averageSleep, setAverageSleep] = useState(0)
  const [averageQuality, setAverageQuality] = useState(0)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadSleepData()
    loadSleepHistory()
  }, [selectedDate, session])

  const loadSleepData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_sono/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setBedtime(data.bedtime || '')
        setWakeTime(data.wakeTime || '')
        setQuality(data.quality || 3)
      } else {
        setBedtime('')
        setWakeTime('')
        setQuality(3)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de sono:', error)
    }
  }

  const loadSleepHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_sono/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            bedtime: entry.bedtime,
            wakeTime: entry.wakeTime,
            quality: entry.quality,
            duration: calculateDuration(entry.bedtime, entry.wakeTime)
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7)
        
        setSleepHistory(historyArray)
        
        // Calcular médias
        const totalDuration = historyArray.reduce((sum, entry) => sum + (entry.duration || 0), 0)
        const totalQuality = historyArray.reduce((sum, entry) => sum + (entry.quality || 0), 0)
        setAverageSleep(historyArray.length > 0 ? Math.round(totalDuration / historyArray.length) : 0)
        setAverageQuality(historyArray.length > 0 ? Math.round(totalQuality / historyArray.length) : 0)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de sono:', error)
    }
  }

  const calculateDuration = (bedtime, wakeTime) => {
    if (!bedtime || !wakeTime) return 0
    
    const [bedHour, bedMin] = bedtime.split(':').map(Number)
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number)
    
    let bedDate = new Date()
    bedDate.setHours(bedHour, bedMin, 0, 0)
    
    let wakeDate = new Date()
    wakeDate.setHours(wakeHour, wakeMin, 0, 0)
    
    // Se acordou antes de dormir, assumir que acordou no dia seguinte
    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1)
    }
    
    const diffMs = wakeDate - bedDate
    const diffHours = diffMs / (1000 * 60 * 60)
    return Math.round(diffHours * 10) / 10
  }

  const saveSleepData = async () => {
    if (!session?.tokenKey) return
    
    if (!bedtime || !wakeTime) {
      alert('Preencha horário de dormir e acordar')
      return
    }

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const duration = calculateDuration(bedtime, wakeTime)
      
      await set(ref(database, `gymai_sono/${encodedKey}/${selectedDate}`), {
        bedtime,
        wakeTime,
        quality,
        duration,
        timestamp: Date.now()
      })
      
      loadSleepHistory()
    } catch (error) {
      console.error('Erro ao salvar dados de sono:', error)
    }
  }

  const chartData = {
    labels: sleepHistory.map(entry => new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short' })),
    datasets: [
      {
        label: 'Horas de Sono',
        data: sleepHistory.map(entry => entry.duration),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Qualidade',
        data: sleepHistory.map(entry => entry.quality),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
        max: 10,
      },
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Sono</h1>
        <p className="text-[var(--color-muted)]">Acompanhe seu sono e qualidade</p>
      </div>

      {/* Seleção de data */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </Card>

      {/* Registro de sono */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Moon size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Registro de Sono</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Horário de Dormir</label>
            <Input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Horário de Acordar</label>
            <Input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Qualidade do Sono (1-5 estrelas)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setQuality(star)}
                className={`text-3xl transition-colors ${
                  star <= quality ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                <Star size={32} fill={star <= quality ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {bedtime && wakeTime && (
          <div className="mb-4 p-4 bg-[var(--color-border)] rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {calculateDuration(bedtime, wakeTime)}h
              </div>
              <div className="text-sm text-[var(--color-muted)]">Duração do sono</div>
            </div>
          </div>
        )}

        <Button onClick={saveSleepData} className="w-full">
          Salvar Registro
        </Button>
      </Card>

      {/* Médias */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <Clock size={32} className="mx-auto mb-2 text-blue-600" />
            <div className="text-3xl font-bold">{averageSleep}h</div>
            <div className="text-sm text-[var(--color-muted)]">Média de sono (7 dias)</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <Star size={32} className="mx-auto mb-2 text-yellow-500" />
            <div className="text-3xl font-bold">{averageQuality}/5</div>
            <div className="text-sm text-[var(--color-muted)]">Média de qualidade (7 dias)</div>
          </div>
        </div>
      </Card>

      {/* Gráfico histórico */}
      {sleepHistory.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-primary-600" />
            <h2 className="text-xl font-bold">Histórico (7 dias)</h2>
          </div>
          <Line data={chartData} options={chartOptions} />
        </Card>
      )}
    </div>
  )
}

export default SleepPage
