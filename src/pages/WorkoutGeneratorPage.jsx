import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Bot, Dumbbell, Clock, Target, Zap, Plus, Trash2, Play } from 'lucide-react'

const WorkoutGeneratorPage = () => {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState('generate')
  const [objective, setObjective] = useState('hipertrofia')
  const [equipment, setEquipment] = useState('academia')
  const [duration, setDuration] = useState('60')
  const [recoveryLevel, setRecoveryLevel] = useState('5')
  const [injury, setInjury] = useState('')
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedWorkouts, setSavedWorkouts] = useState([])
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(1)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadSavedWorkouts()
    loadWeeklyPlan()
  }, [session])

  const loadSavedWorkouts = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_treinos_gerados/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const workoutsArray = Object.entries(data).map(([id, workout]) => ({
          id,
          ...workout
        }))
        setSavedWorkouts(workoutsArray)
      }
    } catch (error) {
      console.error('Erro ao carregar treinos salvos:', error)
    }
  }

  const loadWeeklyPlan = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_plano_semanal/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        setWeeklyPlan(data)
        setCurrentWeek(data.currentWeek || 1)
      }
    } catch (error) {
      console.error('Erro ao carregar plano semanal:', error)
    }
  }

  const generateWorkout = async () => {
    if (!session?.tokenKey) return
    
    setIsGenerating(true)
    
    try {
      // Em produção, integrar com Groq API
      // Por enquanto, usar lógica simulada
      
      setTimeout(() => {
        const workout = {
          id: Date.now(),
          objective,
          equipment,
          duration: parseInt(duration),
          recoveryLevel: parseInt(recoveryLevel),
          injury,
          exercises: generateExercises(objective, equipment, parseInt(duration)),
          timestamp: Date.now()
        }
        
        setGeneratedWorkout(workout)
        setIsGenerating(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao gerar treino:', error)
      setIsGenerating(false)
    }
  }

  const generateExercises = (obj, equip, dur) => {
    const exercises = []
    
    if (obj === 'hipertrofia') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: 4, reps: '8-12', rest: 90, muscle: 'pernas' },
          { name: 'Supino Reto', sets: 4, reps: '8-12', rest: 90, muscle: 'peito' },
          { name: 'Remada Curvada', sets: 4, reps: '8-12', rest: 90, muscle: 'costas' },
          { name: 'Desenvolvimento Militar', sets: 3, reps: '10-12', rest: 60, muscle: 'ombros' },
          { name: 'Rosca Direta', sets: 3, reps: '12-15', rest: 60, muscle: 'bíceps' },
          { name: 'Tríceps Pulley', sets: 3, reps: '12-15', rest: 60, muscle: 'tríceps' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: 4, reps: '15-20', rest: 60, muscle: 'pernas' },
          { name: 'Flexão de Braço', sets: 4, reps: '10-15', rest: 60, muscle: 'peito' },
          { name: 'Remada com Garrafas', sets: 4, reps: '12-15', rest: 60, muscle: 'costas' },
          { name: 'Elevação Lateral', sets: 3, reps: '15-20', rest: 45, muscle: 'ombros' },
          { name: 'Rosca com Garrafas', sets: 3, reps: '15-20', rest: 45, muscle: 'bíceps' },
          { name: 'Tríceps no Banco', sets: 3, reps: '15-20', rest: 45, muscle: 'tríceps' }
        )
      }
    } else if (obj === 'forca') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: 5, reps: '5', rest: 180, muscle: 'pernas' },
          { name: 'Supino Reto', sets: 5, reps: '5', rest: 180, muscle: 'peito' },
          { name: 'Deadlift', sets: 5, reps: '5', rest: 180, muscle: 'costas' },
          { name: 'Desenvolvimento Militar', sets: 4, reps: '6', rest: 120, muscle: 'ombros' },
          { name: 'Barra Fixa', sets: 4, reps: '6-8', rest: 120, muscle: 'costas' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: 5, reps: '20', rest: 90, muscle: 'pernas' },
          { name: 'Flexão de Braço', sets: 5, reps: '15', rest: 90, muscle: 'peito' },
          { name: 'Remada com Garrafas', sets: 5, reps: '15', rest: 90, muscle: 'costas' },
          { name: 'Elevação Lateral', sets: 4, reps: '20', rest: 60, muscle: 'ombros' },
          { name: 'Barra Fixa', sets: 4, reps: '5-8', rest: 90, muscle: 'costas' }
        )
      }
    } else if (obj === 'perda_peso') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: 3, reps: '15-20', rest: 60, muscle: 'pernas' },
          { name: 'Supino Reto', sets: 3, reps: '12-15', rest: 60, muscle: 'peito' },
          { name: 'Remada Curvada', sets: 3, reps: '12-15', rest: 60, muscle: 'costas' },
          { name: 'Burpees', sets: 3, reps: '15', rest: 45, muscle: 'fullbody' },
          { name: 'Mountain Climber', sets: 3, reps: '30', rest: 45, muscle: 'core' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: 3, reps: '25', rest: 45, muscle: 'pernas' },
          { name: 'Flexão de Braço', sets: 3, reps: '20', rest: 45, muscle: 'peito' },
          { name: 'Burpees', sets: 3, reps: '15', rest: 45, muscle: 'fullbody' },
          { name: 'Mountain Climber', sets: 3, reps: '30', rest: 45, muscle: 'core' },
          { name: 'Polichinelo', sets: 3, reps: '30', rest: 30, muscle: 'cardio' }
        )
      }
    }

    // Ajustar volume baseado na recuperação
    const recoveryMultiplier = recoveryLevel / 5
    exercises.forEach(ex => {
      ex.sets = Math.max(1, Math.round(ex.sets * recoveryMultiplier))
    })

    // Substituir exercício se houver lesão
    if (injury) {
      const injuryLower = injury.toLowerCase()
      exercises.forEach(ex => {
        if (injuryLower.includes('joelho') && ex.muscle === 'pernas') {
          ex.name = 'Leg Press' // Alternativa menos impactante
        }
        if (injuryLower.includes('ombro') && ex.muscle === 'ombros') {
          ex.name = 'Elevação Frontal' // Alternativa
        }
        if (injuryLower.includes('costas') && ex.muscle === 'costas') {
          ex.name = 'Remada Máquina' // Alternativa mais segura
        }
      })
    }

    return exercises
  }

  const saveWorkout = async () => {
    if (!session?.tokenKey || !generatedWorkout) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const workoutRef = push(ref(database, `gymai_treinos_gerados/${encodedKey}`))
      await set(workoutRef, generatedWorkout)
      
      loadSavedWorkouts()
      alert('Treino salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar treino:', error)
    }
  }

  const deleteWorkout = async (id) => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_treinos_gerados/${encodedKey}/${id}`), null)
      
      setSavedWorkouts(savedWorkouts.filter(w => w.id !== id))
    } catch (error) {
      console.error('Erro ao remover treino:', error)
    }
  }

  const generateWeeklyPlan = async () => {
    if (!session?.tokenKey) return
    
    setIsGenerating(true)
    
    try {
      setTimeout(() => {
        const plan = {
          currentWeek: 1,
          totalWeeks: 8,
          objective,
          equipment,
          weeklySchedule: {
            segunda: generateExercises(objective, equipment, parseInt(duration)),
            terca: ['cardio', 'descanso'],
            quarta: generateExercises(objective, equipment, parseInt(duration)),
            quinta: ['cardio', 'descanso'],
            sexta: generateExercises(objective, equipment, parseInt(duration)),
            sabado: ['descanso', 'ativo'],
            domingo: ['descanso']
          },
          progression: {
            week1: { volume: 100, intensity: 70 },
            week2: { volume: 105, intensity: 72 },
            week3: { volume: 110, intensity: 75 },
            week4: { volume: 85, intensity: 60 }, // Deload
            week5: { volume: 115, intensity: 78 },
            week6: { volume: 120, intensity: 80 },
            week7: { volume: 125, intensity: 82 },
            week8: { volume: 90, intensity: 65 } // Deload
          },
          timestamp: Date.now()
        }
        
        setWeeklyPlan(plan)
        setIsGenerating(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao gerar plano semanal:', error)
      setIsGenerating(false)
    }
  }

  const saveWeeklyPlan = async () => {
    if (!session?.tokenKey || !weeklyPlan) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_plano_semanal/${encodedKey}`), weeklyPlan)
      
      alert('Plano semanal salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar plano semanal:', error)
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Gerador de Treino IA</h1>
          <p className="text-[var(--color-muted)]">Crie treinos personalizados com inteligência artificial</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'generate'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Zap size={20} />
            Gerar Treino
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'plan'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Target size={20} />
            Plano Semanal
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'saved'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Dumbbell size={20} />
            Salvos
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold mb-4">Configurações do Treino</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Objetivo</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
                  >
                    <option value="hipertrofia">Hipertrofia</option>
                    <option value="forca">Força</option>
                    <option value="perda_peso">Perda de Peso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Equipamento</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
                  >
                    <option value="academia">Academia Completa</option>
                    <option value="casa">Casa (Equipamento Básico)</option>
                    <option value="sem_equipamento">Sem Equipamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nível de Recuperação (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={recoveryLevel}
                    onChange={(e) => setRecoveryLevel(e.target.value)}
                    placeholder="5"
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">1 = Muito cansado, 10 = 100% recuperado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lesão (opcional)</label>
                  <Input
                    value={injury}
                    onChange={(e) => setInjury(e.target.value)}
                    placeholder="Ex: joelho, ombro, costas..."
                  />
                </div>

                <Button onClick={generateWorkout} disabled={isGenerating} className="w-full">
                  {isGenerating ? 'Gerando...' : 'Gerar Treino'}
                </Button>
              </div>
            </Card>

            {generatedWorkout && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Treino Gerado</h2>
                  <Button onClick={saveWorkout} size="sm">
                    Salvar
                  </Button>
                </div>

                <div className="space-y-3">
                  {generatedWorkout.exercises.map((ex, index) => (
                    <div key={index} className="p-4 bg-[var(--color-border)] rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{ex.name}</h3>
                        <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">{ex.muscle}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-[var(--color-muted)]">
                        <span>{ex.sets} séries</span>
                        <span>{ex.reps} reps</span>
                        <span>{ex.rest}s descanso</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Plano Semanal de 8 Semanas</h2>
                <Button onClick={generateWeeklyPlan} disabled={isGenerating}>
                  {isGenerating ? 'Gerando...' : 'Gerar Plano'}
                </Button>
              </div>

              {weeklyPlan && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Semana Atual</span>
                      <span className="text-sm text-[var(--color-muted)]">{currentWeek} / {weeklyPlan.totalWeeks}</span>
                    </div>
                    <div className="w-full bg-[var(--color-border)] rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${(currentWeek / weeklyPlan.totalWeeks) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {Object.entries(weeklyPlan.weeklySchedule).map(([day, schedule]) => (
                      <div key={day} className="p-3 bg-[var(--color-border)] rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{day}</span>
                          <span className="text-sm text-[var(--color-muted)]">
                            {Array.isArray(schedule) ? schedule.join(', ') : 'Treino'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={saveWeeklyPlan} className="w-full">
                    Salvar Plano
                  </Button>
                </>
              )}
            </Card>

            {weeklyPlan && (
              <Card>
                <h3 className="font-bold mb-4">Progressão de Volume e Intensidade</h3>
                <div className="space-y-2">
                  {Object.entries(weeklyPlan.progression).map(([week, data]) => (
                    <div key={week} className="flex items-center justify-between p-2 bg-[var(--color-border)] rounded">
                      <span className="text-sm font-medium capitalize">{week}</span>
                      <div className="flex gap-4 text-sm text-[var(--color-muted)]">
                        <span>Volume: {data.volume}%</span>
                        <span>Intensidade: {data.intensity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedWorkouts.length === 0 ? (
              <Card>
                <p className="text-center text-[var(--color-muted)] py-8">
                  Nenhum treino salvo ainda. Gere um treino e salve para acessá-lo depois.
                </p>
              </Card>
            ) : (
              savedWorkouts.map((workout) => (
                <Card key={workout.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold capitalize">{workout.objective}</h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        {workout.equipment} • {workout.duration} min
                      </p>
                    </div>
                    <button
                      onClick={() => deleteWorkout(workout.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {workout.exercises.map((ex, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{ex.name}</span>
                        <span className="text-[var(--color-muted)] ml-2">
                          {ex.sets}x{ex.reps}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button size="sm" className="w-full mt-4">
                    <Play size={16} className="mr-2" />
                    Iniciar Treino
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}

export default WorkoutGeneratorPage
