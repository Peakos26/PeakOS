import { useMemo, useEffect, useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get } from '@config/firebase.config'

const TodayCard = () => {
  const { session } = useAuth()
  const [metrics, setMetrics] = useState([
    { label: 'Calorias', value: '0', goal: '2200', unit: 'kcal', progress: 0 },
    { label: 'Passos', value: '0', goal: '10000', unit: '', progress: 0 },
    { label: 'Água', value: '0', goal: '3.0', unit: 'L', progress: 0 },
    { label: 'Sono', value: '--h', goal: '8h', unit: '', progress: 0 },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRealData = async () => {
      if (!session) return

      try {
        const today = new Date().toISOString().split('T')[0]
        const encodedKey = session.tokenKey.replace(/[.#$\[\]]/g, '_')

        const [alimentarSnap, hidratacaoSnap, sonoSnap, cardioSnap] = await Promise.all([
          get(ref(database, `gymai_diario_alimentar/${encodedKey}/${today}`)),
          get(ref(database, `gymai_hidratacao/${encodedKey}/${today}`)),
          get(ref(database, `gymai_sono/${encodedKey}/${today}`)),
          get(ref(database, `gymai_cardio/${encodedKey}/${today}`))
        ])

        const alimentarData = alimentarSnap.val() || {}
        const hidratacaoData = hidratacaoSnap.val() || {}
        const sonoData = sonoSnap.val() || {}
        const cardioData = cardioSnap.val() || {}

        // Calorias
        const caloriasTotais = Object.values(alimentarData).reduce((sum, refeicao) => sum + (refeicao.calorias || 0), 0)
        const metaCalorias = 2200
        const progressCalorias = Math.min(100, (caloriasTotais / metaCalorias) * 100)

        // Passos
        const passos = cardioData.passos || 0
        const metaPassos = 10000
        const progressPassos = Math.min(100, (passos / metaPassos) * 100)

        // Água
        const aguaIntake = hidratacaoData.intake || 0
        const aguaLitros = (aguaIntake / 1000).toFixed(1)
        const metaAgua = 3000
        const progressAgua = Math.min(100, (aguaIntake / metaAgua) * 100)

        // Sono
        const sonoDuration = sonoData.duration || 0
        const sonoFormatado = sonoDuration > 0 ? `${Math.floor(sonoDuration)}h${Math.round((sonoDuration % 1) * 60)}min` : '--h'
        const metaSono = 8
        const progressSono = Math.min(100, (sonoDuration / metaSono) * 100)

        setMetrics([
          { label: 'Calorias', value: caloriasTotais.toLocaleString(), goal: '2200', unit: 'kcal', progress: Math.round(progressCalorias) },
          { label: 'Passos', value: passos.toLocaleString(), goal: '10000', unit: '', progress: Math.round(progressPassos) },
          { label: 'Água', value: aguaLitros, goal: '3.0', unit: 'L', progress: Math.round(progressAgua) },
          { label: 'Sono', value: sonoFormatado, goal: '8h', unit: '', progress: Math.round(progressSono) },
        ])
      } catch (error) {
        console.error('Erro ao carregar dados do TodayCard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRealData()
  }, [session])

  if (loading) {
    return (
      <div className="premium-card">
        <h2 className="text-lg font-semibold mb-4">Hoje</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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
