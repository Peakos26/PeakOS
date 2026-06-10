import { useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { Droplets, Check, X, Plus, Minus } from 'lucide-react'
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
      setAmount(250) // Reset para valor padrão
    } catch (error) {
      console.error('Erro ao adicionar água:', error)
    }
  }

  const adjustAmount = (delta) => {
    const newAmount = amount + delta
    if (newAmount >= 50 && newAmount <= 2000) {
      setAmount(newAmount)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-xl text-blue-400 text-sm font-bold hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-500/60 transition-all shadow-lg shadow-blue-500/20"
        >
          <Droplets size={20} />
          + Água
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-bg3 border-2 border-blue-500/40 rounded-xl p-2 shadow-lg">
          <button
            onClick={() => adjustAmount(-50)}
            className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={amount}
            onChange={e => {
              const val = Number(e.target.value)
              if (val >= 50 && val <= 2000) setAmount(val)
            }}
            className="w-20 px-2 py-1 bg-bg3 border border-border rounded-lg text-sm text-center font-bold text-white focus:outline-none focus:border-blue-500"
            step={50}
            min={50}
            max={2000}
          />
          <span className="text-xs text-muted font-medium">ml</span>
          <button
            onClick={() => adjustAmount(50)}
            className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={addWater}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md flex items-center gap-1"
          >
            <Check size={16} />
            Confirmar
          </button>
          <button
            onClick={() => {
              setShowInput(false)
              setAmount(250)
            }}
            className="w-8 h-8 flex items-center justify-center bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default QuickWaterButton
