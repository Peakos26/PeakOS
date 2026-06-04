import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { TREINOS_POR_OBJETIVO } from '@constants/trainingConstants'
import { trainingService } from '@services/trainingService'

const TrainingPage = () => {
  const { session, hasFeature } = useAuth()
  const [currentPage, setCurrentPage] = useState('treinos')
  const [trainingPlan, setTrainingPlan] = useState(null)
  const [workoutSheets, setWorkoutSheets] = useState([])
  const [selectedObjective, setSelectedObjective] = useState('')
  const [showNewSheet, setShowNewSheet] = useState(false)

  useEffect(() => {
    loadTrainingPlan()
    loadWorkoutSheets()
  }, [session])

  const loadTrainingPlan = async () => {
    if (!session) return
    const result = await trainingService.getTrainingPlan(session.tokenKey)
    if (result.success) {
      setTrainingPlan(result.data)
    }
  }

  const loadWorkoutSheets = async () => {
    if (!session) return
    const result = await trainingService.getWorkoutSheets(session.tokenKey)
    if (result.success && result.data) {
      setWorkoutSheets(Object.values(result.data))
    }
  }

  const handleGenerateTraining = async () => {
    if (!selectedObjective || !session) return

    const treino = TREINOS_POR_OBJETIVO[selectedObjective]
    if (!treino) return

    const planData = {
      objetivo: selectedObjective,
      nome: treino.nome,
      descricao: treino.descricao,
      duracao: treino.duracao,
      descanso: treino.descanso,
      intervalo: treino.intervalo,
      exercicios: treino.exercicios,
      createdAt: Date.now()
    }

    const result = await trainingService.saveTrainingPlan(session.tokenKey, planData)
    if (result.success) {
      alert('Treino gerado com sucesso!')
      loadTrainingPlan()
    } else {
      alert('Erro ao gerar treino')
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Treinos</h1>

        {/* Gerar Treino Personalizado */}
        {hasFeature('treinos_personalizados') && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Gerar Treino Personalizado</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Objetivo</label>
                <select
                  value={selectedObjective}
                  onChange={(e) => setSelectedObjective(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione</option>
                  <option value="massa">Ganho de massa</option>
                  <option value="peso">Perda de peso</option>
                  <option value="tonificacao">Tonificação</option>
                  <option value="gordura">Queima de gordura</option>
                  <option value="performance">Alta performance</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="caminhada">Caminhada</option>
                  <option value="pedalada">Pedalada</option>
                </select>
              </div>
              <Button onClick={handleGenerateTraining} disabled={!selectedObjective}>
                Gerar Treino Personalizado
              </Button>
            </div>
          </Card>
        )}

        {/* Plano Atual */}
        {trainingPlan && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Plano Atual</h2>
            <div className="mb-4">
              <div className="font-semibold text-xl">{trainingPlan.nome}</div>
              <div className="text-sm text-[var(--color-muted)]">{trainingPlan.descricao}</div>
            </div>
            <div className="space-y-2">
              {trainingPlan.exercicios.map((exercicio, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--color-border)] rounded-lg">
                  <div>
                    <div className="font-medium">{exercicio.nome}</div>
                    <div className="text-sm text-[var(--color-muted)]">
                      {exercicio.series} séries × {exercicio.repeticoes}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">{exercicio.descanso}s</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Fichas de Treino */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Fichas de Treino</h2>
          <Button onClick={() => setShowNewSheet(true)}>Nova Ficha</Button>
        </div>

        <div className="space-y-4">
          {workoutSheets.length === 0 ? (
            <Card>
              <p className="text-center text-[var(--color-muted)]">Nenhuma ficha criada</p>
            </Card>
          ) : (
            workoutSheets.map((sheet) => (
              <Card key={sheet.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{sheet.nome}</div>
                    <div className="text-sm text-[var(--color-muted)]">
                      {sheet.exercicios?.length || 0} exercícios
                    </div>
                  </div>
                  <Button variant="outline">Ver</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default TrainingPage
