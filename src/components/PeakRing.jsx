import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPeakRingProgress } from '../services/peakRingService'

export const PeakRing = () => {
  const { session } = useAuth()
  const [progress, setProgress] = useState(0)
  const [detalhes, setDetalhes] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const fetchProgress = async () => {
    if (!session?.tokenKey) return
    setLoading(true)
    try {
      const data = await getPeakRingProgress(session.tokenKey)
      setProgress(data.progresso)
      setDetalhes(data.detalhes)
    } catch (error) {
      console.error('Erro ao buscar progresso:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProgress()
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchProgress, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [session])
  
  // Determinar cor baseada no progresso
  const getRingColor = () => {
    if (progress < 30) return '#ef4444' // vermelho
    if (progress < 60) return '#f59e0b' // laranja/amarelo
    if (progress < 85) return '#10b981' // verde
    return '#3b82f6' // azul para >85%
  }
  
  const circumference = 2 * Math.PI * 120 // raio 120
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center p-4">
      {/* Anel SVG */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
          {/* Fundo */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="16"
            className="dark:stroke-gray-700"
          />
          {/* Progresso */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={getRingColor()}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {progress}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Peak Score
          </span>
        </div>
      </div>
      
      {/* Tooltip com detalhes ao passar mouse (opcional) */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {progress === 100 ? '🎉 Dia perfeito! 🎉' : 
           progress >= 85 ? '🔥 Você está arrasando!' :
           progress >= 60 ? '💪 Bom progresso, continue!' :
           progress >= 30 ? '📈 Comece pelas pendências do sino' :
           '🌅 Vamos começar o dia?'}
        </p>
      </div>
      
      {/* Detalhes expansíveis (opcional) */}
      <details className="mt-4 text-xs text-gray-500 cursor-pointer">
        <summary className="text-primary-500">Ver detalhes</summary>
        <div className="mt-2 space-y-1 text-left">
          {detalhes && Object.entries(detalhes).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="capitalize">{key}:</span>
              <span>{Math.round(value.valor)}% ({value.peso}%)</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
