const LastWorkoutCard = ({ workout }) => {
  if (!workout) return null

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm text-[#6e6e73] mb-3">Último treino</h3>
      <div className="flex items-center gap-3">
        {/* Ícone */}
        <div className="w-10 h-10 rounded-full bg-[#84CC16]/10 flex items-center justify-center">
          <span className="text-[#84CC16] text-xl">🏋️</span>
        </div>
        {/* Info */}
        <div className="flex-1">
          <div className="font-semibold text-white">{workout.nome}</div>
          <div className="text-xs text-[#6e6e73]">
            {formatDate(workout.completedAt)} · {formatTime(workout.completedAt)}
          </div>
        </div>
      </div>
      {/* Métricas */}
      <div className="flex gap-6 mt-4">
        <div>
          <div className="text-2xl font-bold text-[#84CC16]">{workout.kcal || 0}</div>
          <div className="text-xs text-[#6e6e73]">kcal</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#84CC16]">{workout.duration || 0}</div>
          <div className="text-xs text-[#6e6e73]">min</div>
        </div>
      </div>
    </div>
  )
}

export default LastWorkoutCard
