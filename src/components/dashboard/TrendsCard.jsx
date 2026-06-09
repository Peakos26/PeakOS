import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const Sparkline = ({ data, color, height = 40 }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full h-full"
      style={{ height: `${height}px` }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

const TrendsCard = () => {
  // Dados mockados - em produção viriam do Firebase
  const trends = useMemo(() => [
    {
      label: 'Movimento',
      value: '+12%',
      positive: true,
      data: [65, 72, 68, 75, 80, 78, 85],
      color: '#ff2d55'
    },
    {
      label: 'Exercício',
      value: '+8%',
      positive: true,
      data: [45, 50, 48, 55, 52, 58, 60],
      color: '#30d158'
    },
    {
      label: 'Água',
      value: '+15%',
      positive: true,
      data: [2.0, 2.2, 2.1, 2.4, 2.3, 2.5, 2.6],
      color: '#0a84ff'
    },
    {
      label: 'Peso',
      value: '-1.2kg',
      positive: true,
      data: [82, 81.8, 81.5, 81.2, 81.0, 80.8, 80.5],
      color: '#ff9f0a'
    },
    {
      label: 'Sono',
      value: '+6%',
      positive: true,
      data: [6.5, 6.8, 7.0, 6.7, 7.2, 7.5, 7.8],
      color: '#64d2ff'
    },
  ], [])

  return (
    <div className="premium-card">
      <h2 className="text-lg font-semibold mb-2">Tendências</h2>
      <p className="text-xs opacity-60 mb-4">Últimos 7 dias</p>

      <div className="space-y-4">
        {trends.map((trend, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">{trend.label}</span>
              <div className="flex items-center gap-2">
                {trend.positive ? (
                  <TrendingUp size={16} className="text-green-400" />
                ) : (
                  <TrendingDown size={16} className="text-red-400" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    trend.positive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {trend.value}
                </span>
              </div>
            </div>
            <Sparkline data={trend.data} color={trend.color} height={32} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrendsCard
