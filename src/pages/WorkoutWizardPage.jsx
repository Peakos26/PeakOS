import { useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { database, ref, set, remove } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'

const WorkoutWizardPage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  // Etapa 1: Objetivo (Goal)
  const [goal, setGoal] = useState('')

  // Etapa 2: Nível de Experiência (Experience Level)
  const [experienceLevel, setExperienceLevel] = useState('')

  // Etapa 3: Idade (Age)
  const [age, setAge] = useState('')

  // Etapa 4: Sexo (Gender)
  const [gender, setGender] = useState('')

  // Etapa 5: Dias por Semana (Training Days)
  const [daysPerWeek, setDaysPerWeek] = useState(3)

  // Etapa 6: Equipamentos (Equipment)
  const [equipment, setEquipment] = useState([])

  // Etapa 7: Grupos Musculares (Target Muscles)
  const [muscleGroups, setMuscleGroups] = useState([])
  
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const equipmentOptions = [
    { id: 'peso_corporal', label: 'Peso Corporal' },
    { id: 'halteres', label: 'Halteres' },
    { id: 'barra', label: 'Barra de Pesos' },
    { id: 'maquinas', label: 'Máquinas' },
    { id: 'cabos', label: 'Cabos' },
    { id: 'kettlebells', label: 'Kettlebells' },
    { id: 'bandas', label: 'Bandas Elásticas' }
  ]
  
  const goalOptions = [
    { id: 'build_muscle', label: 'Build Muscle', description: 'Hipertrofia e ganho de massa muscular' },
    { id: 'lose_weight', label: 'Lose Weight', description: 'Perda de peso e queima de gordura' },
    { id: 'get_stronger', label: 'Get Stronger', description: 'Ganho de força e potência' },
    { id: 'improve_fitness', label: 'Improve Fitness', description: 'Melhora do condicionamento físico geral' },
    { id: 'athletic_performance', label: 'Athletic Performance', description: 'Performance atlética e esportiva' },
    { id: 'general_health', label: 'General Health', description: 'Saúde geral e bem-estar' }
  ]
  
  const experienceLevelOptions = [
    {
      id: 'beginner',
      label: 'Beginner',
      description: '2-3 exercícios por músculo, 2-3 séries, 8-12 repetições'
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      description: '3-4 exercícios, 3-4 séries, 6-12 repetições'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: '4-6 exercícios, 4-5 séries, volume elevado'
    }
  ]
  
  const muscleGroupOptions = [
    // Parte Superior
    { id: 'peitoral', label: 'Peitoral', section: 'Parte Superior' },
    { id: 'costas', label: 'Costas', section: 'Parte Superior' },
    { id: 'trapezio', label: 'Trapézio', section: 'Parte Superior' },
    { id: 'ombros', label: 'Ombros', section: 'Parte Superior' },
    { id: 'biceps', label: 'Bíceps', section: 'Parte Superior' },
    { id: 'triceps', label: 'Tríceps', section: 'Parte Superior' },
    { id: 'antebraco', label: 'Antebraço', section: 'Parte Superior' },
    // Core
    { id: 'abdomen', label: 'Abdômen', section: 'Core' },
    { id: 'obliquos', label: 'Oblíquos', section: 'Core' },
    { id: 'lombar', label: 'Lombar', section: 'Core' },
    // Parte Inferior
    { id: 'quadriceps', label: 'Quadríceps', section: 'Parte Inferior' },
    { id: 'posterior_coxa', label: 'Posterior de Coxa', section: 'Parte Inferior' },
    { id: 'gluteos', label: 'Glúteos', section: 'Parte Inferior' },
    { id: 'panturrilhas', label: 'Panturrilhas', section: 'Parte Inferior' },
    { id: 'adutores', label: 'Adutores', section: 'Parte Inferior' },
    { id: 'abdutores', label: 'Abdutores', section: 'Parte Inferior' }
  ]
  
  const toggleEquipment = (id) => {
    setEquipment(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }
  
  const toggleMuscleGroup = (id) => {
    setMuscleGroups(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }
  
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return goal
      case 2:
        return experienceLevel
      case 3:
        return age && age >= 13 && age <= 80
      case 4:
        return gender
      case 5:
        return daysPerWeek >= 1 && daysPerWeek <= 7
      case 6:
        return equipment.length > 0
      case 7:
        return muscleGroups.length > 0
      default:
        return false
    }
  }
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      generateWorkout()
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const generateWorkout = () => {
    setIsGenerating(true)

    // Simular geração de treino com IA
    setTimeout(() => {
      const workout = generateWorkoutBasedOnProfile({
        goal,
        experienceLevel,
        age,
        gender,
        daysPerWeek,
        equipment,
        muscleGroups
      })

      setGeneratedWorkout(workout)
      setIsGenerating(false)
    }, 2000)
  }
  
  const generateWorkoutBasedOnProfile = (profile) => {
    // Lógica simplificada de geração de treino
    // Em produção, isso seria feito por uma IA real

    const { goal, experienceLevel, age, gender, daysPerWeek, equipment, muscleGroups } = profile

    // Determinar número de séries baseado no nível
    let setsCount = 3
    let exercisesPerMuscle = 3
    if (experienceLevel === 'beginner') {
      setsCount = 2
      exercisesPerMuscle = 2
    }
    if (experienceLevel === 'advanced') {
      setsCount = 5
      exercisesPerMuscle = 5
    }

    // Determinar reps baseado no objetivo
    let repsRange = '8-12'
    if (goal === 'lose_weight') repsRange = '15-20'
    if (goal === 'get_stronger') repsRange = '3-6'
    if (goal === 'improve_fitness' || goal === 'athletic_performance') repsRange = '12-15'

    // Determinar descanso baseado no objetivo
    let restTime = 90
    if (goal === 'lose_weight') restTime = 45
    if (goal === 'get_stronger') restTime = 180
    if (goal === 'improve_fitness' || goal === 'athletic_performance') restTime = 60

    // Algoritmo de Split inteligente
    const getSplitForDays = (days) => {
      const splits = {
        1: ['Full Body'],
        2: ['Upper', 'Lower'],
        3: ['Push', 'Pull', 'Legs'],
        4: ['Upper', 'Lower', 'Upper', 'Lower'],
        5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
        6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
        7: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Active Recovery']
      }
      return splits[days] || splits[3]
    }

    // Mapeamento de grupos musculares para splits
    const muscleToSplit = {
      peitoral: ['Push', 'Upper', 'Full Body'],
      costas: ['Pull', 'Upper', 'Full Body'],
      ombros: ['Push', 'Upper', 'Full Body'],
      triceps: ['Push', 'Upper', 'Full Body'],
      biceps: ['Pull', 'Upper', 'Full Body'],
      trapezio: ['Pull', 'Upper', 'Full Body'],
      quadriceps: ['Legs', 'Lower', 'Full Body'],
      posterior_coxa: ['Legs', 'Lower', 'Full Body'],
      gluteos: ['Legs', 'Lower', 'Full Body'],
      panturrilhas: ['Legs', 'Lower', 'Full Body'],
      abdomen: ['Full Body', 'Active Recovery'],
      obliquos: ['Full Body', 'Active Recovery'],
      lombar: ['Full Body', 'Active Recovery']
    }

    // Exercícios baseados nos grupos musculares e equipamentos
    const exercisesByMuscle = {
      peitoral: [
        { name: 'Supino Reto', equipment: ['barra', 'maquinas', 'halteres'] },
        { name: 'Supino Inclinado', equipment: ['barra', 'maquinas', 'halteres'] },
        { name: 'Crucifixo', equipment: ['maquinas', 'halteres', 'cabos'] },
        { name: 'Flexão de Braço', equipment: ['peso_corporal'] },
        { name: 'Peitoral na Máquina', equipment: ['maquinas'] },
        { name: 'Pullover', equipment: ['halteres', 'cabos'] }
      ],
      costas: [
        { name: 'Remada Curvada', equipment: ['barra', 'halteres', 'maquinas'] },
        { name: 'Puxada Alta', equipment: ['maquinas', 'cabos'] },
        { name: 'Barra Fixa', equipment: ['peso_corporal', 'barra'] },
        { name: 'Remada com Garrafas', equipment: ['peso_corporal'] },
        { name: 'Remada Unilateral', equipment: ['halteres', 'cabos'] },
        { name: 'Face Pulls', equipment: ['cabos'] }
      ],
      trapezio: [
        { name: 'Encolhimento', equipment: ['barra', 'maquinas', 'halteres'] },
        { name: 'Elevação de Ombros', equipment: ['maquinas', 'halteres'] },
        { name: 'Shrugs com Halteres', equipment: ['halteres'] }
      ],
      ombros: [
        { name: 'Desenvolvimento Militar', equipment: ['barra', 'maquinas', 'halteres'] },
        { name: 'Elevação Lateral', equipment: ['maquinas', 'halteres', 'bandas'] },
        { name: 'Elevação Frontal', equipment: ['barra', 'halteres', 'maquinas'] },
        { name: 'Elevação Lateral Unilateral', equipment: ['cabos'] },
        { name: 'Desenvolvimento com Halteres', equipment: ['halteres'] }
      ],
      biceps: [
        { name: 'Rosca Direta', equipment: ['barra', 'halteres', 'maquinas'] },
        { name: 'Rosca Scott', equipment: ['maquinas', 'halteres'] },
        { name: 'Rosca Martelo', equipment: ['halteres', 'maquinas'] },
        { name: 'Rosca Inclinada', equipment: ['halteres'] },
        { name: 'Rosca no Banco Scott', equipment: ['halteres'] }
      ],
      triceps: [
        { name: 'Tríceps Pulley', equipment: ['cabos', 'maquinas'] },
        { name: 'Tríceps Francês', equipment: ['halteres', 'barra'] },
        { name: 'Tríceps Testa', equipment: ['halteres', 'cabos'] },
        { name: 'Tríceps no Banco', equipment: ['peso_corporal'] },
        { name: 'Tríceps Corda', equipment: ['cabos'] }
      ],
      quadriceps: [
        { name: 'Agachamento Livre', equipment: ['barra', 'halteres'] },
        { name: 'Leg Press', equipment: ['maquinas'] },
        { name: 'Agachamento Peso Corporal', equipment: ['peso_corporal'] },
        { name: 'Extensão de Coxa', equipment: ['maquinas'] },
        { name: 'Agachamento Goblet', equipment: ['halteres', 'kettlebells'] },
        { name: 'Step-up', equipment: ['barra', 'halteres', 'peso_corporal'] }
      ],
      posterior_coxa: [
        { name: 'Mesa Flexora', equipment: ['maquinas'] },
        { name: 'Stiff', equipment: ['barra', 'halteres'] },
        { name: 'Cadeira Extensora', equipment: ['maquinas'] },
        { name: 'Flexora', equipment: ['maquinas'] },
        { name: 'Elevação de Quadril', equipment: ['barra', 'halteres'] }
      ],
      gluteos: [
        { name: 'Glúteos na Máquina', equipment: ['maquinas'] },
        { name: 'Hip Thrust', equipment: ['barra', 'halteres', 'peso_corporal'] },
        { name: 'Agachamento Sumô', equipment: ['barra', 'halteres', 'kettlebells'] },
        { name: 'Elevação de Glúteos', equipment: ['maquinas'] }
      ],
      panturrilhas: [
        { name: 'Elevação de Panturrilha em Pé', equipment: ['maquinas', 'peso_corporal'] },
        { name: 'Elevação de Panturrilha Sentado', equipment: ['maquinas'] },
        { name: 'Elevação de Panturrilha com Kettlebell', equipment: ['kettlebells'] }
      ],
      abdomen: [
        { name: 'Prancha', equipment: ['peso_corporal'] },
        { name: 'Crunch', equipment: ['peso_corporal', 'maquinas'] },
        { name: 'Leg Raise', equipment: ['peso_corporal', 'maquinas'] }
      ],
      obliquos: [
        { name: 'Prancha Lateral', equipment: ['peso_corporal'] },
        { name: 'Russian Twist', equipment: ['peso_corporal', 'halteres'] }
      ],
      lombar: [
        { name: 'Extensão Lombar', equipment: ['maquinas', 'peso_corporal'] },
        { name: 'Superman', equipment: ['peso_corporal'] }
      ]
    }

    // Distribuir grupos musculares pelos dias da semana baseado no split
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    const weeklyPlan = []
    const split = getSplitForDays(daysPerWeek)

    // Criar combinações de grupos musculares para cada dia baseado no split
    split.forEach((splitType, dayIndex) => {
      const dayMuscles = muscleGroups.filter(muscle =>
        muscleToSplit[muscle]?.includes(splitType)
      )

      // Se não tiver músculos para este split, usar todos os disponíveis
      if (dayMuscles.length === 0 && muscleGroups.length > 0) {
        dayMuscles.push(...muscleGroups)
      }

      const dayExercises = []

      dayMuscles.forEach(muscle => {
        const availableExercises = exercisesByMuscle[muscle] || []
        const compatibleExercises = availableExercises.filter(ex =>
          ex.equipment && ex.equipment.some(eq => equipment.includes(eq))
        )

        if (compatibleExercises.length > 0) {
          // Selecionar exercícios diferentes para cada dia
          const exerciseIndex = dayIndex % compatibleExercises.length
          const selectedExercise = compatibleExercises[exerciseIndex]

          // Adicionar cardio no início e fim se for objetivo de perda de peso
          if (goal === 'lose_weight' || goal === 'improve_fitness') {
            dayExercises.push({
              name: 'Caminhada na Esteira',
              sets: [{ set: 1, reps: '10-min' }],
              rest: 0,
              muscle: 'cardio',
              equipment: 'Cardio'
            })
          }

          dayExercises.push({
            name: selectedExercise.name,
            sets: Array.from({ length: setsCount }, (_, i) => ({ set: i + 1, reps: repsRange })),
            rest: restTime,
            muscle: muscle,
            equipment: selectedExercise.equipment.find(eq => equipment.includes(eq)) || 'Peso corporal'
          })
        }
      })

      // Adicionar cardio no fim se for objetivo de perda de peso
      if ((goal === 'lose_weight' || goal === 'improve_fitness') && dayExercises.length > 0) {
        dayExercises.push({
          name: 'Caminhada na Esteira',
          sets: [{ set: 1, reps: '10-min' }],
          rest: 0,
          muscle: 'cardio',
          equipment: 'Cardio'
        })
      }

      weeklyPlan.push({
        day: daysOfWeek[dayIndex],
        dayNumber: dayIndex + 1,
        totalDays: daysPerWeek,
        splitType: splitType,
        exercises: dayExercises
      })
    })

    return {
      profile,
      weeklyPlan,
      split,
      estimatedDuration: weeklyPlan.reduce((total, day) => total + day.exercises.length * 5, 0),
      observations: generateObservations(goal, experienceLevel)
    }
  }
  
  const generateObservations = (goal, level) => {
    const observations = []

    if (goal === 'build_muscle') {
      observations.push('Aumente a carga quando atingir o limite superior das repetições mantendo a execução correta.')
      observations.push('Priorize a progressão de carga para maximizar a hipertrofia.')
    }

    if (goal === 'lose_weight') {
      observations.push('Mantenha o ritmo elevado para maximizar o gasto calórico.')
      observations.push('Descanso curto entre séries para manter a frequência cardíaca elevada.')
      observations.push('Combine com dieta adequada para melhores resultados.')
    }

    if (goal === 'get_stronger') {
      observations.push('Priorize a progressão de carga em vez de aumentar o número de repetições.')
      observations.push('Descanso adequado é essencial para recuperação entre séries pesadas.')
      observations.push('Foque em força bruta antes de hipertrofia.')
    }

    if (goal === 'improve_fitness' || goal === 'athletic_performance') {
      observations.push('Mantenha a constância nos treinos para melhorar o condicionamento.')
      observations.push('Combine treinos de força com cardio para melhor performance.')
    }

    if (level === 'beginner') {
      observations.push('Foque na técnica correta antes de aumentar a carga.')
      observations.push('Comece com cargas leves e aumente gradualmente.')
    }

    if (level === 'advanced') {
      observations.push('Considere técnicas avançadas como drop sets ou supersets.')
      observations.push('Periodize seu treino para evitar platôs.')
    }

    return observations
  }
  
  const saveWorkout = () => {
    // Salvar o plano semanal no Firebase
    if (!session?.tokenKey || !generatedWorkout) return

    try {
      const encodeTokenKey = (tokenKey) => tokenKey.replace(/[.#$\[\]]/g, '_')

      const encodedKey = encodeTokenKey(session.tokenKey)
      const planData = {
        ...generatedWorkout,
        createdAt: new Date().toISOString(),
        tipo: 'wizard_generated'
      }

      // Limpar plano existente antes de salvar o novo
      remove(ref(database, `gymai_plano_semanal/${encodedKey}`))
        .then(() => {
          // Salvar o novo plano
          return set(ref(database, `gymai_plano_semanal/${encodedKey}`), planData)
        })
        .then(() => {
          alert('Plano semanal salvo com sucesso!')
          navigate('/treinos')
        })
        .catch((error) => {
          console.error('Erro ao salvar plano semanal:', error)
          alert('Erro ao salvar plano semanal')
        })
    } catch (error) {
      console.error('Erro ao salvar plano semanal:', error)
      alert('Erro ao salvar plano semanal')
    }
  }
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Qual seu objetivo?</label>
            <div className="space-y-2">
              {goalOptions.map(opt => (
                <label key={opt.id} className="flex items-start gap-2 cursor-pointer p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]">
                  <input
                    type="radio"
                    name="goal"
                    value={opt.id}
                    checked={goal === opt.id}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-[var(--color-muted)]">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Qual seu nível de experiência?</label>
            <div className="space-y-3">
              {experienceLevelOptions.map(opt => (
                <label key={opt.id} className="flex items-start gap-2 cursor-pointer p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={opt.id}
                    checked={experienceLevel === opt.id}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-[var(--color-muted)]">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Qual sua idade?</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Digite sua idade"
                min={13}
                max={80}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">Entre 13 e 80 anos</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Qual seu sexo?</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Female</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]">
                <input
                  type="radio"
                  name="gender"
                  value="prefer_not_say"
                  checked={gender === 'prefer_not_say'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Prefer not to say</span>
              </label>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Quantos dias por semana pretende treinar?</label>
            <p className="text-sm text-[var(--color-muted)] mb-4">O split será gerado automaticamente baseado no número de dias</p>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map(days => (
                <label key={days} className="flex items-center gap-2 cursor-pointer p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]">
                  <input
                    type="radio"
                    name="daysPerWeek"
                    value={days}
                    checked={daysPerWeek === days}
                    onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">{days} dia{days !== 1 ? 's' : ''}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Quais equipamentos você tem disponível?</label>
            <p className="text-sm text-[var(--color-muted)] mb-4">Selecione todos que se aplicam</p>
            <div className="grid grid-cols-2 gap-3">
              {equipmentOptions.map(opt => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)]">
                  <input
                    type="checkbox"
                    checked={equipment.includes(opt.id)}
                    onChange={() => toggleEquipment(opt.id)}
                    className="w-4 h-4"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Quais grupos musculares você deseja trabalhar?</label>
            <p className="text-sm text-[var(--color-muted)] mb-4">Selecione todos que se aplicam</p>

            {['Parte Superior', 'Core', 'Parte Inferior'].map(section => (
              <div key={section} className="mb-4">
                <h3 className="font-medium mb-2">{section}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {muscleGroupOptions
                    .filter(m => m.section === section)
                    .map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-border)]">
                        <input
                          type="checkbox"
                          checked={muscleGroups.includes(opt.id)}
                          onChange={() => toggleMuscleGroup(opt.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }
  
  const renderGeneratedWorkout = () => {
    if (!generatedWorkout) return null

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Plano Semanal Gerado!</h2>
          <p className="text-[var(--color-muted)]">Baseado no seu perfil personalizado com {generatedWorkout.profile.daysPerWeek} dias por semana</p>
          <div className="mt-2">
            <span className="inline-block bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
              Split: {generatedWorkout.split.join(' / ')}
            </span>
          </div>
        </div>

        {generatedWorkout.weeklyPlan.map((day, dayIndex) => (
          <Card key={dayIndex}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg">{day.day}</h3>
                <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">{day.splitType}</span>
              </div>
              <span className="text-sm text-[var(--color-muted)]">Dia {day.dayNumber} de {day.totalDays}</span>
            </div>
            <div className="text-sm text-[var(--color-muted)] mb-4">
              {day.exercises.length} exercícios
            </div>
            <div className="space-y-3">
              {day.exercises.map((ex, index) => (
                <div key={index} className="p-3 bg-[var(--color-border)] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{ex.name}</h4>
                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">{ex.equipment}</span>
                  </div>
                  <div className="text-sm text-[var(--color-muted)] mb-2">
                    Grupo muscular: {ex.muscle}
                  </div>
                  <div className="space-y-1">
                    {Array.isArray(ex.sets) && ex.sets.map((set, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>Série {set.set}</span>
                        <span className="font-medium">{set.reps}</span>
                      </div>
                    ))}
                  </div>
                  {ex.rest > 0 && (
                    <div className="text-sm text-[var(--color-muted)] mt-2">
                      Descanso: {ex.rest}s
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Card>
          <h3 className="font-semibold mb-4">Observações</h3>
          <ul className="space-y-2">
            {generatedWorkout.observations.map((obs, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-primary-600 mt-0.5" />
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-[var(--color-muted)]">Duração estimada por dia</div>
              <div className="text-xl font-bold">{Math.round(generatedWorkout.estimatedDuration / generatedWorkout.profile.daysPerWeek)} minutos</div>
            </div>
            <Button onClick={saveWorkout}>
              Salvar Plano
            </Button>
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display mb-2">Gerador de Treino Personalizado</h1>
      <p className="text-[var(--color-muted)] mb-8">Crie um treino adaptado ao seu perfil</p>
      
      {!generatedWorkout ? (
        <Card>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Etapa {currentStep} de {totalSteps}</span>
              <span className="text-sm text-[var(--color-muted)]">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-[var(--color-border)] rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {currentStep === totalSteps ? 'Gerar Treino' : 'Próximo'}
              <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      ) : (
        renderGeneratedWorkout()
      )}
    </main>
  )
}

export default WorkoutWizardPage
