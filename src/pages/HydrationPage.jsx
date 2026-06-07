import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Droplets, Plus, Minus, Target, TrendingUp } from 'lucide-react'

const HydrationPage = () => {
  const { session } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [waterIntake, setWaterIntake] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [customAmount, setCustomAmount] = useState(250)
  const [history, setHistory] = useState([])
  const [showGoalSettings, setShowGoalSettings] = useState(false)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadHydrationData()
    loadDailyGoal()
  }, [selectedDate, session])

  const loadHydrationData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_hidratacao/${encodedKey}/${selectedDate}`))
      const data = snapshot.val()
      if (data) {
        setWaterIntake(data.intake || 0)
      } else {
        setWaterIntake(0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de hidratação:', error)
    }
  }

  const loadDailyGoal = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      
      // Primeiro, tentar calcular meta baseada no peso do perfil
      const profileSnapshot = await get(ref(database, `gymai_perfil/${encodedKey}`))
      const profile = profileSnapshot.val()
      
      if (profile && profile.peso) {
        // Meta de água: 35ml por kg de peso
        const calculatedGoal = Math.round(profile.peso * 35)
        setDailyGoal(calculatedGoal)
        
        // Salvar a meta calculada no Firebase
        const metasSnapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
        const metasData = metasSnapshot.val() || {}
        await set(ref(database, `gymai_metas/${encodedKey}`), {
          ...metasData,
          hidratacao: calculatedGoal
        })
      } else {
        // Se não tiver perfil, usar meta do Firebase ou padrão
        const snapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
        const data = snapshot.val()
        if (data && data.hidratacao) {
          setDailyGoal(data.hidratacao)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar meta de hidratação:', error)
    }
  }

  const addWater = async (amount) => {
    const newIntake = waterIntake + amount
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_hidratacao/${encodedKey}/${selectedDate}`), {
        intake: newIntake,
        goal: dailyGoal,
        timestamp: Date.now()
      })
      setWaterIntake(newIntake)
    } catch (error) {
      console.error('Erro ao salvar hidratação:', error)
    }
  }

  const removeWater = async (amount) => {
    const newIntake = Math.max(0, waterIntake - amount)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_hidratacao/${encodedKey}/${selectedDate}`), {
        intake: newIntake,
        goal: dailyGoal,
        timestamp: Date.now()
      })
      setWaterIntake(newIntake)
    } catch (error) {
      console.error('Erro ao salvar hidratação:', error)
    }
  }

  const saveDailyGoal = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const data = snapshot.val() || {}
      
      await set(ref(database, `gymai_metas/${encodedKey}`), {
        ...data,
        hidratacao: dailyGoal
      })
      
      setShowGoalSettings(false)
    } catch (error) {
      console.error('Erro ao salvar meta de hidratação:', error)
    }
  }

  const loadHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_hidratacao/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            intake: entry.intake,
            goal: entry.goal
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 7)
        setHistory(historyArray)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [session])

  const percentage = Math.min((waterIntake / dailyGoal) * 100, 100)
  const remaining = Math.max(dailyGoal - waterIntake, 0)
  const glasses = Math.floor(waterIntake / 250)

  const quickAmounts = [100, 150, 200, 250, 300, 500]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Hidratação</h1>
        <p className="text-[var(--color-muted)]">Acompanhe seu consumo diário de água</p>
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
          <Button
            onClick={() => setShowGoalSettings(!showGoalSettings)}
            variant="outline"
          >
            <Target size={20} className="mr-2" />
            Meta: {dailyGoal}ml
          </Button>
        </div>

        {showGoalSettings && (
          <div className="mt-4 p-4 bg-[var(--color-border)] rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Meta Diária (ml)</label>
              <Input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                min="500"
                max="5000"
                step="100"
              />
            </div>
            <Button onClick={saveDailyGoal} className="w-full">
              Salvar Meta
            </Button>
          </div>
        )}
      </Card>

      {/* Progresso diário */}
      <Card className="mb-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <Droplets size={120} className="text-blue-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{waterIntake}ml</div>
                <div className="text-sm text-[var(--color-muted)]">de {dailyGoal}ml</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[var(--color-border)] rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-[var(--color-border)] rounded-lg">
            <div className="text-2xl font-bold text-blue-500">{glasses}</div>
            <div className="text-sm text-[var(--color-muted)]">Copos (250ml)</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg">
            <div className="text-2xl font-bold text-green-500">{remaining}ml</div>
            <div className="text-sm text-[var(--color-muted)]">Restante</div>
          </div>
        </div>
      </Card>

      {/* Adicionar água */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Adicionar Água</h2>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              onClick={() => addWater(amount)}
              variant="outline"
              className="flex flex-col items-center gap-1"
            >
              <Plus size={20} />
              <span className="text-sm">{amount}ml</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            placeholder="Quantidade (ml)"
            min="1"
            max="1000"
          />
          <Button onClick={() => addWater(customAmount)}>
            <Plus size={20} />
          </Button>
          <Button onClick={() => removeWater(customAmount)} variant="outline">
            <Minus size={20} />
          </Button>
        </div>
      </Card>

      {/* Histórico */}
      {history.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Histórico (7 dias)
          </h2>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--color-border)] rounded-lg"
              >
                <div>
                  <span className="font-medium">
                    {new Date(entry.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-sm text-[var(--color-muted)] ml-2">
                    Meta: {entry.goal}ml
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{entry.intake}ml</span>
                  <span className="text-sm text-[var(--color-muted)] ml-2">
                    {((entry.intake / entry.goal) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default HydrationPage
