import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { trainingService } from '@services/trainingService'

const WorkoutLogPage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState('log-treino')
  const [trainingPlan, setTrainingPlan] = useState(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [series, setSeries] = useState([])

  useEffect(() => {
    loadTrainingPlan()
  }, [session])

  const loadTrainingPlan = async () => {
    if (!session) return
    const result = await trainingService.getTrainingPlan(session.tokenKey)
    if (result.success) {
      setTrainingPlan(result.data)
    }
  }

  const handleAddSerie = () => {
    const newSerie = {
      peso: 0,
      reps: 0
    }
    setSeries([...series, newSerie])
  }

  const handleUpdateSerie = (index, field, value) => {
    const updatedSeries = [...series]
    updatedSeries[index][field] = value
    setSeries(updatedSeries)
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < (trainingPlan?.exercicios?.length || 0) - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setSeries([])
    }
  }

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setSeries([])
    }
  }

  const handleFinishWorkout = async () => {
    if (!session || !trainingPlan) return

    const workoutData = {
      dia: new Date().getDay(),
      exercicios: trainingPlan.exercicios.map((exercicio, index) => ({
        nome: exercicio.nome,
        series: index === currentExerciseIndex ? series : []
      })),
      createdAt: Date.now()
    }

    const result = await trainingService.saveWorkoutLog(session.tokenKey, workoutData)
    if (result.success) {
      alert('Treino salvo com sucesso!')
      navigate('/')
    } else {
      alert('Erro ao salvar treino')
    }
  }

  const currentExercise = trainingPlan?.exercicios?.[currentExerciseIndex]

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Log de Treino</h1>

        {!trainingPlan ? (
          <Card>
            <p className="text-center text-[var(--color-muted)]">
              Nenhum plano de treino encontrado. Gere um plano primeiro.
            </p>
            <Button onClick={() => navigate('/treinos')} className="mt-4">
              Ir para Treinos
            </Button>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{currentExercise?.nome}</h2>
                <div className="text-sm text-[var(--color-muted)]">
                  {currentExerciseIndex + 1} / {trainingPlan.exercicios.length}
                </div>
              </div>
              <div className="text-sm text-[var(--color-muted)] mb-4">
                {currentExercise?.series} séries × {currentExercise?.repeticoes}
              </div>

              <div className="space-y-3">
                {series.map((serie, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Peso (kg)"
                        value={serie.peso}
                        onChange={(e) => handleUpdateSerie(index, 'peso', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={serie.reps}
                        onChange={(e) => handleUpdateSerie(index, 'reps', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleAddSerie} className="w-full mt-4" variant="outline">
                + Adicionar Série
              </Button>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                variant="outline"
                className="flex-1"
              >
                Anterior
              </Button>
              {currentExerciseIndex === trainingPlan.exercicios.length - 1 ? (
                <Button onClick={handleFinishWorkout} className="flex-1">
                  Finalizar Treino
                </Button>
              ) : (
                <Button onClick={handleNextExercise} className="flex-1">
                  Próximo
                </Button>
              )}
            </div>
          </>
        )}
      </main>

      <Navigation />
    </div>
  )
}

export default WorkoutLogPage
