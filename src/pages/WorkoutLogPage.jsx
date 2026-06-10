import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { trainingService } from '@services/trainingService'
import { MUSCLE_WIKI_LINKS } from '@constants/trainingConstants'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

const WorkoutLogPage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState('log-treino')
  const [trainingPlan, setTrainingPlan] = useState(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [series, setSeries] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [workoutId, setWorkoutId] = useState(null)
  const [sheetId, setSheetId] = useState(null)
  const [workoutData, setWorkoutData] = useState(null)
  const [currentWorkout, setCurrentWorkout] = useState(null)
  
  // Sprint 1.1: Log de Treino Avançado
  const [restTimer, setRestTimer] = useState(null)
  const [restTimerSeconds, setRestTimerSeconds] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)
  const [suggestedWeight, setSuggestedWeight] = useState(0)

  useEffect(() => {
    // Verificar o tipo de treino que foi passado
    if (location.state?.workoutData) {
      // Treino salvo do WorkoutGeneratorPage
      setWorkoutData(location.state.workoutData)
      setCurrentWorkout(location.state.workoutData)
    } else if (location.state?.workoutId) {
      // Treino IA gerado (buscar do Firebase)
      setWorkoutId(location.state.workoutId)
      loadWorkoutById(location.state.workoutId)
    } else if (location.state?.sheetId) {
      // Ficha de treino (buscar do Firebase)
      setSheetId(location.state.sheetId)
      loadSheetById(location.state.sheetId)
    } else if (location.state?.selectedDay !== undefined) {
      // Treino do plano semanal
      setSelectedDay(location.state.selectedDay)
      loadTrainingPlan()
    } else {
      // Carregar plano padrão
      loadTrainingPlan()
    }
  }, [session, location.state])

  // Sprint 1.1: Calcular volume total em tempo real
  useEffect(() => {
    const volume = series.reduce((total, serie) => total + (serie.peso * serie.reps), 0)
    setTotalVolume(volume)
  }, [series])

  // Sprint 1.1: Rest timer
  useEffect(() => {
    if (restTimerSeconds > 0) {
      const timer = setTimeout(() => {
        setRestTimerSeconds(restTimerSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [restTimerSeconds])

  const loadTrainingPlan = async () => {
    if (!session) return
    const result = await trainingService.getTrainingPlan(session.tokenKey)
    if (result.success) {
      setTrainingPlan(result.data)
      // Sprint 1.1: Carregar sugestão de carga da última sessão
      loadSuggestedWeight(result.data)
    }
  }

  const loadWorkoutById = async (id) => {
    if (!session) return
    const result = await trainingService.getWorkouts(session.tokenKey)
    if (result.success && result.data) {
      const workout = result.data[id]
      if (workout) {
        setCurrentWorkout(workout)
      }
    }
  }

  const loadSheetById = async (id) => {
    if (!session) return
    const result = await trainingService.getWorkoutSheets(session.tokenKey)
    if (result.success && result.data) {
      const sheet = result.data[id]
      if (sheet) {
        setCurrentWorkout(sheet)
      }
    }
  }

  // Sprint 1.1: Carregar sugestão de carga baseada na última sessão (progressive overload)
  const loadSuggestedWeight = async (plan) => {
    if (!session || !plan) return
    const result = await trainingService.getLastWorkoutLog(session.tokenKey)
    if (result.success && result.data) {
      const lastExercise = result.data.exercicios?.find(ex => ex.nome === currentExercise?.nome)
      if (lastExercise && lastExercise.series && lastExercise.series.length > 0) {
        const lastWeight = lastExercise.series[lastExercise.series.length - 1].peso
        setSuggestedWeight(lastWeight)
      }
    }
  }

  const handleAddSerie = () => {
    // Sprint 1.1: Adicionar tags de tipo de série (warm-up, working, drop, failure)
    const newSerie = {
      peso: suggestedWeight || 0,
      reps: 0,
      tipo: 'working', // warm-up, working, drop, failure
      completed: false
    }
    setSeries([...series, newSerie])
  }

  const handleUpdateSerie = (index, field, value) => {
    const updatedSeries = [...series]
    updatedSeries[index][field] = value
    setSeries(updatedSeries)
  }

  // Sprint 1.1: Iniciar rest timer após completar série
  const handleCompleteSerie = (index) => {
    const updatedSeries = [...series]
    updatedSeries[index].completed = true
    setSeries(updatedSeries)
    
    // Iniciar rest timer de 90 segundos (configurável por exercício)
    setRestTimerSeconds(90)
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < currentExercisesList.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setSeries([])
      setTotalVolume(0)
      setSuggestedWeight(0)
      // Carregar sugestão de carga para o próximo exercício
      loadSuggestedWeight(trainingPlan)
    }
  }

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setSeries([])
      setTotalVolume(0)
      setSuggestedWeight(0)
      // Carregar sugestão de carga para o exercício anterior
      loadSuggestedWeight(trainingPlan)
    }
  }

  const handleFinishWorkout = async () => {
    if (!session || !trainingPlan) return

    // Sprint 1.1: Salvar com tags de série e volume total
    const workoutData = {
      dia: selectedDay !== null ? selectedDay : new Date().getDay(),
      exercicios: currentExercisesList.map((exercicio, index) => ({
        nome: exercicio.nome,
        series: index === currentExerciseIndex ? series : [],
        grupoMuscular: exercicio.grupoMuscular || 'Geral'
      })),
      volumeTotal: totalVolume,
      createdAt: Date.now()
    }

    const result = await trainingService.saveWorkoutLog(session.tokenKey, workoutData)
    if (result.success) {
      // Sprint 1.3: Salvar PRs automaticamente
      for (const serie of series) {
        if (serie.peso > 0 && serie.reps > 0) {
          const oneRM = calculate1RM(serie.peso, serie.reps)
          await trainingService.savePR(session.tokenKey, currentExercise?.nome, oneRM)
        }
      }
      
      // Feature Tá Feito: Redirecionar para tela de conclusão
      const workoutForTaFeito = {
        nome: currentDayName,
        kcal: Math.round(totalVolume * 0.5), // Estimativa de kcal baseada no volume
        duration: Math.round((Date.now() - (workoutData.createdAt || Date.now())) / 60000) || 60, // Estimativa de duração em minutos
        completedAt: Date.now(),
        exercicios: workoutData.exercicios
      }
      
      navigate('/ta-feito', { state: { workout: workoutForTaFeito } })
    } else {
      alert('Erro ao salvar treino')
    }
  }

  // Sprint 1.1: Calcular 1RM usando fórmula Epley
  const calculate1RM = (peso, reps) => {
    if (reps === 0) return 0
    return Math.round(peso * (1 + reps / 30))
  }

  const currentExercise = currentWorkout?.exercises
    ? currentWorkout.exercises[currentExerciseIndex]
    : selectedDay !== null && trainingPlan?.planoSemanal
      ? trainingPlan.planoSemanal.find(day => day.dia === selectedDay)?.exercicios?.[currentExerciseIndex]
      : trainingPlan?.exercicios?.[currentExerciseIndex]

  const currentExercisesList = currentWorkout?.exercises
    ? currentWorkout.exercises
    : selectedDay !== null && trainingPlan?.planoSemanal
      ? trainingPlan.planoSemanal.find(day => day.dia === selectedDay)?.exercicios || []
      : trainingPlan?.exercicios || []

  const currentDayName = currentWorkout?.nome
    ? currentWorkout.nome
    : selectedDay !== null && trainingPlan?.planoSemanal
      ? trainingPlan.planoSemanal.find(day => day.dia === selectedDay)?.nomeDia
      : 'Treino Atual'

  // Verificar se é um treino IA gerado
  const isIAGenerated = workoutData || workoutId || (currentWorkout?.tipo === 'ia_generated')

  return (
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Log de Treino — {currentDayName}</h1>

        {!trainingPlan && !currentWorkout ? (
          <Card>
            <p className="text-center text-[var(--color-muted)]">
              Nenhum treino encontrado. Gere um treino primeiro.
            </p>
            <Button onClick={() => navigate('/treinos')} className="mt-4">
              Ir para Treinos
            </Button>
          </Card>
        ) : (
          <>
            {/* Interface simplificada para treinos IA gerados */}
            {isIAGenerated ? (
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{currentExercise?.name}</h2>
                  <div className="text-sm text-[var(--color-muted)]">
                    {currentExerciseIndex + 1} / {currentExercisesList.length}
                  </div>
                </div>
                <div className="text-sm text-[var(--color-muted)] mb-2">
                  Equipamento: {currentExercise?.equipment}
                </div>
                <div className="text-sm text-[var(--color-muted)] mb-2">
                  Grupo muscular: {currentExercise?.muscle}
                </div>
                <div className="text-sm text-[var(--color-muted)] mb-4">
                  Descanso: {currentExercise?.rest}s
                </div>
                <div className="space-y-2 mb-4">
                  {Array.isArray(currentExercise?.sets) ? (
                    currentExercise.sets.map((set, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[var(--color-border)] rounded">
                        <span className="text-sm">Série {set.set}</span>
                        <span className="text-sm font-medium">{set.reps}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-[var(--color-muted)]">
                      {currentExercise?.sets} séries × {currentExercise?.reps} reps
                    </div>
                  )}
                </div>
                {MUSCLE_WIKI_LINKS[currentExercise?.name] && (
                  <a
                    href={MUSCLE_WIKI_LINKS[currentExercise?.name]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline mt-1 block"
                  >
                    Ver no Muscle Wiki →
                  </a>
                )}
              </Card>
            ) : (
              <>
                {/* Sprint 1.1: Volume total em tempo real */}
                <Card className="mb-4 bg-primary-50 dark:bg-primary-900/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-[var(--color-muted)]">Volume Total:</span>
                      <span className="text-2xl font-bold ml-2">{totalVolume} kg</span>
                    </div>
                    {/* Sprint 1.1: Rest timer */}
                    {restTimerSeconds > 0 && (
                      <div className="text-right">
                        <span className="text-sm text-[var(--color-muted)]">Descanso:</span>
                        <span className="text-2xl font-bold ml-2 text-primary-600">{restTimerSeconds}s</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{currentExercise?.nome}</h2>
                    <div className="text-sm text-[var(--color-muted)]">
                      {currentExerciseIndex + 1} / {currentExercisesList.length}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--color-muted)] mb-4">
                    {currentExercise?.series} séries × {currentExercise?.repeticoes}
                  </div>

                  {/* Sprint 1.1: Sugestão de carga */}
                  {suggestedWeight > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        💡 Sugestão de carga (última sessão): {suggestedWeight} kg
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {series.map((serie, index) => (
                      <div key={index} className="border border-[var(--color-border)] rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Sprint 1.1: Tag de tipo de série */}
                          <select
                            id={`tipo-${index}`}
                            name={`tipo-${index}`}
                            value={serie.tipo}
                            onChange={(e) => handleUpdateSerie(index, 'tipo', e.target.value)}
                            className="text-xs px-2 py-1 rounded bg-[var(--color-border)] text-[var(--color-text)]"
                          >
                            <option value="warm-up">Warm-up</option>
                            <option value="working">Working</option>
                            <option value="drop">Drop</option>
                            <option value="failure">Failure</option>
                          </select>
                          <div className="flex-1">
                            <Input
                              type="number"
                              id={`peso-${index}`}
                              name={`peso-${index}`}
                              placeholder="Peso (kg)"
                              value={serie.peso}
                              onChange={(e) => handleUpdateSerie(index, 'peso', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              type="number"
                              id={`reps-${index}`}
                              name={`reps-${index}`}
                              placeholder="Reps"
                              value={serie.reps}
                              onChange={(e) => handleUpdateSerie(index, 'reps', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          {/* Sprint 1.1: Botão para completar série e iniciar rest timer */}
                          <Button
                            onClick={() => handleCompleteSerie(index)}
                            variant={serie.completed ? "outline" : "default"}
                            size="sm"
                          >
                            {serie.completed ? "✓" : "OK"}
                          </Button>
                        </div>
                        {/* Sprint 1.1: Estimativa de 1RM */}
                        {serie.peso > 0 && serie.reps > 0 && (
                          <div className="text-xs text-[var(--color-muted)]">
                            1RM estimado: {calculate1RM(serie.peso, serie.reps)} kg
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleAddSerie} className="w-full mt-4" variant="outline">
                    + Adicionar Série
                  </Button>
                </Card>
              </>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                variant="outline"
                className="flex-1"
              >
                Anterior
              </Button>
              {currentExerciseIndex === currentExercisesList.length - 1 ? (
                <Button onClick={handleFinishWorkout} className="flex-1">
                  Finalizar Treino
                </Button>
              ) : (
                <Button onClick={handleNextExercise} className="flex-1">
                  Próximo
                </Button>
              )}
            </div>

            {/* Botão fixo de finalizar treino - sempre visível durante treino */}
            {currentWorkout && (
              <div className="fixed bottom-20 left-0 right-0 px-4 z-40 md:hidden">
                <button
                  onClick={handleFinishWorkout}
                  className="w-full py-4 bg-[#84CC16] text-black font-bold text-lg rounded-2xl shadow-2xl flex items-center justify-center gap-2"
                >
                  💪 Finalizar Treino
                </button>
              </div>
            )}
          </>
        )}
      </main>
  )
}

export default WorkoutLogPage
