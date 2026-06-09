import { useMemo, useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get } from '@config/firebase.config'

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

const calcTrend = (atual, anterior) => {
  if (!anterior || anterior === 0) return { percent: 0, direction: 'stable', label: '0%', color: '#6b6b80' }
  const diff = ((atual - anterior) / anterior) * 100
  return {
    percent: Math.abs(diff).toFixed(0),
    direction: diff > 5 ? 'up' : diff < -5 ? 'down' : 'stable',
    label: diff > 0 ? `+${diff.toFixed(0)}%` : `${diff.toFixed(0)}%`,
    color: diff > 0 ? '#4ade80' : diff < 0 ? '#ff4d6d' : '#6b6b80'
  }
}

const TrendsCard = () => {
  const { session } = useAuth()
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRealTrends = async () => {
      if (!session) return

      try {
        const encodedKey = session.tokenKey.replace(/[.#$\[\]]/g, '_')
        
        // Carregar dados dos últimos 7 dias
        const last7Days = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          last7Days.push(date.toISOString().split('T')[0])
        }

        const [logSnap, alimentarSnap, hidratacaoSnap, sonoSnap] = await Promise.all([
          get(ref(database, `gymai_log/${encodedKey}`)),
          get(ref(database, `gymai_diario_alimentar/${encodedKey}`)),
          get(ref(database, `gymai_hidratacao/${encodedKey}`)),
          get(ref(database, `gymai_sono/${encodedKey}`))
        ])

        const logData = logSnap.val() || {}
        const alimentarData = alimentarSnap.val() || {}
        const hidratacaoData = hidratacaoSnap.val() || {}
        const sonoData = sonoSnap.val() || {}

        // Calcular dados por dia
        const movimentoData = last7Days.map(date => {
          const dayLogs = logData[date] || {}
          let seriesCount = 0
          Object.values(dayLogs).forEach((log) => {
            if (log.exercicios) {
              log.exercicios.forEach((ex) => {
                if (ex.series) seriesCount += ex.series.length
              })
            }
          })
          return seriesCount
        })

        const nutricaoData = last7Days.map(date => {
          const dayAlimentar = alimentarData[date] || {}
          return Object.values(dayAlimentar).reduce((sum, refeicao) => sum + (refeicao.calorias || 0), 0)
        })

        const aguaData = last7Days.map(date => {
          const dayHidratacao = hidratacaoData[date] || {}
          return (dayHidratacao.intake || 0) / 1000 // converter para litros
        })

        const sonoDataArray = last7Days.map(date => {
          const daySono = sonoData[date] || {}
          return daySono.duration || 0
        })

        // Calcular tendências (últimos 7 dias vs 7 dias anteriores)
        const movimentoAtual = movimentoData.slice(-7).reduce((a, b) => a + b, 0)
        const movimentoAnterior = movimentoData.slice(0, 7).reduce((a, b) => a + b, 0)
        const movimentoTrend = calcTrend(movimentoAtual, movimentoAnterior)

        const nutricaoAtual = nutricaoData.slice(-7).reduce((a, b) => a + b, 0) / 7
        const nutricaoAnterior = nutricaoData.slice(0, 7).reduce((a, b) => a + b, 0) / 7
        const nutricaoTrend = calcTrend(nutricaoAtual, nutricaoAnterior)

        const aguaAtual = aguaData.slice(-7).reduce((a, b) => a + b, 0) / 7
        const aguaAnterior = aguaData.slice(0, 7).reduce((a, b) => a + b, 0) / 7
        const aguaTrend = calcTrend(aguaAtual, aguaAnterior)

        const sonoAtual = sonoDataArray.slice(-7).reduce((a, b) => a + b, 0) / 7
        const sonoAnterior = sonoDataArray.slice(0, 7).reduce((a, b) => a + b, 0) / 7
        const sonoTrend = calcTrend(sonoAtual, sonoAnterior)

        setTrends([
          {
            label: 'Movimento',
            value: movimentoTrend.label,
            positive: movimentoTrend.direction === 'up',
            data: movimentoData,
            color: '#ff2d55'
          },
          {
            label: 'Nutrição',
            value: nutricaoTrend.label,
            positive: nutricaoTrend.direction === 'up',
            data: nutricaoData,
            color: '#30d158'
          },
          {
            label: 'Água',
            value: aguaTrend.label,
            positive: aguaTrend.direction === 'up',
            data: aguaData,
            color: '#0a84ff'
          },
          {
            label: 'Sono',
            value: sonoTrend.label,
            positive: sonoTrend.direction === 'up',
            data: sonoDataArray,
            color: '#64d2ff'
          },
        ])
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar tendências:', error)
        setLoading(false)
      }
    }

    loadRealTrends()
  }, [session])

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
