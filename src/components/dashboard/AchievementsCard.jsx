import { useMemo, useEffect, useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { Flame, Zap, Droplets, Moon, Trophy, Rocket, Target, TrendingUp } from 'lucide-react'
import { calculateAchievements } from '@services/achievementsService'

const AchievementsCard = () => {
  const { session } = useAuth()
  const [achievementsData, setAchievementsData] = useState({
    streak: 0,
    totalTreinos: 0,
    aguaMeta: false,
    sonoMeta: false,
  })

  useEffect(() => {
    const loadAchievements = async () => {
      if (!session) return
      const data = await calculateAchievements(session.tokenKey)
      setAchievementsData(data)
    }
    loadAchievements()
  }, [session])

  const achievements = useMemo(() => [
    { 
      id: 1, 
      name: 'Sequência', 
      description: `${achievementsData.streak} dias seguidos`, 
      unlocked: achievementsData.streak >= 7, 
      icon: Flame,
      value: achievementsData.streak
    },
    { 
      id: 2, 
      name: 'Treinos', 
      description: `${achievementsData.totalTreinos} treinos`, 
      unlocked: achievementsData.totalTreinos >= 50, 
      icon: Trophy,
      value: achievementsData.totalTreinos
    },
    { 
      id: 3, 
      name: 'Hidratação', 
      description: 'Meta de água', 
      unlocked: achievementsData.aguaMeta, 
      icon: Droplets
    },
    { 
      id: 4, 
      name: 'Sono', 
      description: 'Sono perfeito', 
      unlocked: achievementsData.sonoMeta, 
      icon: Moon
    },
    { 
      id: 5, 
      name: 'Evolução', 
      description: 'Performance', 
      unlocked: false, 
      icon: Rocket
    },
    { 
      id: 6, 
      name: 'Metas', 
      description: 'Objetivos', 
      unlocked: false, 
      icon: Target
    },
    { 
      id: 7, 
      name: 'Progresso', 
      description: 'Tendência', 
      unlocked: false, 
      icon: TrendingUp
    },
  ], [achievementsData])

  return (
    <div className="premium-card">
      <h2 className="text-lg font-semibold mb-4">Conquistas</h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`
              flex-shrink-0 w-28 h-28 rounded-2xl flex flex-col items-center justify-center p-3
              ${achievement.unlocked
                ? 'bg-gradient-to-br from-[#84CC16]/20 to-[#65A30D]/20 border border-[#84CC16]/30'
                : 'bg-[#2C2C2E] opacity-40 border border-[#2C2C2E]'
              }
            `}
          >
            <div className={`mb-2 ${achievement.unlocked ? 'text-[#84CC16]' : 'text-gray-500'}`}>
              <achievement.icon size={28} />
            </div>
            <div className="text-sm font-semibold text-center leading-tight">
              {achievement.name}
            </div>
            <div className="text-xs text-center opacity-60 leading-tight">
              {achievement.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AchievementsCard
