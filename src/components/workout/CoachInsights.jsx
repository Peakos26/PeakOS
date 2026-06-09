import { useState, useEffect } from 'react'

const CoachInsights = () => {
  const [insights, setInsights] = useState({
    analise: '',
    citacao: '',
    autor: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular insights (em produção, chamar Groq API)
    const mockInsights = {
      analise: 'Você treinou 3 vezes esta semana. Seu volume aumentou 18%. Seu sono caiu 12%. Sua consistência está evoluindo bem.',
      citacao: 'Disciplina é escolher entre o que você quer agora e o que você mais quer.',
      autor: 'Abraham Lincoln'
    }
    
    setTimeout(() => {
      setInsights(mockInsights)
      setLoading(false)
    }, 1000)
  }, [])

  const highlightMetrics = (text) => {
    // Highlight números positivos em verde e negativos em vermelho
    return text.replace(/(\d+%)/g, (match) => {
      const num = parseInt(match)
      const color = num >= 0 ? '#c8f04a' : '#ff4d6d'
      return `<span style="color: ${color}">${match}</span>`
    })
  }

  if (loading) {
    return (
      <div className="card p-4">
        <h3 className="text-sm text-[#6e6e73] mb-3">🤖 Insights do Coach IA</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#84CC16]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm text-[#6e6e73] mb-3">🤖 Insights do Coach IA</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Análise da Semana */}
        <div className="bg-[#2C2C2E] rounded-xl p-4">
          <h4 className="text-xs text-[#6e6e73] mb-2">Análise da Semana</h4>
          <p 
            className="text-sm text-white leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightMetrics(insights.analise) }}
          />
        </div>
        
        {/* Sabedoria do Dia */}
        <div className="bg-[#2C2C2E] rounded-xl p-4">
          <h4 className="text-xs text-[#6e6e73] mb-2">Sabedoria do Dia</h4>
          <p className="text-sm text-white italic leading-relaxed mb-2">"{insights.citacao}"</p>
          <p className="text-xs text-[#6e6e73]">— {insights.autor}</p>
        </div>
      </div>
    </div>
  )
}

export default CoachInsights
