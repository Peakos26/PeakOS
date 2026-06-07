import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { Battery, TrendingUp, Activity, Zap } from 'lucide-react'

const muscleGroups = [
  { id: 'peito', label: 'Peito' },
  { id: 'costas', label: 'Costas' },
  { id: 'ombros', label: 'Ombros' },
  { id: 'biceps', label: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps' },
  { id: 'pernas', label: 'Pernas' },
  { id: 'gluteos', label: 'Glúteos' },
  { id: 'abdomen', label: 'Abdômen' },
  { id: 'core', label: 'Core' },
]

const RecoveryPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [fatigueLevels, setFatigueLevels] = useState({})
  const [recoveryHistory, setRecoveryHistory] = useState([])
  const [overallRecovery, setOverallRecovery] = useState(0)
  const [suggestion, setSuggestion] = useState('')

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadRecoveryData()
    loadRecoveryHistory()
  }, [selectedDate, session])

  useEffect(() => {
    generateSuggestion()
  }, [fatigueLevels])

  const loadRecoveryData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_recuperacao/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setFatigueLevels(data.fatigueLevels || {})
      } else {
        setFatigueLevels({})
      }
    } catch (error) {
      console.error('Erro ao carregar dados de recuperação:', error)
    }
  }

  const loadRecoveryHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_recuperacao/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            fatigueLevels: entry.fatigueLevels || {},
            overallRecovery: calculateOverallRecovery(entry.fatigueLevels || {})
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7)
        
        setRecoveryHistory(historyArray)
        
        if (historyArray.length > 0) {
          const totalRecovery = historyArray.reduce((sum, entry) => sum + entry.overallRecovery, 0)
          setOverallRecovery(Math.round(totalRecovery / historyArray.length))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de recuperação:', error)
    }
  }

  const calculateOverallRecovery = (levels) => {
    const values = Object.values(levels)
    if (values.length === 0) return 10
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    return Math.round(10 - avg) // Inverter: fadiga alta = recuperação baixa
  }

  const generateSuggestion = () => {
    const values = Object.values(fatigueLevels)
    if (values.length === 0) {
      setSuggestion('Registre seus níveis de fadiga para receber sugestões')
      return
    }

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    
    if (avg >= 7) {
      setSuggestion('Alta fadiga detectada. Recomendo dia de descanso ou treino leve (caminhada, yoga, mobilidade).')
    } else if (avg >= 5) {
      setSuggestion('Fadiga moderada. Reduza a intensidade do treino hoje ou foque em grupos musculares menos fatigados.')
    } else if (avg >= 3) {
      setSuggestion('Fadiga leve. Você pode treinar normalmente, mas mantenha a intensidade moderada.')
    } else {
      setSuggestion('Boa recuperação! Você está pronto para um treino intenso.')
    }
  }

  const saveRecoveryData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_recuperacao/${encodedKey}/${selectedDate}`), {
        fatigueLevels,
        overallRecovery: calculateOverallRecovery(fatigueLevels),
        timestamp: Date.now()
      })
      
      loadRecoveryHistory()
    } catch (error) {
      console.error('Erro ao salvar dados de recuperação:', error)
    }
  }

  const handleFatigueChange = (groupId, value) => {
    setFatigueLevels({
      ...fatigueLevels,
      [groupId]: value
    })
  }

  const getRecoveryColor = (level) => {
    if (level >= 8) return 'text-green-500'
    if (level >= 6) return 'text-yellow-500'
    if (level >= 4) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Recuperação</h1>
        <p className="text-[var(--color-muted)]">Acompanhe sua recuperação muscular</p>
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

      {/* Sugestão de treino */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Sugestão de Treino</h2>
        </div>
        <p className="text-[var(--color-muted)]">{suggestion}</p>
      </Card>

      {/* Escala de fadiga */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Battery size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Escala de Fadiga Muscular (1-10)</h2>
        </div>
        
        <div className="space-y-4">
          {muscleGroups.map((group) => (
            <div key={group.id}>
              <div className="flex justify-between mb-2">
                <label className="font-medium">{group.label}</label>
                <span className="text-sm text-[var(--color-muted)]">
                  {fatigueLevels[group.id] || 0}/10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={fatigueLevels[group.id] || 0}
                onChange={(e) => handleFatigueChange(group.id, Number(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <Button onClick={saveRecoveryData} className="w-full mt-6">
          Salvar Registro
        </Button>
      </Card>

      {/* Recuperação geral */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <Activity size={32} className="mx-auto mb-2 text-blue-600" />
            <div className={`text-3xl font-bold ${getRecoveryColor(overallRecovery)}`}>
              {overallRecovery}/10
            </div>
            <div className="text-sm text-[var(--color-muted)]">Recuperação Média (7 dias)</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-green-600" />
            <div className="text-3xl font-bold">{recoveryHistory.length}</div>
            <div className="text-sm text-[var(--color-muted)]">Registros (7 dias)</div>
          </div>
        </div>
      </Card>

      {/* Histórico */}
      {recoveryHistory.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Histórico (7 dias)</h2>
          <div className="space-y-2">
            {recoveryHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--color-border)] rounded-lg"
              >
                <span className="font-medium">
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </span>
                <span className={`font-bold ${getRecoveryColor(entry.overallRecovery)}`}>
                  {entry.overallRecovery}/10
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default RecoveryPage
