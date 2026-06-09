import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import HeaderSummary from '@components/dashboard/HeaderSummary'
import WorkoutStory from '@components/workout/WorkoutStory'
import AchievementBadge from '@components/achievements/AchievementBadge'
import CoachInsights from '@components/workout/CoachInsights'
import LastWorkoutCard from '@components/workout/LastWorkoutCard'
import MusicSection from '@components/workout/MusicSection'
import { database, ref, get } from '@config/firebase.config'

const ACHIEVEMENTS = [
  { id: 'streak_7',    icon: '7',  label: '7 dias\nconsecutivos', color: '#c8f04a', type: 'streak' },
  { id: 'calories',   icon: '🔥', label: 'Meta de\ncalorias',    color: '#fb923c', type: 'calories' },
  { id: 'water',      icon: '💧', label: 'Meta de\nágua',        color: '#60a5fa', type: 'water' },
  { id: 'workouts_50',icon: '50', label: '50 treinos',           color: '#a855f7', type: 'workouts' },
  { id: 'performance',icon: '⚡', label: 'Performance',          color: '#eab308', type: 'performance' },
  { id: 'frequency',  icon: '❤️', label: 'Frequência',           color: '#ef4444', type: 'frequency' },
  { id: 'sleep',      icon: '🌙', label: 'Sono',                 color: '#8b5cf6', type: 'sleep' },
  { id: 'focus',      icon: '🎯', label: 'Foco',                 color: '#06b6d4', type: 'focus' },
]

const TaFeitoPage = () => {
  const { session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(location.state?.workout || null)
  const [unlockedAchievements, setUnlockedAchievements] = useState([])

  useEffect(() => {
    // Carregar último treino se não foi passado via state
    if (!workout && session) {
      loadLastWorkout()
    }
    
    // Carregar conquistas desbloqueadas
    if (session) {
      loadAchievements()
    }
  }, [session])

  const loadLastWorkout = async () => {
    try {
      const encodedKey = session.tokenKey.replace(/[.#$\[\]]/g, '_')
      const logsRef = ref(database, `gymai_log/${encodedKey}`)
      const snapshot = await get(logsRef)
      
      if (snapshot.exists()) {
        const logs = snapshot.val()
        const logArray = Object.values(logs).flat()
        const lastLog = logArray[logArray.length - 1]
        setWorkout(lastLog)
      }
    } catch (error) {
      console.error('Erro ao carregar último treino:', error)
    }
  }

  const loadAchievements = async () => {
    try {
      const encodedKey = session.tokenKey.replace(/[.#$\[\]]/g, '_')
      const rewardsRef = ref(database, `gymai_rewards/${encodedKey}`)
      const snapshot = await get(rewardsRef)
      
      if (snapshot.exists()) {
        const rewards = snapshot.val()
        setUnlockedAchievements(rewards.achievements || [])
      } else {
        // Mock de conquistas para demonstração
        setUnlockedAchievements(['streak_7', 'calories', 'workouts_50'])
      }
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error)
      // Mock de conquistas para demonstração
      setUnlockedAchievements(['streak_7', 'calories', 'workouts_50'])
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <HeaderSummary showActions={false} />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">🎉 Tá Feito!</h1>
        <p className="text-[#6e6e73]">Treino Concluído</p>
      </div>

      {/* Seção 1: Story do Treino */}
      <div className="mb-6">
        <WorkoutStory workout={workout} />
      </div>

      {/* Seção 2: Conquistas */}
      <div className="card p-4 mb-6">
        <h3 className="text-sm text-[#6e6e73] mb-4">🏆 Conquistas</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {ACHIEVEMENTS.filter(ach => unlockedAchievements.includes(ach.id)).map(achievement => (
            <AchievementBadge
              key={achievement.id}
              icon={achievement.icon}
              label={achievement.label}
              color={achievement.color}
              value={achievement.value}
            />
          ))}
        </div>
      </div>

      {/* Seção 3: Insights do Coach IA */}
      <div className="mb-6">
        <CoachInsights />
      </div>

      {/* Seção 4: Último Treino */}
      <div className="mb-6">
        <LastWorkoutCard workout={workout} />
      </div>

      {/* Seção 5: Músicas para Treino */}
      <div className="mb-6">
        <MusicSection />
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white font-medium py-4 rounded-xl transition-colors"
      >
        Voltar ao Início
      </button>
    </main>
  )
}

export default TaFeitoPage
