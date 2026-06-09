import { useMemo } from 'react'
import { Bot, Lightbulb } from 'lucide-react'

const CoachCard = () => {
  // Dados mockados - em produção viriam do Firebase
  const weeklyAnalysis = useMemo(() => [
    'Você treinou 4 vezes esta semana.',
    'Seu volume aumentou 12%.',
    'Seu sono melhorou 18%.',
    'Sua consistência está evoluindo.'
  ], [])

  const dailyWisdom = useMemo(() => ({
    quote: 'Disciplina é escolher entre o que você quer agora e o que você quer mais.',
    author: 'Abraham Lincoln'
  }), [])

  return (
    <div className="space-y-4">
      {/* CARD 1: Análise Semanal */}
      <div className="premium-card relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#84CC16]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#84CC16]/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#84CC16] to-[#65A30D] flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Análise Semanal</h2>
              <p className="text-xs opacity-60">Coach IA</p>
            </div>
          </div>

          <div className="space-y-3">
            {weeklyAnalysis.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#84CC16] mt-2 flex-shrink-0" />
                <p className="text-sm opacity-80">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 2: Sabedoria do Dia */}
      <div className="premium-card relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Lightbulb size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Sabedoria do Dia</h2>
              <p className="text-xs opacity-60">Inspiração</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm italic opacity-90 leading-relaxed">
              "{dailyWisdom.quote}"
            </p>
            <p className="text-xs opacity-60 text-right">
              — {dailyWisdom.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoachCard
