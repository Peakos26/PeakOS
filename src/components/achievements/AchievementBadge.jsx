const AchievementBadge = ({ icon, label, color, value }) => {
  const safeLabel = label.replace(/\s/g, '-')
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        {/* Hexágono SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${safeLabel}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
            <filter id={`glow-${safeLabel}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Hexágono preenchimento */}
          <polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill={`url(#grad-${safeLabel})`}
            stroke={color}
            strokeWidth="2.5"
            filter={`url(#glow-${safeLabel})`}
          />
        </svg>
        {/* Ícone/valor centralizado */}
        <div
          className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
          style={{ color }}
        >
          {value || icon}
        </div>
      </div>
      <span className="text-xs text-[#6e6e73] text-center leading-tight whitespace-pre-line">{label}</span>
    </div>
  )
}

export default AchievementBadge
