import { useEffect, useState } from 'react'

const MacroRings = ({
  proteina = { atual: 0, meta: 170 },
  carboidratos = { atual: 0, meta: 220 },
  gorduras = { atual: 0, meta: 60 }
}) => {

  // Calcular percentuais (máximo 110% para efeito visual)
  const pProtein = Math.min(110, (proteina.atual / proteina.meta) * 100)
  const pCarbs = Math.min(110, (carboidratos.atual / carboidratos.meta) * 100)
  const pFat = Math.min(110, (gorduras.atual / gorduras.meta) * 100)

  // Estado para animação
  const [animatedProtein, setAnimatedProtein] = useState(0)
  const [animatedCarbs, setAnimatedCarbs] = useState(0)
  const [animatedFat, setAnimatedFat] = useState(0)

  // Animação ao carregar
  useEffect(() => {
    const duration = 1200
    const stagger = 200

    const animate = (target, setter, delay) => {
      setTimeout(() => {
        let start = 0
        const step = (timestamp) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)
          const easeOut = 1 - Math.pow(1 - progress, 3)
          setter(target * easeOut)
          if (progress < 1) {
            requestAnimationFrame(step)
          }
        }
        requestAnimationFrame(step)
      }, delay)
    }

    animate(pCarbs, setAnimatedCarbs, 0)
    animate(pProtein, setAnimatedProtein, stagger)
    animate(pFat, setAnimatedFat, stagger * 2)
  }, [pCarbs, pProtein, pFat])

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
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
        {/* Ponta do anel (bolinha) */}
        {percent > 2 && (
          <circle
            cx={cx + radius * Math.cos((percent / 100 * 360 - 90) * Math.PI / 180)}
            cy={cy + radius * Math.sin((percent / 100 * 360 - 90) * Math.PI / 180)}
            r={strokeWidth / 2}
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )}
      </g>
    )
  }

  return (
    <div className="flex flex-col items-center">

      {/* SVG dos anéis */}
      <div className="relative w-72 h-72">
        <svg viewBox="0 0 280 280" className="w-full h-full">
          {/* Anel externo — Carboidratos */}
          <Ring radius={120} percent={animatedCarbs} color="#4ade80" />
          {/* Anel meio — Proteína */}
          <Ring radius={96} percent={animatedProtein} color="#60a5fa" />
          {/* Anel interno — Gorduras */}
          <Ring radius={72} percent={animatedFat} color="#fb923c" />
        </svg>

        {/* Centro: total de calorias */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">
            {Math.round(proteina.atual * 4 + carboidratos.atual * 4 + gorduras.atual * 9)}
          </span>
          <span className="text-xs text-[var(--color-muted)]">kcal</span>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex gap-6 mt-4">
        <LegendItem color="#4ade80" label="Carboidratos" atual={carboidratos.atual} meta={carboidratos.meta} unit="g" />
        <LegendItem color="#60a5fa" label="Proteína" atual={proteina.atual} meta={proteina.meta} unit="g" />
        <LegendItem color="#fb923c" label="Gorduras" atual={gorduras.atual} meta={gorduras.meta} unit="g" />
      </div>

    </div>
  )
}

const LegendItem = ({ color, label, atual, meta, unit }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-xs text-[var(--color-muted)]">{label}</span>
    <span className="text-sm font-bold">{atual}<span className="text-[var(--color-muted)] font-normal">/{meta}{unit}</span></span>
  </div>
)

export default MacroRings
