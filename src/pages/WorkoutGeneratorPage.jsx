import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import HeaderSummary from '@components/dashboard/HeaderSummary'
import { Bot, Dumbbell, Clock, Target, Zap, Plus, Trash2, Play, ChevronRight } from 'lucide-react'

const WorkoutGeneratorPage = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
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
          { name: 'Agachamento Livre', sets: [{ set: 1, reps: '8-12' }, { set: 2, reps: '8-12' }, { set: 3, reps: '8-12' }, { set: 4, reps: '8-12' }], rest: 90, muscle: 'pernas', equipment: 'Barra de Pesos' },
          { name: 'Supino Reto', sets: [{ set: 1, reps: '8-12' }, { set: 2, reps: '8-12' }, { set: 3, reps: '8-12' }, { set: 4, reps: '8-12' }], rest: 90, muscle: 'peito', equipment: 'Barra de Pesos' },
          { name: 'Remada Curvada', sets: [{ set: 1, reps: '8-12' }, { set: 2, reps: '8-12' }, { set: 3, reps: '8-12' }, { set: 4, reps: '8-12' }], rest: 90, muscle: 'costas', equipment: 'Barra de Pesos' },
          { name: 'Desenvolvimento Militar', sets: [{ set: 1, reps: '10-12' }, { set: 2, reps: '10-12' }, { set: 3, reps: '10-12' }], rest: 60, muscle: 'ombros', equipment: 'Barra de Pesos' },
          { name: 'Rosca Direta', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 60, muscle: 'bíceps', equipment: 'Barra de Pesos' },
          { name: 'Tríceps Pulley', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 60, muscle: 'tríceps', equipment: 'Cabos' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '15-20' }, { set: 2, reps: '15-20' }, { set: 3, reps: '15-20' }, { set: 4, reps: '15-20' }], rest: 60, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço', sets: [{ set: 1, reps: '10-15' }, { set: 2, reps: '10-15' }, { set: 3, reps: '10-15' }, { set: 4, reps: '10-15' }], rest: 60, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Remada com Garrafas', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }, { set: 4, reps: '12-15' }], rest: 60, muscle: 'costas', equipment: 'Peso corporal' },
          { name: 'Elevação Lateral', sets: [{ set: 1, reps: '15-20' }, { set: 2, reps: '15-20' }, { set: 3, reps: '15-20' }], rest: 45, muscle: 'ombros', equipment: 'Peso corporal' },
          { name: 'Rosca com Garrafas', sets: [{ set: 1, reps: '15-20' }, { set: 2, reps: '15-20' }, { set: 3, reps: '15-20' }], rest: 45, muscle: 'bíceps', equipment: 'Peso corporal' },
          { name: 'Tríceps no Banco', sets: [{ set: 1, reps: '15-20' }, { set: 2, reps: '15-20' }, { set: 3, reps: '15-20' }], rest: 45, muscle: 'tríceps', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'forca') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: [{ set: 1, reps: '5' }, { set: 2, reps: '5' }, { set: 3, reps: '5' }, { set: 4, reps: '5' }, { set: 5, reps: '5' }], rest: 180, muscle: 'pernas', equipment: 'Barra de Pesos' },
          { name: 'Supino Reto', sets: [{ set: 1, reps: '5' }, { set: 2, reps: '5' }, { set: 3, reps: '5' }, { set: 4, reps: '5' }, { set: 5, reps: '5' }], rest: 180, muscle: 'peito', equipment: 'Barra de Pesos' },
          { name: 'Deadlift', sets: [{ set: 1, reps: '5' }, { set: 2, reps: '5' }, { set: 3, reps: '5' }, { set: 4, reps: '5' }, { set: 5, reps: '5' }], rest: 180, muscle: 'costas', equipment: 'Barra de Pesos' },
          { name: 'Desenvolvimento Militar', sets: [{ set: 1, reps: '6' }, { set: 2, reps: '6' }, { set: 3, reps: '6' }, { set: 4, reps: '6' }], rest: 120, muscle: 'ombros', equipment: 'Barra de Pesos' },
          { name: 'Barra Fixa', sets: [{ set: 1, reps: '6-8' }, { set: 2, reps: '6-8' }, { set: 3, reps: '6-8' }, { set: 4, reps: '6-8' }], rest: 120, muscle: 'costas', equipment: 'Peso corporal' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '20' }, { set: 2, reps: '20' }, { set: 3, reps: '20' }, { set: 4, reps: '20' }, { set: 5, reps: '20' }], rest: 90, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }, { set: 4, reps: '15' }, { set: 5, reps: '15' }], rest: 90, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Remada com Garrafas', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }, { set: 4, reps: '15' }, { set: 5, reps: '15' }], rest: 90, muscle: 'costas', equipment: 'Peso corporal' },
          { name: 'Elevação Lateral', sets: [{ set: 1, reps: '20' }, { set: 2, reps: '20' }, { set: 3, reps: '20' }, { set: 4, reps: '20' }], rest: 60, muscle: 'ombros', equipment: 'Peso corporal' },
          { name: 'Barra Fixa', sets: [{ set: 1, reps: '5-8' }, { set: 2, reps: '5-8' }, { set: 3, reps: '5-8' }, { set: 4, reps: '5-8' }], rest: 90, muscle: 'costas', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'perda_peso') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: [{ set: 1, reps: '15-20' }, { set: 2, reps: '15-20' }, { set: 3, reps: '15-20' }], rest: 60, muscle: 'pernas', equipment: 'Barra de Pesos' },
          { name: 'Supino Reto', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 60, muscle: 'peito', equipment: 'Barra de Pesos' },
          { name: 'Remada Curvada', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 60, muscle: 'costas', equipment: 'Barra de Pesos' },
          { name: 'Burpees', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'fullbody', equipment: 'Peso corporal' },
          { name: 'Mountain Climber', sets: [{ set: 1, reps: '30' }, { set: 2, reps: '30' }, { set: 3, reps: '30' }], rest: 45, muscle: 'core', equipment: 'Peso corporal' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '25' }, { set: 2, reps: '25' }, { set: 3, reps: '25' }], rest: 45, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço', sets: [{ set: 1, reps: '20' }, { set: 2, reps: '20' }, { set: 3, reps: '20' }], rest: 45, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Burpees', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'fullbody', equipment: 'Peso corporal' },
          { name: 'Mountain Climber', sets: [{ set: 1, reps: '30' }, { set: 2, reps: '30' }, { set: 3, reps: '30' }], rest: 45, muscle: 'core', equipment: 'Peso corporal' },
          { name: 'Polichinelo', sets: [{ set: 1, reps: '30' }, { set: 2, reps: '30' }, { set: 3, reps: '30' }], rest: 30, muscle: 'cardio', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'tonificacao') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento com Halteres', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 60, muscle: 'pernas', equipment: 'Halteres' },
          { name: 'Supino Inclinado', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 60, muscle: 'peito', equipment: 'Halteres' },
          { name: 'Remada Máquina', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 60, muscle: 'costas', equipment: 'Máquina' },
          { name: 'Elevação Lateral', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'ombros', equipment: 'Halteres' },
          { name: 'Rosca Scott', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 45, muscle: 'bíceps', equipment: 'Máquina' },
          { name: 'Tríceps Testa', sets: [{ set: 1, reps: '12-15' }, { set: 2, reps: '12-15' }, { set: 3, reps: '12-15' }], rest: 45, muscle: 'tríceps', equipment: 'Halteres' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '20' }, { set: 2, reps: '20' }, { set: 3, reps: '20' }], rest: 45, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Remada com Garrafas', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'costas', equipment: 'Peso corporal' },
          { name: 'Elevação Lateral', sets: [{ set: 1, reps: '20' }, { set: 2, reps: '20' }, { set: 3, reps: '20' }], rest: 30, muscle: 'ombros', equipment: 'Peso corporal' },
          { name: 'Rosca com Garrafas', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 30, muscle: 'bíceps', equipment: 'Peso corporal' },
          { name: 'Tríceps no Banco', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 30, muscle: 'tríceps', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'resistencia') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: [{ set: 1, reps: '20-25' }, { set: 2, reps: '20-25' }, { set: 3, reps: '20-25' }], rest: 45, muscle: 'pernas', equipment: 'Barra de Pesos' },
          { name: 'Supino Reto', sets: [{ set: 1, reps: '15-20' }, { set: 2, reps: '15-20' }, { set: 3, reps: '15-20' }], rest: 45, muscle: 'peito', equipment: 'Barra de Pesos' },
          { name: 'Remada Curvada', sets: [{ set: 1, reps: '15-20' }, { set: 2, reps: '15-20' }, { set: 3, reps: '15-20' }], rest: 45, muscle: 'costas', equipment: 'Barra de Pesos' },
          { name: 'Corrida na Esteira', sets: [{ set: 1, reps: '20 min' }], rest: 0, muscle: 'cardio', equipment: 'Cardio' },
          { name: 'Bicicleta Ergométrica', sets: [{ set: 1, reps: '15 min' }], rest: 0, muscle: 'cardio', equipment: 'Cardio' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '30' }, { set: 2, reps: '30' }, { set: 3, reps: '30' }], rest: 30, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço', sets: [{ set: 1, reps: '20' }, { set: 2, reps: '20' }, { set: 3, reps: '20' }], rest: 30, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Burpees', sets: [{ set: 1, reps: '20' }, { set: 2, reps: '20' }, { set: 3, reps: '20' }], rest: 30, muscle: 'fullbody', equipment: 'Peso corporal' },
          { name: 'Corrida no Lugar', sets: [{ set: 1, reps: '15 min' }], rest: 0, muscle: 'cardio', equipment: 'Peso corporal' },
          { name: 'Polichinelo', sets: [{ set: 1, reps: '30' }, { set: 2, reps: '30' }, { set: 3, reps: '30' }], rest: 30, muscle: 'cardio', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'mobilidade') {
      exercises.push(
        { name: 'Alongamento de Pernas', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }], rest: 15, muscle: 'pernas', equipment: 'Peso corporal' },
        { name: 'Alongamento de Peito', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }], rest: 15, muscle: 'peito', equipment: 'Peso corporal' },
        { name: 'Alongamento de Costas', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }], rest: 15, muscle: 'costas', equipment: 'Peso corporal' },
        { name: 'Alongamento de Ombros', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }], rest: 15, muscle: 'ombros', equipment: 'Peso corporal' },
        { name: 'Yoga Flow', sets: [{ set: 1, reps: '10 min' }], rest: 0, muscle: 'fullbody', equipment: 'Peso corporal' }
      )
    } else if (obj === 'reabilitacao') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Parcial', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 60, muscle: 'pernas', equipment: 'Máquina' },
          { name: 'Supino Máquina', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 60, muscle: 'peito', equipment: 'Máquina' },
          { name: 'Remada Máquina', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 60, muscle: 'costas', equipment: 'Máquina' },
          { name: 'Elevação Frontal', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 45, muscle: 'ombros', equipment: 'Halteres' },
          { name: 'Rosca Direta Leve', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 45, muscle: 'bíceps', equipment: 'Halteres' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 60, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço Apoiada', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 60, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Remada com Garrafas Leve', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 60, muscle: 'costas', equipment: 'Peso corporal' },
          { name: 'Elevação Lateral', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 45, muscle: 'ombros', equipment: 'Peso corporal' },
          { name: 'Rosca com Garrafas Leve', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }], rest: 45, muscle: 'bíceps', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'performance') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: [{ set: 1, reps: '3-5' }, { set: 2, reps: '3-5' }, { set: 3, reps: '3-5' }, { set: 4, reps: '3-5' }, { set: 5, reps: '3-5' }], rest: 180, muscle: 'pernas', equipment: 'Barra de Pesos' },
          { name: 'Supino Reto', sets: [{ set: 1, reps: '3-5' }, { set: 2, reps: '3-5' }, { set: 3, reps: '3-5' }, { set: 4, reps: '3-5' }, { set: 5, reps: '3-5' }], rest: 180, muscle: 'peito', equipment: 'Barra de Pesos' },
          { name: 'Deadlift', sets: [{ set: 1, reps: '3-5' }, { set: 2, reps: '3-5' }, { set: 3, reps: '3-5' }, { set: 4, reps: '3-5' }, { set: 5, reps: '3-5' }], rest: 180, muscle: 'costas', equipment: 'Barra de Pesos' },
          { name: 'Power Clean', sets: [{ set: 1, reps: '3' }, { set: 2, reps: '3' }, { set: 3, reps: '3' }, { set: 4, reps: '3' }], rest: 120, muscle: 'fullbody', equipment: 'Barra de Pesos' },
          { name: 'Snatch', sets: [{ set: 1, reps: '3' }, { set: 2, reps: '3' }, { set: 3, reps: '3' }, { set: 4, reps: '3' }], rest: 120, muscle: 'fullbody', equipment: 'Barra de Pesos' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }, { set: 3, reps: '10' }, { set: 4, reps: '10' }, { set: 5, reps: '10' }], rest: 90, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }, { set: 3, reps: '10' }, { set: 4, reps: '10' }, { set: 5, reps: '10' }], rest: 90, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Burpees', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }, { set: 3, reps: '10' }, { set: 4, reps: '10' }, { set: 5, reps: '10' }], rest: 60, muscle: 'fullbody', equipment: 'Peso corporal' },
          { name: 'Pulo Vertical', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }, { set: 3, reps: '10' }, { set: 4, reps: '10' }], rest: 60, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Sprint no Lugar', sets: [{ set: 1, reps: '20s' }, { set: 2, reps: '20s' }, { set: 3, reps: '20s' }, { set: 4, reps: '20s' }], rest: 40, muscle: 'cardio', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'manutencao') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Agachamento Livre', sets: [{ set: 1, reps: '10-12' }, { set: 2, reps: '10-12' }, { set: 3, reps: '10-12' }], rest: 90, muscle: 'pernas', equipment: 'Barra de Pesos' },
          { name: 'Supino Reto', sets: [{ set: 1, reps: '10-12' }, { set: 2, reps: '10-12' }, { set: 3, reps: '10-12' }], rest: 90, muscle: 'peito', equipment: 'Barra de Pesos' },
          { name: 'Remada Curvada', sets: [{ set: 1, reps: '10-12' }, { set: 2, reps: '10-12' }, { set: 3, reps: '10-12' }], rest: 90, muscle: 'costas', equipment: 'Barra de Pesos' },
          { name: 'Desenvolvimento Militar', sets: [{ set: 1, reps: '10-12' }, { set: 2, reps: '10-12' }, { set: 3, reps: '10-12' }], rest: 60, muscle: 'ombros', equipment: 'Barra de Pesos' },
          { name: 'Rosca Direta', sets: [{ set: 1, reps: '12' }, { set: 2, reps: '12' }, { set: 3, reps: '12' }], rest: 60, muscle: 'bíceps', equipment: 'Barra de Pesos' },
          { name: 'Tríceps Pulley', sets: [{ set: 1, reps: '12' }, { set: 2, reps: '12' }, { set: 3, reps: '12' }], rest: 60, muscle: 'tríceps', equipment: 'Cabos' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Agachamento Peso Corporal', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 60, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Flexão de Braço', sets: [{ set: 1, reps: '12' }, { set: 2, reps: '12' }, { set: 3, reps: '12' }], rest: 60, muscle: 'peito', equipment: 'Peso corporal' },
          { name: 'Remada com Garrafas', sets: [{ set: 1, reps: '12' }, { set: 2, reps: '12' }, { set: 3, reps: '12' }], rest: 60, muscle: 'costas', equipment: 'Peso corporal' },
          { name: 'Elevação Lateral', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'ombros', equipment: 'Peso corporal' },
          { name: 'Rosca com Garrafas', sets: [{ set: 1, reps: '12' }, { set: 2, reps: '12' }, { set: 3, reps: '12' }], rest: 45, muscle: 'bíceps', equipment: 'Peso corporal' },
          { name: 'Tríceps no Banco', sets: [{ set: 1, reps: '12' }, { set: 2, reps: '12' }, { set: 3, reps: '12' }], rest: 45, muscle: 'tríceps', equipment: 'Peso corporal' }
        )
      }
    } else if (obj === 'caminhada') {
      exercises.push(
        { name: 'Caminhada Rápida', sets: [{ set: 1, reps: '30 min' }], rest: 0, muscle: 'cardio', equipment: 'Cardio' },
        { name: 'Alongamento de Pernas', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }], rest: 15, muscle: 'pernas', equipment: 'Peso corporal' },
        { name: 'Alongamento de Costas', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }], rest: 15, muscle: 'costas', equipment: 'Peso corporal' }
      )
    } else if (obj === 'pedalada') {
      exercises.push(
        { name: 'Pedalada Moderada', sets: [{ set: 1, reps: '30 min' }], rest: 0, muscle: 'cardio', equipment: 'Cardio' },
        { name: 'Pedalada Intensa', sets: [{ set: 1, reps: '15 min' }], rest: 0, muscle: 'cardio', equipment: 'Cardio' },
        { name: 'Alongamento de Pernas', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }], rest: 15, muscle: 'pernas', equipment: 'Peso corporal' }
      )
    } else if (obj === 'funcional') {
      if (equip === 'academia') {
        exercises.push(
          { name: 'Burpees', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'fullbody', equipment: 'Peso corporal' },
          { name: 'Kettlebell Swing', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 60, muscle: 'fullbody', equipment: 'Kettlebells' },
          { name: 'Box Jump', sets: [{ set: 1, reps: '10' }, { set: 2, reps: '10' }, { set: 3, reps: '10' }], rest: 60, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Battle Ropes', sets: [{ set: 1, reps: '30s' }, { set: 2, reps: '30s' }, { set: 3, reps: '30s' }], rest: 45, muscle: 'fullbody', equipment: 'Cabos' },
          { name: 'Farmer Walk', sets: [{ set: 1, reps: '20m' }, { set: 2, reps: '20m' }, { set: 3, reps: '20m' }], rest: 60, muscle: 'fullbody', equipment: 'Kettlebells' }
        )
      } else if (equip === 'casa') {
        exercises.push(
          { name: 'Burpees', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'fullbody', equipment: 'Peso corporal' },
          { name: 'Mountain Climber', sets: [{ set: 1, reps: '30' }, { set: 2, reps: '30' }, { set: 3, reps: '30' }], rest: 30, muscle: 'fullbody', equipment: 'Peso corporal' },
          { name: 'Pulo Vertical', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'pernas', equipment: 'Peso corporal' },
          { name: 'Polichinelo', sets: [{ set: 1, reps: '30' }, { set: 2, reps: '30' }, { set: 3, reps: '30' }], rest: 30, muscle: 'cardio', equipment: 'Peso corporal' },
          { name: 'Agachamento com Salto', sets: [{ set: 1, reps: '15' }, { set: 2, reps: '15' }, { set: 3, reps: '15' }], rest: 45, muscle: 'pernas', equipment: 'Peso corporal' }
        )
      }
    }

    // Ajustar volume baseado na recuperação
    const recoveryMultiplier = recoveryLevel / 5
    exercises.forEach(ex => {
      // Não ajustar sets se for um array (novo formato)
      if (!Array.isArray(ex.sets)) {
        ex.sets = Math.max(1, Math.round(ex.sets * recoveryMultiplier))
      }
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
      
      // Salvar em gymai_treinos_gerados (para histórico)
      const workoutRef = push(ref(database, `gymai_treinos_gerados/${encodedKey}`))
      await set(workoutRef, generatedWorkout)
      
      // Salvar em gymai_treinos (para aparecer no menu Treinos e HomePage)
      const workoutId = `workout_${Date.now()}`
      const workoutForMenu = {
        id: workoutId,
        nome: `Treino IA - ${generatedWorkout.objective}`,
        objetivo: generatedWorkout.objective,
        equipamento: generatedWorkout.equipment,
        duracao: generatedWorkout.duration,
        exercicios: generatedWorkout.exercises,
        tipo: 'ia_generated',
        createdAt: Date.now()
      }
      await set(ref(database, `gymai_treinos/${encodedKey}/${workoutId}`), workoutForMenu)
      
      loadSavedWorkouts()
      alert('Treino salvo com sucesso!')
      
      // Redirecionar para /treinos após salvar
      navigate('/treinos')
    } catch (error) {
      console.error('Erro ao salvar treino:', error)
    }
  }

  const deleteWorkout = async (id) => {
    if (!session?.tokenKey) return

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      // Deletar de gymai_treinos_gerados
      await set(ref(database, `gymai_treinos_gerados/${encodedKey}/${id}`), null)
      // Deletar de gymai_treinos (para aparecer no menu Treinos e HomePage)
      await set(ref(database, `gymai_treinos/${encodedKey}/${id}`), null)

      setSavedWorkouts(savedWorkouts.filter(w => w.id !== id))
    } catch (error) {
      console.error('Erro ao remover treino:', error)
    }
  }

  const startSavedWorkout = (workout) => {
    // Navegar para /log-treino com os exercícios do treino salvo
    navigate('/log-treino', { state: { workoutData: workout } })
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

      <main className="container mx-auto px-4 py-8">
        <HeaderSummary showActions={false} />
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Gerador de Treino IA</h1>
          <p className="text-[var(--color-muted)]">Crie treinos personalizados com inteligência artificial</p>
        </div>

        {/* Botão para acessar o wizard */}
        <Card className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Wizard de Treino Personalizado</h3>
              <p className="text-sm text-[var(--color-muted)]">Responda algumas perguntas e receba um treino 100% personalizado para você</p>
            </div>
            <Button onClick={() => navigate('/wizard-treino')} className="flex items-center gap-2">
              Começar <ChevronRight size={16} />
            </Button>
          </div>
        </Card>

        {/* Treinos Salvos */}
        <h2 className="text-xl font-bold mb-4">Treinos Salvos</h2>
        <div className="space-y-4">
          {savedWorkouts.length === 0 ? (
            <Card>
              <p className="text-center text-[var(--color-muted)] py-8">
                Nenhum treino salvo ainda. Use o Wizard para criar seu primeiro treino.
              </p>
            </Card>
          ) : (
            savedWorkouts?.map((workout) => (
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
                  {workout.exercises?.map((ex, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-[var(--color-muted)] ml-2">
                        {ex.sets}x{ex.reps}
                      </span>
                    </div>
                  ))}
                </div>

                <Button size="sm" className="w-full mt-4" onClick={() => startSavedWorkout(workout)}>
                  <Play size={16} className="mr-2" />
                  Iniciar Treino
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
  )
}

export default WorkoutGeneratorPage
