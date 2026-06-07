import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Activity, MapPin, TrendingUp, Flame, Clock } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const cardioTypes = [
  { id: 'corrida', label: 'Corrida', icon: '🏃', caloriesPerMin: 10 },
  { id: 'caminhada', label: 'Caminhada', icon: '🚶', caloriesPerMin: 5 },
  { id: 'bicicleta', label: 'Bicicleta', icon: '🚴', caloriesPerMin: 8 },
  { id: 'natacao', label: 'Natação', icon: '🏊', caloriesPerMin: 9 },
  { id: 'eliptico', label: 'Elíptico', icon: '🏋️', caloriesPerMin: 7 },
  { id: 'outro', label: 'Outro', icon: '⚡', caloriesPerMin: 6 },
]

const intensityLevels = [
  { id: 'baixa', label: 'Baixa', multiplier: 0.8 },
  { id: 'moderada', label: 'Moderada', multiplier: 1.0 },
  { id: 'alta', label: 'Alta', multiplier: 1.3 },
  { id: 'muito_alta', label: 'Muito Alta', multiplier: 1.5 },
]

const CardioPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [cardioType, setCardioType] = useState('caminhada')
  const [duration, setDuration] = useState(30)
  const [intensity, setIntensity] = useState('moderada')
  const [calories, setCalories] = useState(0)
  const [cardioHistory, setCardioHistory] = useState([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [route, setRoute] = useState([])
  const [currentPosition, setCurrentPosition] = useState(null)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadCardioData()
    loadCardioHistory()
  }, [selectedDate, session])

  useEffect(() => {
    calculateCalories()
  }, [cardioType, duration, intensity])

  const loadCardioData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_cardio/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setCardioType(data.type || 'caminhada')
        setDuration(data.duration || 30)
        setIntensity(data.intensity || 'moderada')
        setRoute(data.route || [])
      } else {
        setCardioType('caminhada')
        setDuration(30)
        setIntensity('moderada')
        setRoute([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de cardio:', error)
    }
  }

  const loadCardioHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_cardio/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            type: entry.type,
            duration: entry.duration || 0,
            calories: entry.calories || 0,
            intensity: entry.intensity
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7)
        
        setCardioHistory(historyArray)
        
        const totalCals = historyArray.reduce((sum, entry) => sum + entry.calories, 0)
        const totalDur = historyArray.reduce((sum, entry) => sum + entry.duration, 0)
        setTotalCalories(totalCals)
        setTotalDuration(totalDur)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de cardio:', error)
    }
  }

  const calculateCalories = () => {
    const typeData = cardioTypes.find(t => t.id === cardioType)
    const intensityData = intensityLevels.find(i => i.id === intensity)
    const calculatedCalories = Math.round(
      typeData.caloriesPerMin * duration * intensityData.multiplier
    )
    setCalories(calculatedCalories)
  }

  const saveCardioData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_cardio/${encodedKey}/${selectedDate}`), {
        type: cardioType,
        duration,
        intensity,
        calories,
        route,
        timestamp: Date.now()
      })
      
      loadCardioHistory()
    } catch (error) {
      console.error('Erro ao salvar dados de cardio:', error)
    }
  }

  const startTracking = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
        })
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setRoute([{ lat: position.coords.latitude, lng: position.coords.longitude }])
        setIsTracking(true)
        
        // Track route
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            setCurrentPosition(newPos)
            setRoute(prev => [...prev, newPos])
          },
          (err) => console.error('Erro ao rastrear posição:', err),
          { enableHighAccuracy: true }
        )
        
        return watchId
      } catch (err) {
        console.error('Erro ao obter localização:', err)
        alert('Não foi possível obter sua localização')
      }
    } else {
      alert('Geolocalização não suportada neste navegador')
    }
  }

  const stopTracking = (watchId) => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
    setIsTracking(false)
  }

  const chartData = {
    labels: cardioHistory.map(entry => new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short' })),
    datasets: [
      {
        label: 'Calorias',
        data: cardioHistory.map(entry => entry.calories),
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
        <h1 className="text-3xl font-bold font-display mb-2">Cardio</h1>
        <p className="text-[var(--color-muted)]">Registre suas atividades cardiovasculares</p>
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

      {/* Log de cardio */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Log de Cardio</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Cardio</label>
            <div className="grid grid-cols-2 gap-2">
              {cardioTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setCardioType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    cardioType === type.id
                      ? 'border-primary-600 bg-primary-600/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border)]'
                  }`}
                >
                  <div className="text-2xl">{type.icon}</div>
                  <div className="text-sm">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Intensidade</label>
            <div className="grid grid-cols-2 gap-2">
              {intensityLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setIntensity(level.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    intensity === level.id
                      ? 'border-primary-600 bg-primary-600/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border)]'
                  }`}
                >
                  <div className="font-medium">{level.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            max="300"
          />
        </div>

        <div className="mb-4 p-4 bg-[var(--color-border)] rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Flame size={32} className="mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold">{calories}</div>
              <div className="text-sm text-[var(--color-muted)]">Calorias estimadas</div>
            </div>
            <div className="text-center">
              <Clock size={32} className="mx-auto mb-2 text-blue-500" />
              <div className="text-3xl font-bold">{duration}min</div>
              <div className="text-sm text-[var(--color-muted)]">Duração</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveCardioData} className="flex-1">
            Salvar Registro
          </Button>
          <Button onClick={startTracking} variant="outline" className="flex-1">
            <MapPin size={20} className="mr-2" />
            Rastrear Rota
          </Button>
        </div>
      </Card>

      {/* Mapa da rota */}
      {route.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={24} className="text-primary-600" />
            <h2 className="text-xl font-bold">Rota</h2>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <MapContainer center={route[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline positions={route} color="blue" />
              {currentPosition && (
                <Marker position={currentPosition} />
              )}
            </MapContainer>
          </div>
        </Card>
      )}

      {/* Totais */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <Flame size={32} className="mx-auto mb-2 text-orange-500" />
            <div className="text-3xl font-bold">{totalCalories}</div>
            <div className="text-sm text-[var(--color-muted)]">Total Calorias (7 dias)</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-green-600" />
            <div className="text-3xl font-bold">{totalDuration}min</div>
            <div className="text-sm text-[var(--color-muted)]">Total Duração (7 dias)</div>
          </div>
        </div>
      </Card>

      {/* Gráfico histórico */}
      {cardioHistory.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Histórico (7 dias)</h2>
          <Line data={chartData} options={chartOptions} />
        </Card>
      )}
    </div>
  )
}

export default CardioPage
