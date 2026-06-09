import { useMemo } from 'react'

const TodayCard = () => {
  // Dados mockados - em produção viriam do Firebase
  const metrics = useMemo(() => [
    { label: 'Calorias', value: '850', goal: '2200', unit: 'kcal', progress: 39 },
    { label: 'Passos', value: '6877', goal: '10000', unit: '', progress: 69 },
    { label: 'Água', value: '2.4', goal: '3.0', unit: 'L', progress: 80 },
    { label: 'Sono', value: '7h12', goal: '8h', unit: '', progress: 90 },
  ], [])

  return (
    <div className="premium-card">
      <h2 className="text-lg font-semibold mb-4">Hoje</h2>
      
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-xs opacity-60">{metric.label}</div>
              <div className="text-xs opacity-40">{metric.goal} {metric.unit} meta</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold opacity-80">{metric.progress}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodayCard
