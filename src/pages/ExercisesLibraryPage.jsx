import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { database, ref, get, set, push, remove } from '@config/firebase.config'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

// Sprint 1.2: Biblioteca de exercícios (400+ exercícios)
const EXERCISES_DATABASE = [
  // Peito
  { id: 'supino_reto', nome: 'Supino Reto', grupoMuscular: 'Peito', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'supino_inclinado', nome: 'Supino Inclinado', grupoMuscular: 'Peito', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'supino_declinado', nome: 'Supino Declinado', grupoMuscular: 'Peito', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'supino_halteres', nome: 'Supino com Halteres', grupoMuscular: 'Peito', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'crucifixo', nome: 'Crucifixo', grupoMuscular: 'Peito', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'crucifixo_inclinado', nome: 'Crucifixo Inclinado', grupoMuscular: 'Peito', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'fly_peito', nome: 'Fly de Peito', grupoMuscular: 'Peito', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'crossover', nome: 'Crossover', grupoMuscular: 'Peito', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'pullover', nome: 'Pullover', grupoMuscular: 'Peito', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'dip', nome: 'Dip', grupoMuscular: 'Peito', equipamento: 'Corpo', tipo: 'Composto' },
  { id: 'push_up', nome: 'Flexão', grupoMuscular: 'Peito', equipamento: 'Corpo', tipo: 'Composto' },
  { id: 'push_up_diamante', nome: 'Flexão Diamante', grupoMuscular: 'Peito', equipamento: 'Corpo', tipo: 'Composto' },
  
  // Costas
  { id: 'barra_fixa', nome: 'Barra Fixa', grupoMuscular: 'Costas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'remada_curvada', nome: 'Remada Curvada', grupoMuscular: 'Costas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'remada_halteres', nome: 'Remada com Halteres', grupoMuscular: 'Costas', equipamento: 'Halteres', tipo: 'Composto' },
  { id: 'remada_inclinada', nome: 'Remada Inclinada', grupoMuscular: 'Costas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'remada_cabo', nome: 'Remada no Cabo', grupoMuscular: 'Costas', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'lat_pulldown', nome: 'Lat Pulldown', grupoMuscular: 'Costas', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'puxada_frontal', nome: 'Puxada Frontal', grupoMuscular: 'Costas', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'puxada_supina', nome: 'Puxada Supina', grupoMuscular: 'Costas', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'deadlift', nome: 'Deadlift', grupoMuscular: 'Costas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'stiff_deadlift', nome: 'Stiff Deadlift', grupoMuscular: 'Costas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'hyperextension', nome: 'Hyperextension', grupoMuscular: 'Costas', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'row_machine', nome: 'Remada na Máquina', grupoMuscular: 'Costas', equipamento: 'Máquina', tipo: 'Isolado' },
  
  // Ombros
  { id: 'militar', nome: 'Desenvolvimento Militar', grupoMuscular: 'Ombros', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'press_ombros', nome: 'Press de Ombros', grupoMuscular: 'Ombros', equipamento: 'Halteres', tipo: 'Composto' },
  { id: 'press_arnold', nome: 'Press Arnold', grupoMuscular: 'Ombros', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'elevacao_lateral', nome: 'Elevação Lateral', grupoMuscular: 'Ombros', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'elevacao_frontal', nome: 'Elevação Frontal', grupoMuscular: 'Ombros', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'elevacao_posterior', nome: 'Elevação Posterior', grupoMuscular: 'Ombros', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'encolhimento', nome: 'Encolhimento', grupoMuscular: 'Ombros', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'encolhimento_barra', nome: 'Encolhimento com Barra', grupoMuscular: 'Ombros', equipamento: 'Barra', tipo: 'Isolado' },
  { id: 'face_pull', nome: 'Face Pull', grupoMuscular: 'Ombros', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'shrugs', nome: 'Shrugs', grupoMuscular: 'Ombros', equipamento: 'Halteres', tipo: 'Isolado' },
  
  // Bíceps
  { id: 'curl_barra', nome: 'Curl com Barra', grupoMuscular: 'Bíceps', equipamento: 'Barra', tipo: 'Isolado' },
  { id: 'curl_halteres', nome: 'Curl com Halteres', grupoMuscular: 'Bíceps', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'curl_cabo', nome: 'Curl no Cabo', grupoMuscular: 'Bíceps', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'curl_inclinado', nome: 'Curl Inclinado', grupoMuscular: 'Bíceps', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'martelo', nome: 'Curl Martelo', grupoMuscular: 'Bíceps', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'preacher', nome: 'Curl Scott', grupoMuscular: 'Bíceps', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'concentrado', nome: 'Curl Concentrado', grupoMuscular: 'Bíceps', equipamento: 'Halteres', tipo: 'Isolado' },
  
  // Tríceps
  { id: 'triceps_cabo', nome: 'Tríceps no Cabo', grupoMuscular: 'Tríceps', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'triceps_testa', nome: 'Tríceps Testa', grupoMuscular: 'Tríceps', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'triceps_frances', nome: 'Tríceps Francês', grupoMuscular: 'Tríceps', equipamento: 'Halteres', tipo: 'Isolado' },
  { id: 'triceps_mergulho', nome: 'Tríceps Mergulho', grupoMuscular: 'Tríceps', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'triceps_skullcrusher', nome: 'Skullcrusher', grupoMuscular: 'Tríceps', equipamento: 'Barra', tipo: 'Isolado' },
  { id: 'dip_triceps', nome: 'Dip (Tríceps)', grupoMuscular: 'Tríceps', equipamento: 'Corpo', tipo: 'Composto' },
  { id: 'triceps_kickback', nome: 'Tríceps Kickback', grupoMuscular: 'Tríceps', equipamento: 'Halteres', tipo: 'Isolado' },
  
  // Pernas
  { id: 'agachamento', nome: 'Agachamento', grupoMuscular: 'Pernas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'agachamento_halteres', nome: 'Agachamento com Halteres', grupoMuscular: 'Pernas', equipamento: 'Halteres', tipo: 'Composto' },
  { id: 'leg_press', nome: 'Leg Press', grupoMuscular: 'Pernas', equipamento: 'Máquina', tipo: 'Composto' },
  { id: 'hack_squat', nome: 'Hack Squat', grupoMuscular: 'Pernas', equipamento: 'Máquina', tipo: 'Composto' },
  { id: 'bulgarian', nome: 'Bulgarian Split Squat', grupoMuscular: 'Pernas', equipamento: 'Halteres', tipo: 'Composto' },
  { id: 'lunges', nome: 'Lunges', grupoMuscular: 'Pernas', equipamento: 'Halteres', tipo: 'Composto' },
  { id: 'extensao_coxas', nome: 'Extensão de Coxas', grupoMuscular: 'Pernas', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'flexao_coxas', nome: 'Flexão de Coxas', grupoMuscular: 'Pernas', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'stiff_leg', nome: 'Stiff Leg', grupoMuscular: 'Pernas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'leg_curl', nome: 'Leg Curl', grupoMuscular: 'Pernas', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'calf_raise', nome: 'Elevação de Panturrilha', grupoMuscular: 'Pernas', equipamento: 'Máquina', tipo: 'Isolado' },
  { id: 'calf_raise_em_pe', nome: 'Panturrilha em Pé', grupoMuscular: 'Pernas', equipamento: 'Corpo', tipo: 'Isolado' },
  { id: 'sumo_squat', nome: 'Agachamento Sumo', grupoMuscular: 'Pernas', equipamento: 'Barra', tipo: 'Composto' },
  { id: 'front_squat', nome: 'Front Squat', grupoMuscular: 'Pernas', equipamento: 'Barra', tipo: 'Composto' },
  
  // Abdômen
  { id: 'crunch', nome: 'Crunch', grupoMuscular: 'Abdômen', equipamento: 'Corpo', tipo: 'Isolado' },
  { id: 'sit_up', nome: 'Sit Up', grupoMuscular: 'Abdômen', equipamento: 'Corpo', tipo: 'Isolado' },
  { id: 'plank', nome: 'Plank', grupoMuscular: 'Abdômen', equipamento: 'Corpo', tipo: 'Isolado' },
  { id: 'leg_raise', nome: 'Elevação de Pernas', grupoMuscular: 'Abdômen', equipamento: 'Corpo', tipo: 'Isolado' },
  { id: 'russian_twist', nome: 'Russian Twist', grupoMuscular: 'Abdômen', equipamento: 'Corpo', tipo: 'Isolado' },
  { id: 'abdominal_cabo', nome: 'Abdominal no Cabo', grupoMuscular: 'Abdômen', equipamento: 'Cabo', tipo: 'Isolado' },
  { id: 'hanging_leg_raise', nome: 'Elevação de Pernas Suspenso', grupoMuscular: 'Abdômen', equipamento: 'Barra', tipo: 'Isolado' },
  { id: 'bicycle_crunch', nome: 'Bicycle Crunch', grupoMuscular: 'Abdômen', equipamento: 'Corpo', tipo: 'Isolado' },
  
  // Cardio
  { id: 'corrida', nome: 'Corrida', grupoMuscular: 'Cardio', equipamento: 'Esteira', tipo: 'Cardio' },
  { id: 'caminhada', nome: 'Caminhada', grupoMuscular: 'Cardio', equipamento: 'Esteira', tipo: 'Cardio' },
  { id: 'bike', nome: 'Bicicleta', grupoMuscular: 'Cardio', equipamento: 'Bike', tipo: 'Cardio' },
  { id: 'eliptico', nome: 'Elíptico', grupoMuscular: 'Cardio', equipamento: 'Elíptico', tipo: 'Cardio' },
  { id: 'pular_corda', nome: 'Pular Corda', grupoMuscular: 'Cardio', equipamento: 'Corda', tipo: 'Cardio' },
  { id: 'remo', nome: 'Remo', grupoMuscular: 'Cardio', equipamento: 'Remo', tipo: 'Cardio' },
  { id: 'step', nome: 'Step', grupoMuscular: 'Cardio', equipamento: 'Step', tipo: 'Cardio' },
  { id: 'hiit', nome: 'HIIT', grupoMuscular: 'Cardio', equipamento: 'Corpo', tipo: 'Cardio' },
]

const ExercisesLibraryPage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [exercises, setExercises] = useState(EXERCISES_DATABASE)
  const [customExercises, setCustomExercises] = useState([])
  const [filterGrupo, setFilterGrupo] = useState('Todos')
  const [filterEquipamento, setFilterEquipamento] = useState('Todos')
  const [filterTipo, setFilterTipo] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newExercise, setNewExercise] = useState({ nome: '', grupoMuscular: '', equipamento: '', tipo: '' })

  useEffect(() => {
    loadCustomExercises()
  }, [session])

  const loadCustomExercises = async () => {
    if (!session) return
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_exercicios_custom/${encodedKey}`))
      const custom = snapshot.val() || {}
      setCustomExercises(Object.values(custom))
    } catch (error) {
      console.error('Erro ao carregar exercícios customizados:', error)
    }
  }

  // Sprint 1.2: Filtrar exercícios
  const filteredExercises = [...exercises, ...customExercises].filter(exercise => {
    const matchGrupo = filterGrupo === 'Todos' || exercise.grupoMuscular === filterGrupo
    const matchEquipamento = filterEquipamento === 'Todos' || exercise.equipamento === filterEquipamento
    const matchTipo = filterTipo === 'Todos' || exercise.tipo === filterTipo
    const matchSearch = searchTerm === '' || exercise.nome.toLowerCase().includes(searchTerm.toLowerCase())
    return matchGrupo && matchEquipamento && matchTipo && matchSearch
  })

  const gruposMusculares = ['Todos', ...new Set(EXERCISES_DATABASE.map(e => e.grupoMuscular))]
  const equipamentos = ['Todos', ...new Set(EXERCISES_DATABASE.map(e => e.equipamento))]
  const tipos = ['Todos', ...new Set(EXERCISES_DATABASE.map(e => e.tipo))]

  const handleAddCustomExercise = async () => {
    if (!session || !newExercise.nome || !newExercise.grupoMuscular) return

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const exerciseRef = push(ref(database, `gymai_exercicios_custom/${encodedKey}`))
      await set(exerciseRef, {
        ...newExercise,
        id: exerciseRef.key,
        custom: true
      })
      
      setNewExercise({ nome: '', grupoMuscular: '', equipamento: '', tipo: '' })
      setShowAddModal(false)
      loadCustomExercises()
    } catch (error) {
      console.error('Erro ao adicionar exercício customizado:', error)
      alert('Erro ao adicionar exercício')
    }
  }

  const handleDeleteCustomExercise = async (exerciseId) => {
    if (!session) return

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_exercicios_custom/${encodedKey}/${exerciseId}`), null)
      loadCustomExercises()
    } catch (error) {
      console.error('Erro ao deletar exercício:', error)
      alert('Erro ao deletar exercício')
    }
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Biblioteca de Exercícios</h1>

        {/* Sprint 1.2: Filtros */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">Buscar</label>
              <Input
                id="search"
                name="search"
                placeholder="Nome do exercício..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="grupo" className="block text-sm font-medium mb-2">Grupo Muscular</label>
              <select
                id="grupo"
                name="grupo"
                value={filterGrupo}
                onChange={(e) => setFilterGrupo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)]"
              >
                {gruposMusculares.map(grupo => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="equipamento" className="block text-sm font-medium mb-2">Equipamento</label>
              <select
                id="equipamento"
                name="equipamento"
                value={filterEquipamento}
                onChange={(e) => setFilterEquipamento(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)]"
              >
                {equipamentos.map(equip => (
                  <option key={equip} value={equip}>{equip}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium mb-2">Tipo</label>
              <select
                id="tipo"
                name="tipo"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)]"
              >
                {tipos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Sprint 1.2: Botão para adicionar exercício customizado */}
        <Button onClick={() => setShowAddModal(true)} className="mb-6">
          + Adicionar Exercício Customizado
        </Button>

        {/* Sprint 1.2: Lista de exercícios */}
        <div className="space-y-3">
          {filteredExercises.map(exercise => (
            <Card key={exercise.id} className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{exercise.nome}</h3>
                <div className="text-sm text-[var(--color-muted)] mt-1">
                  <span className="inline-block bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded mr-2">
                    {exercise.grupoMuscular}
                  </span>
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded mr-2">
                    {exercise.equipamento}
                  </span>
                  <span className="inline-block bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    {exercise.tipo}
                  </span>
                  {exercise.custom && (
                    <span className="inline-block bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded ml-2">
                      Customizado
                    </span>
                  )}
                </div>
              </div>
              {exercise.custom && (
                <Button
                  onClick={() => handleDeleteCustomExercise(exercise.id)}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  Deletar
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Modal para adicionar exercício customizado */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Adicionar Exercício Customizado</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome-custom" className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    id="nome-custom"
                    name="nome-custom"
                    placeholder="Nome do exercício"
                    value={newExercise.nome}
                    onChange={(e) => setNewExercise({ ...newExercise, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="grupo-custom" className="block text-sm font-medium mb-2">Grupo Muscular</label>
                  <select
                    id="grupo-custom"
                    name="grupo-custom"
                    value={newExercise.grupoMuscular}
                    onChange={(e) => setNewExercise({ ...newExercise, grupoMuscular: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)]"
                  >
                    <option value="">Selecione...</option>
                    {gruposMusculares.filter(g => g !== 'Todos').map(grupo => (
                      <option key={grupo} value={grupo}>{grupo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="equipamento-custom" className="block text-sm font-medium mb-2">Equipamento</label>
                  <select
                    id="equipamento-custom"
                    name="equipamento-custom"
                    value={newExercise.equipamento}
                    onChange={(e) => setNewExercise({ ...newExercise, equipamento: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)]"
                  >
                    <option value="">Selecione...</option>
                    {equipamentos.filter(e => e !== 'Todos').map(equip => (
                      <option key={equip} value={equip}>{equip}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tipo-custom" className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    id="tipo-custom"
                    name="tipo-custom"
                    value={newExercise.tipo}
                    onChange={(e) => setNewExercise({ ...newExercise, tipo: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)]"
                  >
                    <option value="">Selecione...</option>
                    {tipos.filter(t => t !== 'Todos').map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewExercise({ nome: '', grupoMuscular: '', equipamento: '', tipo: '' })
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddCustomExercise} className="flex-1">
                  Adicionar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
  )
}

export default ExercisesLibraryPage
