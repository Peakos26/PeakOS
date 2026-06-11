import { useState, useEffect } from 'react'
import { getSabedoriaDoDiaComCache } from '../utils/sabedoriaDoDia'

export const SabedoriaDoDia = () => {
  const [sabedoria, setSabedoria] = useState(null)
  
  useEffect(() => {
    setSabedoria(getSabedoriaDoDiaComCache())
    
    // Opcional: escutar mudança de dia (meia-noite)
    const checkMidnight = () => {
      const agora = new Date()
      const amanha = new Date(agora)
      amanha.setDate(agora.getDate() + 1)
      amanha.setHours(0, 0, 0, 0)
      
      const tempoAteMeiaNoite = amanha - agora
      setTimeout(() => {
        setSabedoria(getSabedoriaDoDiaComCache())
      }, tempoAteMeiaNoite)
    }
    
    checkMidnight()
  }, [])
  
  if (!sabedoria) return null
  
  return (
    <div className="sabedoria-container p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl mb-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm italic text-gray-700 dark:text-gray-300">
            "{sabedoria.texto}"
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            — {sabedoria.autor}
          </p>
        </div>
      </div>
    </div>
  )
}
