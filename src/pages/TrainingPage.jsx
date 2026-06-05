import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { TREINOS_POR_OBJETIVO, EXERCICIOS_DISPONIVEIS, MUSCLE_WIKI_LINKS, MUSCLE_IMAGES } from '@constants/trainingConstants'
import { trainingService } from '@services/trainingService'
import { ChevronRight, Eye, Edit2, Trash2 } from 'lucide-react'

const TrainingPage = () => {
  const { session, hasFeature } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState('treinos')
  const [trainingPlan, setTrainingPlan] = useState(null)
  const [workoutSheets, setWorkoutSheets] = useState([])
  const [selectedObjective, setSelectedObjective] = useState('')
  const [selectedDays, setSelectedDays] = useState(4)
  const [showNewSheet, setShowNewSheet] = useState(false)
  const [newSheetName, setNewSheetName] = useState('')
  const [selectedExercises, setSelectedExercises] = useState([])
  const [editingSheet, setEditingSheet] = useState(null)
  const [swipedSheet, setSwipedSheet] = useState(null)

  useEffect(() => {
    loadTrainingPlan()
    loadWorkoutSheets()
    
    // Verificar se veio da HomePage com selectedDay
    if (location.state?.selectedDay) {
      handleStartWorkout(location.state.selectedDay)
    }
  }, [session, location.state])

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

  const generateWeeklyPlan = (objective, days) => {
    const baseTreino = TREINOS_POR_OBJETIVO[objective]
    if (!baseTreino) return null

    // Distribuição de dias da semana
    const diasSemana = [
      { dia: 0, nome: 'Segunda', abrev: 'Seg' },
      { dia: 1, nome: 'Terça', abrev: 'Ter' },
      { dia: 2, nome: 'Quarta', abrev: 'Qua' },
      { dia: 3, nome: 'Quinta', abrev: 'Qui' },
      { dia: 4, nome: 'Sexta', abrev: 'Sex' },
      { dia: 5, nome: 'Sábado', abrev: 'Sáb' },
      { dia: 6, nome: 'Domingo', abrev: 'Dom' }
    ]

    // Selecionar dias baseado no número escolhido
    const diasSelecionados = diasSemana.slice(0, days)

    // Criar variações de exercícios para cada dia
    const planoSemanal = diasSelecionados.map((diaInfo, index) => {
      // Rotacionar exercícios para cada dia
      const exerciciosRotacionados = baseTreino.exercicios.map((exercicio, i) => {
        const novoIndex = (i + index * 2) % baseTreino.exercicios.length
        return {
          ...baseTreino.exercicios[novoIndex],
          series: exercicio.series,
          repeticoes: exercicio.repeticoes,
          descanso: exercicio.descanso
        }
      })

      return {
        dia: diaInfo.dia,
        nomeDia: diaInfo.nome,
        abrevDia: diaInfo.abrev,
        exercicios: exerciciosRotacionados
      }
    })

    return {
      objetivo: objective,
      nome: baseTreino.nome,
      descricao: baseTreino.descricao,
      duracao: baseTreino.duracao,
      descanso: baseTreino.descanso,
      intervalo: baseTreino.intervalo,
      diasSemana: days,
      planoSemanal: planoSemanal,
      createdAt: Date.now()
    }
  }

  const handleGenerateTraining = async () => {
    if (!selectedObjective || !session) return

    const planData = generateWeeklyPlan(selectedObjective, selectedDays)
    if (!planData) return

    const result = await trainingService.saveTrainingPlan(session.tokenKey, planData)
    if (result.success) {
      alert('Treino gerado com sucesso!')
      loadTrainingPlan()
    } else {
      alert('Erro ao gerar treino')
    }
  }

  const handleCreateSheet = async () => {
    if (!newSheetName || !session) return

    // Converter nomes de exercícios para objetos completos
    const exerciciosCompletos = selectedExercises.map(nome => {
      // Tenta encontrar o exercício no plano atual ou usa valores padrão
      const exercicioExistente = trainingPlan?.exercicios?.find(e => e.nome === nome)
      return exercicioExistente || {
        nome,
        series: 3,
        repeticoes: '10-12',
        descanso: 60
      }
    })

    const sheetId = editingSheet?.id || Date.now().toString()
    const sheetData = {
      id: sheetId,
      nome: newSheetName,
      exercicios: exerciciosCompletos,
      createdAt: editingSheet?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    const result = await trainingService.saveWorkoutSheet(session.tokenKey, sheetId, sheetData)
    if (result.success) {
      alert(editingSheet ? 'Ficha atualizada com sucesso!' : 'Ficha criada com sucesso!')
      setShowNewSheet(false)
      setNewSheetName('')
      setSelectedExercises([])
      setEditingSheet(null)
      loadWorkoutSheets()
    } else {
      alert('Erro ao salvar ficha')
    }
  }

  const handleStartWorkout = (sheetId = null, selectedDay = null) => {
    if (selectedDay !== null) {
      // Se foi passado um dia específico, navega com o dia selecionado
      navigate('/log-treino', { state: { useTrainingPlan: true, selectedDay } })
    } else if (sheetId) {
      // Se foi passada uma ficha específica, navega com o ID da ficha
      navigate('/log-treino', { state: { sheetId } })
    } else {
      // Se não, usa o plano atual
      navigate('/log-treino', { state: { useTrainingPlan: true } })
    }
  }

  const handleAddExercise = (exercise) => {
    if (!selectedExercises.includes(exercise)) {
      setSelectedExercises([...selectedExercises, exercise])
    }
  }

  const handleRemoveExercise = (exercise) => {
    setSelectedExercises(selectedExercises.filter(e => e !== exercise))
  }

  const handleEditSheet = (sheet) => {
    setEditingSheet(sheet)
    setNewSheetName(sheet.nome)
    setSelectedExercises(sheet.exercicios?.map(e => e.nome) || [])
    setShowNewSheet(true)
  }

  const handleDeleteSheet = async (sheetId) => {
    if (!confirm('Tem certeza que deseja deletar esta ficha?')) return
    
    const result = await trainingService.deleteWorkoutSheet(session.tokenKey, sheetId)
    if (result.success) {
      alert('Ficha deletada com sucesso!')
      loadWorkoutSheets()
    } else {
      alert('Erro ao deletar ficha')
    }
  }

  const handleViewSheet = (sheet) => {
    // Navegar para visualização da ficha (pode ser implementado depois)
    alert(`Ficha: ${sheet.nome}\nExercícios: ${sheet.exercicios?.map(e => e.nome).join(', ') || 'Nenhum'}`)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Treinos</h1>

        {/* Gerar Treino Personalizado */}
        {hasFeature('treinos_personalizados') && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Gerar Treino Personalizado</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="objetivo" className="block text-sm font-medium mb-2">Objetivo</label>
                <select
                  id="objetivo"
                  name="objetivo"
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
              <div>
                <label htmlFor="dias-semana" className="block text-sm font-medium mb-2">Dias por semana</label>
                <select
                  id="dias-semana"
                  name="dias-semana"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={3}>3 dias (Seg, Qua, Sex)</option>
                  <option value={4}>4 dias (Seg, Ter, Qui, Sex)</option>
                  <option value={5}>5 dias (Seg, Ter, Qua, Qui, Sex)</option>
                  <option value={6}>6 dias (Seg, Ter, Qua, Qui, Sex, Sáb)</option>
                  <option value={7}>7 dias (Todos os dias)</option>
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
              <div className="text-sm text-[var(--color-muted)] mt-1">{trainingPlan.diasSemana} dias por semana</div>
            </div>
            
            {/* Exibir plano semanal */}
            {trainingPlan.planoSemanal ? (
              <div className="space-y-4">
                {trainingPlan.planoSemanal.map((dia, index) => (
                  <div key={index} className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="font-semibold mb-3">{dia.nomeDia}</div>
                    <div className="space-y-2">
                      {dia.exercicios.map((exercicio, exIndex) => (
                        <div key={exIndex} className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              {MUSCLE_IMAGES[exercicio.nome] && (
                                <img 
                                  src={MUSCLE_IMAGES[exercicio.nome]} 
                                  alt={exercicio.nome}
                                  className="w-12 h-12 object-contain"
                                />
                              )}
                              <div>
                                <div className="font-medium text-sm">{exercicio.nome}</div>
                                <div className="text-xs text-[var(--color-muted)]">
                                  {exercicio.series} séries × {exercicio.repeticoes}
                                </div>
                              </div>
                            </div>
                            {MUSCLE_WIKI_LINKS[exercicio.nome] && (
                              <a 
                                href={MUSCLE_WIKI_LINKS[exercicio.nome]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:underline mt-1 block"
                              >
                                Ver no Muscle Wiki →
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-[var(--color-muted)] ml-4">
                            {exercicio.descanso}s descanso
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 mb-4">
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
            )}
            <Button onClick={() => handleStartWorkout()} className="w-full">Iniciar Treino</Button>
          </Card>
        )}

        {/* Fichas de Treino */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Fichas de Treino</h2>
          <Button onClick={() => setShowNewSheet(true)}>Nova Ficha</Button>
        </div>

        {/* Modal Nova Ficha */}
        {showNewSheet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">{editingSheet ? 'Editar Ficha' : 'Nova Ficha de Treino'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Ficha</label>
                  <Input
                    id="newSheetName"
                    name="newSheetName"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="Ex: Treino A - Peito"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Adicionar Exercícios</label>
                  <select
                    onChange={(e) => e.target.value && handleAddExercise(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue=""
                  >
                    <option value="">Selecione um exercício</option>
                    {EXERCICIOS_DISPONIVEIS.map(exercicio => (
                      <option key={exercicio} value={exercicio}>{exercicio}</option>
                    ))}
                  </select>
                </div>
                {selectedExercises.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Exercícios Selecionados</label>
                    <div className="space-y-2">
                      {selectedExercises.map((exercicio, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-[var(--color-border)] rounded-lg">
                          <span className="text-sm">{exercicio}</span>
                          <button
                            onClick={() => handleRemoveExercise(exercicio)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleCreateSheet} disabled={!newSheetName || selectedExercises.length === 0}>
                    {editingSheet ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowNewSheet(false)
                    setNewSheetName('')
                    setSelectedExercises([])
                    setEditingSheet(null)
                  }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {workoutSheets.length === 0 ? (
            <Card>
              <p className="text-center text-[var(--color-muted)]">Nenhuma ficha criada</p>
            </Card>
          ) : (
            workoutSheets.map((sheet) => (
              <Card key={sheet.id} className="relative overflow-hidden">
                <div 
                  className={`flex items-center justify-between transition-transform duration-300 ${swipedSheet === sheet.id ? 'translate-x-[-120px]' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold">{sheet.nome}</div>
                    <div className="text-sm text-[var(--color-muted)]">
                      {sheet.exercicios?.length || 0} exercícios
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleStartWorkout(sheet.id)}
                      className="flex items-center gap-1"
                    >
                      Iniciar <ChevronRight size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSwipedSheet(swipedSheet === sheet.id ? null : sheet.id)}
                    >
                      <ChevronRight size={16} className={swipedSheet === sheet.id ? 'rotate-180' : ''} />
                    </Button>
                  </div>
                </div>
                
                {/* Botões de ação (swipe) */}
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2 bg-gradient-to-l from-[var(--color-bg)] to-transparent">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSheet(sheet)}
                    className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSheet(sheet)}
                    className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSheet(sheet.id)}
                    className="bg-red-500 text-white border-red-500 hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <Navigation />
    </div>
  )
}

export default TrainingPage
