import { useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { Droplets } from 'lucide-react'
import { database, ref, get, set } from '@config/firebase.config'

const QuickWaterButton = () => {
  const { session } = useAuth()
  const [amount, setAmount] = useState(250) // ml padrão
  const [showInput, setShowInput] = useState(false)

  const addWater = async () => {
    if (!session) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const encodedKey = session.tokenKey.replace(/[.#$\[\]]/g, '_')
      const waterRef = ref(database, `gymai_hidratacao/${encodedKey}/${today}`)
      const snap = await get(waterRef)
      const current = snap.val() || { intake: 0, goal: 2000 }
      
      await set(waterRef, {
        ...current,
        intake: current.intake + amount,
        goal: current.goal || 2000,
        timestamp: Date.now()
      })
      
      setShowInput(false)
    } catch (error) {
      console.error('Erro ao adicionar água:', error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowInput(!showInput)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
      >
        <Droplets size={16} />
        + Água
      </button>
      {showInput && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-20 px-2 py-1 bg-bg3 border border-border rounded-lg text-sm text-center"
            step={50}
            min={50}
            max={2000}
          />
          <span className="text-xs text-muted">ml</span>
          <button onClick={addWater} className="px-3 py-1 bg-accent text-black rounded-lg text-sm font-bold hover:bg-accent/90 transition-colors">
            ✓
          </button>
        </div>
      )}
    </div>
  )
}

export default QuickWaterButton
