import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { Smile, Brain, Clock, TrendingUp } from 'lucide-react'

const moodEmojis = [
  { id: 1, emoji: '😢', label: 'Muito Ruim' },
  { id: 2, emoji: '😔', label: 'Ruim' },
  { id: 3, emoji: '😐', label: 'Neutro' },
  { id: 4, emoji: '🙂', label: 'Bom' },
  { id: 5, emoji: '😊', label: 'Muito Bom' },
]

const meditationOptions = [
  { id: 1, name: 'Respiração Profunda', duration: 5, description: 'Foque na sua respiração por 5 minutos' },
  { id: 2, name: 'Body Scan', duration: 10, description: 'Relaxe cada parte do corpo por 10 minutos' },
  { id: 3, name: 'Mente Clara', duration: 15, description: 'Limpe sua mente por 15 minutos' },
  { id: 4, name: 'Gratidão', duration: 5, description: 'Pratique gratidão por 5 minutos' },
  { id: 5, name: 'Visualização', duration: 10, description: 'Visualize seus objetivos por 10 minutos' },
]

const MindsetPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState(3)
  const [stressLevel, setStressLevel] = useState(5)
  const [mindsetHistory, setMindsetHistory] = useState([])
  const [averageMood, setAverageMood] = useState(0)
  const [averageStress, setAverageStress] = useState(0)
  const [selectedMeditation, setSelectedMeditation] = useState(null)
  const [meditationTimer, setMeditationTimer] = useState(0)
  const [isMeditating, setIsMeditating] = useState(false)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadMindsetData()
    loadMindsetHistory()
  }, [selectedDate, session])

  useEffect(() => {
    let interval
    if (isMeditating && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(prev => prev - 1)
      }, 1000)
    } else if (meditationTimer === 0 && isMeditating) {
      setIsMeditating(false)
      alert('Meditação concluída! 🧘')
    }
    return () => clearInterval(interval)
  }, [isMeditating, meditationTimer])

  const loadMindsetData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_mindset/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setMood(data.mood || 3)
        setStressLevel(data.stressLevel || 5)
      } else {
        setMood(3)
        setStressLevel(5)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de mindset:', error)
    }
  }

  const loadMindsetHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_mindset/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            mood: entry.mood || 3,
            stressLevel: entry.stressLevel || 5
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7)
        
        setMindsetHistory(historyArray)
        
        const totalMood = historyArray.reduce((sum, entry) => sum + entry.mood, 0)
        const totalStress = historyArray.reduce((sum, entry) => sum + entry.stressLevel, 0)
        setAverageMood(historyArray.length > 0 ? Math.round(totalMood / historyArray.length) : 0)
        setAverageStress(historyArray.length > 0 ? Math.round(totalStress / historyArray.length) : 0)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de mindset:', error)
    }
  }

  const saveMindsetData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_mindset/${encodedKey}/${selectedDate}`), {
        mood,
        stressLevel,
        timestamp: Date.now()
      })
      
      loadMindsetHistory()
    } catch (error) {
      console.error('Erro ao salvar dados de mindset:', error)
    }
  }

  const startMeditation = (meditation) => {
    setSelectedMeditation(meditation)
    setMeditationTimer(meditation.duration * 60)
    setIsMeditating(true)
  }

  const stopMeditation = () => {
    setIsMeditating(false)
    setMeditationTimer(0)
    setSelectedMeditation(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Mindset</h1>
        <p className="text-[var(--color-muted)]">Acompanhe seu humor e pratique meditação</p>
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

      {/* Meditação */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Meditação Guiada</h2>
        </div>
        
        {!isMeditating ? (
          <div className="space-y-2">
            {meditationOptions.map((option) => (
              <div
                key={option.id}
                className="p-4 bg-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-border)] transition-colors"
                onClick={() => startMeditation(option)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-[var(--color-muted)]">{option.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span className="text-sm">{option.duration}min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-primary-600 mb-4">
              {formatTime(meditationTimer)}
            </div>
            <p className="text-lg mb-2">{selectedMeditation?.name}</p>
            <p className="text-[var(--color-muted)] mb-4">{selectedMeditation?.description}</p>
            <Button onClick={stopMeditation} variant="outline">
              Parar Meditação
            </Button>
          </div>
        )}
      </Card>

      {/* Diário de humor */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Smile size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Diário de Humor</h2>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Como você está se sentindo hoje?</label>
          <div className="flex gap-2 justify-center">
            {moodEmojis.map((emoji) => (
              <button
                key={emoji.id}
                onClick={() => setMood(emoji.id)}
                className={`text-4xl p-2 rounded-lg transition-all ${
                  mood === emoji.id
                    ? 'bg-primary-600 scale-110'
                    : 'bg-[var(--color-border)] hover:bg-[var(--color-border)]'
                }`}
              >
                {emoji.emoji}
              </button>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-[var(--color-muted)]">
            {moodEmojis.find(e => e.id === mood)?.label}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nível de Estresse (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center mt-2 text-sm text-[var(--color-muted)]">
            {stressLevel}/10
          </div>
        </div>

        <Button onClick={saveMindsetData} className="w-full">
          Salvar Registro
        </Button>
      </Card>

      {/* Médias */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <Smile size={32} className="mx-auto mb-2 text-yellow-500" />
            <div className="text-3xl font-bold">{averageMood}/5</div>
            <div className="text-sm text-[var(--color-muted)]">Média de humor (7 dias)</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-red-500" />
            <div className="text-3xl font-bold">{averageStress}/10</div>
            <div className="text-sm text-[var(--color-muted)]">Média de estresse (7 dias)</div>
          </div>
        </div>
      </Card>

      {/* Histórico */}
      {mindsetHistory.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Histórico (7 dias)</h2>
          <div className="space-y-2">
            {mindsetHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--color-border)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {moodEmojis.find(e => e.id === entry.mood)?.emoji}
                  </span>
                  <span className="font-medium">
                    {new Date(entry.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[var(--color-muted)]">Estresse</div>
                  <div className="font-bold">{entry.stressLevel}/10</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default MindsetPage
