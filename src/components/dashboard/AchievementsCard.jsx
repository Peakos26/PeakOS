import { useMemo } from 'react'
import { Flame, Zap, Droplets, Moon, Trophy, Rocket, Target, TrendingUp } from 'lucide-react'

const AchievementsCard = () => {
  // Dados mockados - em produção viriam do Firebase
  const achievements = useMemo(() => [
    { id: 1, name: 'Sequência', description: '7 dias seguidos', unlocked: true, icon: Flame },
    { id: 2, name: 'Performance', description: 'Meta de calorias', unlocked: true, icon: Zap },
    { id: 3, name: 'Hidratação', description: 'Meta de água', unlocked: true, icon: Droplets },
    { id: 4, name: 'Treinos', description: '50 treinos', unlocked: true, icon: Trophy },
    { id: 5, name: 'Sono', description: 'Sono perfeito', unlocked: false, icon: Moon },
    { id: 6, name: 'Evolução', description: 'Performance', unlocked: false, icon: Rocket },
    { id: 7, name: 'Metas', description: 'Objetivos', unlocked: false, icon: Target },
    { id: 8, name: 'Progresso', description: 'Tendência', unlocked: false, icon: TrendingUp },
  ], [])

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
