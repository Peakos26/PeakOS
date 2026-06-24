import { useState, useEffect } from 'react'
import { database, ref, get } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { X, TrendingUp, TrendingDown } from 'lucide-react'

const MacrosDrilldown = ({ onClose, tokenKey }) => {
  const [macros, setMacros] = useState({
    proteina: { consumido: 0, meta: 0 },
    carboidratos: { consumido: 0, meta: 0 },
    gorduras: { consumido: 0, meta: 0 },
    calorias: { consumido: 0, meta: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMacros()
  }, [tokenKey])

  const loadMacros = async () => {
    if (!tokenKey) return

    try {
      setLoading(true)
      const encodedKey = tokenKey.replace(/[.#$\[\]]/g, '_')
      const today = new Date().toISOString().split('T')[0]

      // Carregar dados do diário alimentar de hoje
      const diarioRef = ref(database, `gymai_diario_alimentar/${encodedKey}/${today}`)
      const diarioSnapshot = await get(diarioRef)
      const diarioData = diarioSnapshot.val() || {}

      // Carregar metas
      const metasRef = ref(database, `gymai_metas/${encodedKey}`)
      const metasSnapshot = await get(metasRef)
      const metasData = metasSnapshot.val() || {}

      // Calcular macros consumidos
      let proteinaConsumida = 0
      let carboidratosConsumidos = 0
      let gordurasConsumidas = 0
      let caloriasConsumidas = 0

      Object.values(diarioData).forEach(refeicao => {
        if (refeicao.alimentos) {
          Object.values(refeicao.alimentos).forEach(alimento => {
            proteinaConsumida += alimento.proteina || 0
            carboidratosConsumidos += alimento.carboidratos || 0
            gordurasConsumidas += alimento.gorduras || 0
            caloriasConsumidas += alimento.calorias || 0
          })
        }
      })

      setMacros({
        proteina: {
          consumido: proteinaConsumida,
          meta: metasData.proteina || 150
        },
        carboidratos: {
          consumido: carboidratosConsumidos,
          meta: metasData.carboidratos || 200
        },
        gorduras: {
          consumido: gordurasConsumidas,
          meta: metasData.gorduras || 60
        },
        calorias: {
          consumido: caloriasConsumidas,
          meta: metasData.calorias || 2000
        }
      })
    } catch (error) {
      console.error('Erro ao carregar macros:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (consumido, meta) => {
    if (meta === 0) return 0
    return Math.min((consumido / meta) * 100, 100)
  }

  const MacroCard = ({ label, consumido, meta, unit, color }) => {
    const percentage = calculatePercentage(consumido, meta)
    const isOnTrack = percentage >= 80

    return (
      <div className="bg-[var(--color-border)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          {isOnTrack ? (
            <TrendingUp size={16} className="text-green-500" />
          ) : (
            <TrendingDown size={16} className="text-orange-500" />
          )}
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-bold">{consumido.toFixed(0)}</span>
          <span className="text-sm text-[var(--color-muted)] mb-1">/ {meta} {unit}</span>
        </div>
        <div className="w-full bg-[var(--color-bg)] rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-[var(--color-muted)] mt-1">
          {percentage.toFixed(0)}% da meta
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Detalhes de Macros</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--color-muted)]">
            Carregando...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calorias */}
            <MacroCard
              label="Calorias"
              consumido={macros.calorias.consumido}
              meta={macros.calorias.meta}
              unit="kcal"
              color="bg-primary-600"
            />

            {/* Proteína */}
            <MacroCard
              label="Proteína"
              consumido={macros.proteina.consumido}
              meta={macros.proteina.meta}
              unit="g"
              color="bg-blue-500"
            />

            {/* Carboidratos */}
            <MacroCard
              label="Carboidratos"
              consumido={macros.carboidratos.consumido}
              meta={macros.carboidratos.meta}
              unit="g"
              color="bg-yellow-500"
            />

            {/* Gorduras */}
            <MacroCard
              label="Gorduras"
              consumido={macros.gorduras.consumido}
              meta={macros.gorduras.meta}
              unit="g"
              color="bg-red-500"
            />

            <div className="text-sm text-[var(--color-muted)] mt-4 pt-4 border-t border-[var(--color-border)]">
              <p>Dados baseados no diário alimentar de hoje</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default MacrosDrilldown
