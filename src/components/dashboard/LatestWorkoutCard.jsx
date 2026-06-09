import { useMemo } from 'react'
import { Clock, Flame, Target } from 'lucide-react'

const LatestWorkoutCard = () => {
  // Dados mockados - em produção viriam do Firebase
  const workout = useMemo(() => ({
    name: 'Costas e Bíceps',
    calories: 398,
    duration: 65,
    date: 'Segunda-feira',
    goal: 'Hipertrofia'
  }), [])

  return (
    <div className="premium-card">
      <h2 className="text-lg font-semibold mb-4">Último Treino</h2>

      <div className="space-y-4">
        {/* Nome e Data */}
        <div>
          <div className="text-xl font-bold">{workout.name}</div>
          <div className="text-xs opacity-60">{workout.date}</div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#2C2C2E]">
            <Flame size={20} className="text-[#ff2d55] mb-1" />
            <div className="text-lg font-bold">{workout.calories}</div>
            <div className="text-xs opacity-60">kcal</div>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#2C2C2E]">
            <Clock size={20} className="text-[#0a84ff] mb-1" />
            <div className="text-lg font-bold">{workout.duration}</div>
            <div className="text-xs opacity-60">min</div>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#2C2C2E]">
            <Target size={20} className="text-[#84CC16] mb-1" />
            <div className="text-sm font-bold text-center">{workout.goal}</div>
            <div className="text-xs opacity-60">Objetivo</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LatestWorkoutCard
