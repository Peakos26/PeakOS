import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { database, ref, get, set } from '@config/firebase.config'
import { trainingService } from '@services/trainingService'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

// Sprint 1.4: Programas de Treino pré-definidos
const WORKOUT_PROGRAMS = {
  abc: {
    id: 'abc',
    nome: 'ABC',
    descricao: 'Treino ABC focado em hipertrofia com 3 dias por semana',
    dias: 3,
    semanas: 8,
    plano: [
      {
        dia: 0,
        nomeDia: 'Dia A - Peito e Tríceps',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12', grupoMuscular: 'Peito' },
          { nome: 'Supino Inclinado com Halteres', series: 3, repeticoes: '10-12', grupoMuscular: 'Peito' },
          { nome: 'Crucifixo', series: 3, repeticoes: '12-15', grupoMuscular: 'Peito' },
          { nome: 'Tríceps no Cabo', series: 3, repeticoes: '10-12', grupoMuscular: 'Tríceps' },
          { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', grupoMuscular: 'Tríceps' },
          { nome: 'Dip', series: 3, repeticoes: '12-15', grupoMuscular: 'Tríceps' },
        ]
      },
      {
        dia: 1,
        nomeDia: 'Dia B - Costas e Bíceps',
        exercicios: [
          { nome: 'Barra Fixa', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Remada Inclinada', series: 3, repeticoes: '10-12', grupoMuscular: 'Costas' },
          { nome: 'Lat Pulldown', series: 3, repeticoes: '10-12', grupoMuscular: 'Costas' },
          { nome: 'Curl com Barra', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
          { nome: 'Curl Martelo', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
        ]
      },
      {
        dia: 2,
        nomeDia: 'Dia C - Pernas e Ombros',
        exercicios: [
          { nome: 'Agachamento', series: 4, repeticoes: '8-12', grupoMuscular: 'Pernas' },
          { nome: 'Leg Press', series: 4, repeticoes: '10-12', grupoMuscular: 'Pernas' },
          { nome: 'Extensão de Coxas', series: 3, repeticoes: '12-15', grupoMuscular: 'Pernas' },
          { nome: 'Flexão de Coxas', series: 3, repeticoes: '12-15', grupoMuscular: 'Pernas' },
          { nome: 'Elevação de Panturrilha', series: 4, repeticoes: '15-20', grupoMuscular: 'Pernas' },
          { nome: 'Press de Ombros', series: 4, repeticoes: '8-12', grupoMuscular: 'Ombros' },
          { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', grupoMuscular: 'Ombros' },
        ]
      }
    ]
  },
  push_pull_legs: {
    id: 'push_pull_legs',
    nome: 'Push Pull Legs',
    descricao: 'Treino Push Pull Legs com 3 dias por semana',
    dias: 3,
    semanas: 8,
    plano: [
      {
        dia: 0,
        nomeDia: 'Push - Peito, Ombros, Tríceps',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12', grupoMuscular: 'Peito' },
          { nome: 'Supino Inclinado', series: 4, repeticoes: '8-12', grupoMuscular: 'Peito' },
          { nome: 'Press de Ombros', series: 4, repeticoes: '8-12', grupoMuscular: 'Ombros' },
          { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', grupoMuscular: 'Ombros' },
          { nome: 'Tríceps no Cabo', series: 3, repeticoes: '10-12', grupoMuscular: 'Tríceps' },
          { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', grupoMuscular: 'Tríceps' },
        ]
      },
      {
        dia: 1,
        nomeDia: 'Pull - Costas, Bíceps',
        exercicios: [
          { nome: 'Barra Fixa', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Remada no Cabo', series: 3, repeticoes: '10-12', grupoMuscular: 'Costas' },
          { nome: 'Lat Pulldown', series: 3, repeticoes: '10-12', grupoMuscular: 'Costas' },
          { nome: 'Curl com Barra', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
          { nome: 'Curl Martelo', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
        ]
      },
      {
        dia: 2,
        nomeDia: 'Legs - Pernas',
        exercicios: [
          { nome: 'Agachamento', series: 4, repeticoes: '8-12', grupoMuscular: 'Pernas' },
          { nome: 'Leg Press', series: 4, repeticoes: '10-12', grupoMuscular: 'Pernas' },
          { nome: 'Hack Squat', series: 3, repeticoes: '10-12', grupoMuscular: 'Pernas' },
          { nome: 'Extensão de Coxas', series: 3, repeticoes: '12-15', grupoMuscular: 'Pernas' },
          { nome: 'Flexão de Coxas', series: 3, repeticoes: '12-15', grupoMuscular: 'Pernas' },
          { nome: 'Elevação de Panturrilha', series: 4, repeticoes: '15-20', grupoMuscular: 'Pernas' },
        ]
      }
    ]
  },
  upper_lower: {
    id: 'upper_lower',
    nome: 'Upper Lower',
    descricao: 'Treino Upper Lower com 4 dias por semana',
    dias: 4,
    semanas: 8,
    plano: [
      {
        dia: 0,
        nomeDia: 'Upper A - Empurrar',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12', grupoMuscular: 'Peito' },
          { nome: 'Supino Inclinado', series: 4, repeticoes: '8-12', grupoMuscular: 'Peito' },
          { nome: 'Press de Ombros', series: 4, repeticoes: '8-12', grupoMuscular: 'Ombros' },
          { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', grupoMuscular: 'Ombros' },
          { nome: 'Tríceps no Cabo', series: 3, repeticoes: '10-12', grupoMuscular: 'Tríceps' },
        ]
      },
      {
        dia: 1,
        nomeDia: 'Lower A - Pernas',
        exercicios: [
          { nome: 'Agachamento', series: 4, repeticoes: '8-12', grupoMuscular: 'Pernas' },
          { nome: 'Leg Press', series: 4, repeticoes: '10-12', grupoMuscular: 'Pernas' },
          { nome: 'Extensão de Coxas', series: 3, repeticoes: '12-15', grupoMuscular: 'Pernas' },
          { nome: 'Flexão de Coxas', series: 3, repeticoes: '12-15', grupoMuscular: 'Pernas' },
          { nome: 'Elevação de Panturrilha', series: 4, repeticoes: '15-20', grupoMuscular: 'Pernas' },
        ]
      },
      {
        dia: 2,
        nomeDia: 'Upper B - Puxar',
        exercicios: [
          { nome: 'Barra Fixa', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Remada no Cabo', series: 3, repeticoes: '10-12', grupoMuscular: 'Costas' },
          { nome: 'Curl com Barra', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
          { nome: 'Curl Martelo', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
        ]
      },
      {
        dia: 3,
        nomeDia: 'Lower B - Pernas',
        exercicios: [
          { nome: 'Agachamento Frontal', series: 4, repeticoes: '8-12', grupoMuscular: 'Pernas' },
          { nome: 'Hack Squat', series: 4, repeticoes: '10-12', grupoMuscular: 'Pernas' },
          { nome: 'Stiff Leg', series: 3, repeticoes: '10-12', grupoMuscular: 'Pernas' },
          { nome: 'Leg Curl', series: 3, repeticoes: '12-15', grupoMuscular: 'Pernas' },
          { nome: 'Panturrilha em Pé', series: 4, repeticoes: '15-20', grupoMuscular: 'Pernas' },
        ]
      }
    ]
  },
  full_body: {
    id: 'full_body',
    nome: 'Full Body',
    descricao: 'Treino Full Body com 3 dias por semana',
    dias: 3,
    semanas: 8,
    plano: [
      {
        dia: 0,
        nomeDia: 'Full Body A',
        exercicios: [
          { nome: 'Agachamento', series: 4, repeticoes: '8-12', grupoMuscular: 'Pernas' },
          { nome: 'Supino Reto', series: 4, repeticoes: '8-12', grupoMuscular: 'Peito' },
          { nome: 'Barra Fixa', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Press de Ombros', series: 3, repeticoes: '10-12', grupoMuscular: 'Ombros' },
          { nome: 'Curl com Barra', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
          { nome: 'Tríceps no Cabo', series: 3, repeticoes: '10-12', grupoMuscular: 'Tríceps' },
        ]
      },
      {
        dia: 1,
        nomeDia: 'Full Body B',
        exercicios: [
          { nome: 'Leg Press', series: 4, repeticoes: '10-12', grupoMuscular: 'Pernas' },
          { nome: 'Supino Inclinado', series: 4, repeticoes: '8-12', grupoMuscular: 'Peito' },
          { nome: 'Remada Curvada', series: 4, repeticoes: '8-12', grupoMuscular: 'Costas' },
          { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', grupoMuscular: 'Ombros' },
          { nome: 'Curl Martelo', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
          { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', grupoMuscular: 'Tríceps' },
        ]
      },
      {
        dia: 2,
        nomeDia: 'Full Body C',
        exercicios: [
          { nome: 'Agachamento Sumo', series: 4, repeticoes: '8-12', grupoMuscular: 'Pernas' },
          { nome: 'Crucifixo', series: 4, repeticoes: '12-15', grupoMuscular: 'Peito' },
          { nome: 'Lat Pulldown', series: 4, repeticoes: '10-12', grupoMuscular: 'Costas' },
          { nome: 'Encolhimento', series: 3, repeticoes: '12-15', grupoMuscular: 'Ombros' },
          { nome: 'Curl Inclinado', series: 3, repeticoes: '10-12', grupoMuscular: 'Bíceps' },
          { nome: 'Dip', series: 3, repeticoes: '12-15', grupoMuscular: 'Tríceps' },
        ]
      }
    ]
  },
  five_by_five: {
    id: 'five_by_five',
    nome: '5x5',
    descricao: 'Treino 5x5 focado em força com 3 dias por semana',
    dias: 3,
    semanas: 8,
    plano: [
      {
        dia: 0,
        nomeDia: 'Dia A',
        exercicios: [
          { nome: 'Agachamento', series: 5, repeticoes: '5', grupoMuscular: 'Pernas' },
          { nome: 'Supino Reto', series: 5, repeticoes: '5', grupoMuscular: 'Peito' },
          { nome: 'Barra Fixa', series: 5, repeticoes: '5', grupoMuscular: 'Costas' },
        ]
      },
      {
        dia: 1,
        nomeDia: 'Dia B',
        exercicios: [
          { nome: 'Agachamento', series: 5, repeticoes: '5', grupoMuscular: 'Pernas' },
          { nome: 'Supino Inclinado', series: 5, repeticoes: '5', grupoMuscular: 'Peito' },
          { nome: 'Remada Curvada', series: 5, repeticoes: '5', grupoMuscular: 'Costas' },
        ]
      },
      {
        dia: 2,
        nomeDia: 'Dia C',
        exercicios: [
          { nome: 'Agachamento', series: 5, repeticoes: '5', grupoMuscular: 'Pernas' },
          { nome: 'Supino Reto', series: 5, repeticoes: '5', grupoMuscular: 'Peito' },
          { nome: 'Remada Curvada', series: 5, repeticoes: '5', grupoMuscular: 'Costas' },
        ]
      }
    ]
  }
}

const WorkoutProgramsPage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [activeProgram, setActiveProgram] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(1)

  useEffect(() => {
    loadActiveProgram()
  }, [session])

  const loadActiveProgram = async () => {
    if (!session) return
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_programa/${encodedKey}`))
      const program = snapshot.val()
      if (program) {
        setActiveProgram(program)
        setCurrentWeek(program.currentWeek || 1)
      }
    } catch (error) {
      console.error('Erro ao carregar programa ativo:', error)
    }
  }

  // Sprint 1.4: Selecionar programa e salvar no Firebase
  const handleSelectProgram = async (programId) => {
    if (!session) return

    const program = WORKOUT_PROGRAMS[programId]
    const programData = {
      ...program,
      currentWeek: 1,
      startedAt: Date.now(),
      progressao: calculateProgression(program)
    }

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_programa/${encodedKey}`), programData)
      setActiveProgram(programData)
      setCurrentWeek(1)
      alert(`Programa ${program.nome} selecionado com sucesso!`)
    } catch (error) {
      console.error('Erro ao selecionar programa:', error)
      alert('Erro ao selecionar programa')
    }
  }

  // Sprint 1.4: Calcular progressão de carga semana a semana
  const calculateProgression = (program) => {
    const progression = {}
    program.plano.forEach((dia, diaIndex) => {
      dia.exercicios.forEach((exercicio, exIndex) => {
        const key = `${diaIndex}-${exIndex}`
        progression[key] = {
          baseWeight: 0,
          currentWeight: 0,
          increment: 2.5 // Incremento padrão de 2.5kg por semana
        }
      })
    })
    return progression
  }

  // Sprint 1.4: Avançar para próxima semana
  const handleAdvanceWeek = async () => {
    if (!session || !activeProgram) return

    const newWeek = currentWeek + 1
    if (newWeek > activeProgram.semanas) {
      alert('Parabéns! Você completou o programa!')
      return
    }

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_programa/${encodedKey}/currentWeek`), newWeek)
      setCurrentWeek(newWeek)
      setActiveProgram({ ...activeProgram, currentWeek: newWeek })
    } catch (error) {
      console.error('Erro ao avançar semana:', error)
      alert('Erro ao avançar semana')
    }
  }

  // Sprint 1.4: Iniciar treino do dia
  const handleStartWorkout = (dayIndex) => {
    navigate('/log-treino', { state: { selectedDay: dayIndex } })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Programas de Treino</h1>

        {/* Sprint 1.4: Programa ativo */}
        {activeProgram && (
          <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{activeProgram.nome}</h2>
                <p className="text-sm text-[var(--color-muted)]">{activeProgram.descricao}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-[var(--color-muted)]">Semana</span>
                <span className="text-2xl font-bold ml-2">{currentWeek}/{activeProgram.semanas}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAdvanceWeek} className="flex-1">
                Avançar Semana
              </Button>
              <Button onClick={() => navigate('/log-treino')} variant="outline" className="flex-1">
                Ver Treino Atual
              </Button>
            </div>
          </Card>
        )}

        {/* Sprint 1.4: Lista de programas disponíveis */}
        <div className="space-y-4">
          {Object.values(WORKOUT_PROGRAMS).map(program => (
            <Card key={program.id} className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{program.nome}</h3>
                <p className="text-sm text-[var(--color-muted)] mb-2">{program.descricao}</p>
                <div className="text-sm text-[var(--color-muted)]">
                  <span className="inline-block bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded mr-2">
                    {program.dias} dias/semana
                  </span>
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                    {program.semanas} semanas
                  </span>
                </div>
              </div>
              {activeProgram?.id === program.id ? (
                <Button variant="outline" disabled>
                  Ativo
                </Button>
              ) : (
                <Button onClick={() => handleSelectProgram(program.id)}>
                  Selecionar
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Sprint 1.4: Detalhes do programa ativo */}
        {activeProgram && (
          <Card className="mt-6">
            <h3 className="font-semibold text-lg mb-4">Plano Semanal</h3>
            <div className="space-y-4">
              {activeProgram.plano.map((dia, index) => (
                <div key={index} className="border border-[var(--color-border)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{dia.nomeDia}</h4>
                    <Button
                      onClick={() => handleStartWorkout(dia.dia)}
                      size="sm"
                    >
                      Iniciar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {dia.exercicios.map((exercicio, exIndex) => (
                      <div key={exIndex} className="text-sm text-[var(--color-muted)]">
                        {exercicio.nome} - {exercicio.series} séries × {exercicio.repeticoes}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <Navigation />
    </div>
  )
}

export default WorkoutProgramsPage
