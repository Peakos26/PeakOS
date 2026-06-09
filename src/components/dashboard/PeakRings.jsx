import { useEffect, useState } from 'react'

const PeakRings = ({
  movimento = { atual: 0, meta: 10000 },
  nutricao = { atual: 0, meta: 2200 },
  recuperacao = { atual: 0, meta: 8 },
  calorias = 850,
  passos = 6877,
  agua = 2.4,
  sono = '7h12min'
}) => {
  // Calcular percentuais (máximo 110% para efeito visual)
  const pMovimento = Math.min(110, (movimento.atual / movimento.meta) * 100)
  const pNutricao = Math.min(110, (nutricao.atual / nutricao.meta) * 100)
  const pRecuperacao = Math.min(110, (recuperacao.atual / recuperacao.meta) * 100)

  // Estado para animação
  const [animatedMovimento, setAnimatedMovimento] = useState(0)
  const [animatedNutricao, setAnimatedNutricao] = useState(0)
  const [animatedRecuperacao, setAnimatedRecuperacao] = useState(0)

  // Animação ao carregar com overshoot e bounce
  useEffect(() => {
    const duration = 1200
    const stagger = 200

    const animate = (target, setter, delay) => {
      setTimeout(() => {
        let start = 0
        const step = (timestamp) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)
          // Ease-out com overshoot (bounce)
          const easeOutBack = (x) => {
            const c1 = 1.70158
            const c3 = c1 + 1
            return 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2)
          }
          setter(target * easeOutBack(progress))
          if (progress < 1) {
            requestAnimationFrame(step)
          }
        }
        requestAnimationFrame(step)
      }, delay)
    }

    animate(pMovimento, setAnimatedMovimento, 0)
    animate(pNutricao, setAnimatedNutricao, stagger)
    animate(pRecuperacao, setAnimatedRecuperacao, stagger * 2)
  }, [pMovimento, pNutricao, pRecuperacao])

  // SVG ring helper
  const Ring = ({ radius, percent, color, strokeWidth = 18 }) => {
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percent / 100) * circumference
    const cx = 140
    const cy = 140

    return (
      <g>
        {/* Fundo do anel (track) */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.15}
        />
        {/* Progresso do anel */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            transition: 'stroke-dashoffset 1.2s ease-out',
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
        {/* Ponta do anel (bolinha) */}
        {percent > 2 && (
          <circle
            cx={cx + radius * Math.cos((percent / 100 * 360 - 90) * Math.PI / 180)}
            cy={cy + radius * Math.sin((percent / 100 * 360 - 90) * Math.PI / 180)}
            r={strokeWidth / 2}
            fill={color}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
      </g>
    )
  }

  // Mini circular indicator helper
  const MiniIndicator = ({ percent, color, size = 32 }) => {
    const circumference = 2 * Math.PI * (size / 2 - 4)
    const strokeDashoffset = circumference - (percent / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          <circle
            cx={size / 2} cy={size / 2} r={size / 2 - 4}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeOpacity={0.2}
          />
          <circle
            cx={size / 2} cy={size / 2} r={size / 2 - 4}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Peak Rings - Lado esquerdo, maior */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48">
          <svg viewBox="0 0 280 280" className="w-full h-full">
            {/* Anel externo — Movimento */}
            <Ring radius={120} percent={animatedMovimento} color="#ff2d55" />
            {/* Anel meio — Nutrição */}
            <Ring radius={96} percent={animatedNutricao} color="#30d158" />
            {/* Anel interno — Recuperação */}
            <Ring radius={72} percent={animatedRecuperacao} color="#64d2ff" />
          </svg>

          {/* Centro: total de pontos */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {Math.round((pMovimento + pNutricao + pRecuperacao) / 3)}
            </span>
            <span className="text-xs opacity-60">Score</span>
          </div>
        </div>

        {/* Labels laterais */}
        <div className="flex gap-3 mt-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff2d55' }} />
            <span className="text-xs opacity-60">Movimento</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#30d158' }} />
            <span className="text-xs opacity-60">Nutrição</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#64d2ff' }} />
            <span className="text-xs opacity-60">Recuperação</span>
          </div>
        </div>
      </div>

      {/* Hoje - Lado direito */}
      <div className="flex flex-col justify-center gap-3">
        <h3 className="text-lg font-semibold mb-2">Hoje</h3>

        <div className="flex items-center gap-2">
          <MiniIndicator percent={85} color="#ff2d55" size={24} />
          <div>
            <div className="text-lg font-bold">{calorias.toLocaleString()} kcal</div>
            <div className="text-xs opacity-60">Calorias</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <MiniIndicator percent={72} color="#30d158" size={28} />
          <div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{passos.toLocaleString()} passos</div>
            <div className="text-xs opacity-60">Passos</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <MiniIndicator percent={80} color="#0a84ff" size={28} />
          <div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{agua} L</div>
            <div className="text-xs opacity-60">Água</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <MiniIndicator percent={90} color="#64d2ff" size={28} />
          <div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{sono}</div>
            <div className="text-xs opacity-60">Sono</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PeakRings
