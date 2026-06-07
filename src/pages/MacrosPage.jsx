import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Calculator, PieChart, Target, AlertTriangle } from 'lucide-react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const MacrosPage = () => {
  const { session } = useAuth()
  const [tdee, setTdee] = useState(2000)
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 25
  })
  const [workoutDayGoals, setWorkoutDayGoals] = useState({
    calories: 2200,
    protein: 170,
    carbs: 220,
    fat: 70,
    fiber: 25
  })
  const [restDayGoals, setRestDayGoals] = useState({
    calories: 1800,
    protein: 130,
    carbs: 180,
    fat: 60,
    fiber: 25
  })
  const [currentIntake, setCurrentIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  })
  const [isWorkoutDay, setIsWorkoutDay] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [profile, setProfile] = useState(null)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadProfile()
    loadMacrosGoals()
    loadCurrentIntake()
  }, [session])

  const loadProfile = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_perfil/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        setProfile(data)
        calculateTDEE(data)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const calculateTDEE = (profileData) => {
    // Fórmula Mifflin-St Jeor para BMR
    let bmr
    const weight = profileData.peso || 70
    const height = profileData.altura || 170
    const age = profileData.idade || 30
    const gender = profileData.genero || 'masculino'
    
    if (gender === 'masculino') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    // Multiplicador de atividade
    const activityLevel = profileData.nivelAtividade || 'moderado'
    const activityMultipliers = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      ativo: 1.725,
      muito_ativo: 1.9
    }

    const tdeeValue = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55))
    setTdee(tdeeValue)

    // Calcular metas de macros baseadas no TDEE
    const objetivo = profileData.objetivo || 'manter'
    let calorieGoal = tdeeValue

    if (objetivo === 'perder_peso') {
      calorieGoal = tdeeValue - 500
    } else if (objetivo === 'ganhar_massa') {
      calorieGoal = tdeeValue + 300
    }

    // Distribuição de macros (30% proteína, 40% carboidratos, 30% gorduras)
    const protein = Math.round((calorieGoal * 0.30) / 4)
    const carbs = Math.round((calorieGoal * 0.40) / 4)
    const fat = Math.round((calorieGoal * 0.30) / 9)

    setDailyGoals({
      calories: calorieGoal,
      protein,
      carbs,
      fat,
      fiber: 25
    })

    // Metas para dia de treino (+200 calorias)
    setWorkoutDayGoals({
      calories: calorieGoal + 200,
      protein: protein + 20,
      carbs: carbs + 20,
      fat: fat + 5,
      fiber: 25
    })

    // Metas para dia de descanso (-200 calorias)
    setRestDayGoals({
      calories: calorieGoal - 200,
      protein: protein - 20,
      carbs: carbs - 20,
      fat: fat - 5,
      fiber: 25
    })
  }

  const loadMacrosGoals = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const data = snapshot.val()
      if (data && data.macros) {
        setDailyGoals(data.macros)
      }
      if (data && data.macrosTreino) {
        setWorkoutDayGoals(data.macrosTreino)
      }
      if (data && data.macrosDescanso) {
        setRestDayGoals(data.macrosDescanso)
      }
    } catch (error) {
      console.error('Erro ao carregar metas de macros:', error)
    }
  }

  const loadCurrentIntake = async () => {
    if (!session?.tokenKey) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_diario_alimentar/${encodedKey}/${today}`))
      const data = snapshot.val()
      
      if (data) {
        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
        
        Object.values(data).forEach(meal => {
          meal.forEach(food => {
            totals.calories += food.calories
            totals.protein += food.protein
            totals.carbs += food.carbs
            totals.fat += food.fat
            totals.fiber += food.fiber
          })
        })
        
        setCurrentIntake(totals)
      }
    } catch (error) {
      console.error('Erro ao carregar ingestão atual:', error)
    }
  }

  const saveMacrosGoals = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_metas/${encodedKey}`))
      const data = snapshot.val() || {}
      
      await set(ref(database, `gymai_metas/${encodedKey}`), {
        ...data,
        macros: dailyGoals,
        macrosTreino: workoutDayGoals,
        macrosDescanso: restDayGoals
      })
      
      setShowSettings(false)
    } catch (error) {
      console.error('Erro ao salvar metas de macros:', error)
    }
  }

  const currentGoals = isWorkoutDay ? workoutDayGoals : restDayGoals

  const pieData = {
    labels: ['Proteína', 'Carboidratos', 'Gorduras'],
    datasets: [
      {
        data: [currentIntake.protein, currentIntake.carbs, currentIntake.fat],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderColor: ['#1d4ed8', '#059669', '#d97706'],
        borderWidth: 1,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  const getProgressColor = (current, goal) => {
    const percentage = (current / goal) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const isOverGoal = currentIntake.calories > currentGoals.calories

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Macros Inteligentes</h1>
        <p className="text-[var(--color-muted)]">Calcule e acompanhe suas metas nutricionais</p>
      </div>

      {/* TDEE Calculator */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">TDEE Calculado</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-600">{tdee}</div>
            <div className="text-sm text-[var(--color-muted)]">TDEE (kcal/dia)</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{currentGoals.calories}</div>
            <div className="text-sm text-[var(--color-muted)]">Meta Calórica</div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{currentIntake.calories}</div>
            <div className="text-sm text-[var(--color-muted)]">Consumido Hoje</div>
          </div>
        </div>
      </Card>

      {/* Alerta de meta calórica */}
      {isOverGoal && (
        <Card className="mb-6 bg-red-500/10 border-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-500" />
            <div>
              <div className="font-bold text-red-500">Atenção!</div>
              <div className="text-sm text-red-400">
                Você ultrapassou sua meta calórica em {currentIntake.calories - currentGoals.calories} kcal
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Seletor de dia de treino */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Tipo de Dia</h2>
            <p className="text-sm text-[var(--color-muted)]">
              {isWorkoutDay ? 'Dia de Treino' : 'Dia de Descanso'}
            </p>
          </div>
          <Button
            onClick={() => setIsWorkoutDay(!isWorkoutDay)}
            variant={isWorkoutDay ? 'default' : 'outline'}
          >
            {isWorkoutDay ? '🏋️ Treino' : '🧘 Descanso'}
          </Button>
        </div>
      </Card>

      {/* Gráfico de Macros */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold">Distribuição de Macros</h2>
        </div>
        <div className="max-w-md mx-auto">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </Card>

      {/* Metas vs Consumo */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={24} className="text-primary-600" />
            <h2 className="text-xl font-bold">Metas vs Consumo</h2>
          </div>
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
            {showSettings ? 'Fechar' : 'Editar Metas'}
          </Button>
        </div>

        {showSettings && (
          <div className="mb-6 p-4 bg-[var(--color-border)] rounded-lg space-y-4">
            <h3 className="font-bold">Metas de {isWorkoutDay ? 'Treino' : 'Descanso'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Calorias (kcal)</label>
                <Input
                  type="number"
                  value={isWorkoutDay ? workoutDayGoals.calories : restDayGoals.calories}
                  onChange={(e) => {
                    if (isWorkoutDay) {
                      setWorkoutDayGoals({ ...workoutDayGoals, calories: Number(e.target.value) })
                    } else {
                      setRestDayGoals({ ...restDayGoals, calories: Number(e.target.value) })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Proteína (g)</label>
                <Input
                  type="number"
                  value={isWorkoutDay ? workoutDayGoals.protein : restDayGoals.protein}
                  onChange={(e) => {
                    if (isWorkoutDay) {
                      setWorkoutDayGoals({ ...workoutDayGoals, protein: Number(e.target.value) })
                    } else {
                      setRestDayGoals({ ...restDayGoals, protein: Number(e.target.value) })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Carboidratos (g)</label>
                <Input
                  type="number"
                  value={isWorkoutDay ? workoutDayGoals.carbs : restDayGoals.carbs}
                  onChange={(e) => {
                    if (isWorkoutDay) {
                      setWorkoutDayGoals({ ...workoutDayGoals, carbs: Number(e.target.value) })
                    } else {
                      setRestDayGoals({ ...restDayGoals, carbs: Number(e.target.value) })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gorduras (g)</label>
                <Input
                  type="number"
                  value={isWorkoutDay ? workoutDayGoals.fat : restDayGoals.fat}
                  onChange={(e) => {
                    if (isWorkoutDay) {
                      setWorkoutDayGoals({ ...workoutDayGoals, fat: Number(e.target.value) })
                    } else {
                      setRestDayGoals({ ...restDayGoals, fat: Number(e.target.value) })
                    }
                  }}
                />
              </div>
            </div>
            <Button onClick={saveMacrosGoals} className="w-full">
              Salvar Metas
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {[
            { label: 'Calorias', current: currentIntake.calories, goal: currentGoals.calories, unit: 'kcal' },
            { label: 'Proteína', current: currentIntake.protein, goal: currentGoals.protein, unit: 'g' },
            { label: 'Carboidratos', current: currentIntake.carbs, goal: currentGoals.carbs, unit: 'g' },
            { label: 'Gorduras', current: currentIntake.fat, goal: currentGoals.fat, unit: 'g' },
            { label: 'Fibras', current: currentIntake.fiber, goal: currentGoals.fiber, unit: 'g' },
          ].map((macro) => (
            <div key={macro.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{macro.label}</span>
                <span>{macro.current} / {macro.goal} {macro.unit}</span>
              </div>
              <div className="w-full bg-[var(--color-border)] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(macro.current, macro.goal)}`}
                  style={{ width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumo */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-border)] rounded-lg">
            <div className="text-sm text-[var(--color-muted)] mb-1">Calorias Restantes</div>
            <div className="text-2xl font-bold">
              {Math.max(currentGoals.calories - currentIntake.calories, 0)} kcal
            </div>
          </div>
          <div className="p-4 bg-[var(--color-border)] rounded-lg">
            <div className="text-sm text-[var(--color-muted)] mb-1">Progresso Total</div>
            <div className="text-2xl font-bold">
              {((currentIntake.calories / currentGoals.calories) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default MacrosPage
