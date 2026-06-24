import { useState, useEffect } from 'react'
import { X, Dumbbell, Apple, Droplet, MapPin, Calendar } from 'lucide-react'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { getUserDailySummary } from '@services/communityService'

const UserStatsModal = ({ userKey, userName, onClose }) => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserSummary()
  }, [userKey])

  const loadUserSummary = async () => {
    if (!userKey) return

    try {
      setLoading(true)
      const data = await getUserDailySummary(userKey)
      setSummary(data)
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const calculatePercentage = (current, goal) => {
    if (goal === 0) return 0
    return Math.min((current / goal) * 100, 100)
  }

  const ProgressBar = ({ current, goal, color }) => {
    const percentage = calculatePercentage(current, goal)
    return (
      <div className="w-full bg-[var(--color-border)] rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{summary?.nome || userName || 'Usuário'}</h2>
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
          <div className="text-center py-12 text-[var(--color-muted)]">
            Carregando dados...
          </div>
        ) : !summary ? (
          <div className="text-center py-12 text-[var(--color-muted)]">
            Erro ao carregar dados
          </div>
        ) : (
          <div className="space-y-6">
            {/* Data */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Calendar size={16} />
              <span>{formatDate(summary.data_ref)}</span>
            </div>

            {/* Treino */}
            <div className="bg-[var(--color-border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell size={20} className="text-primary-600" />
                <h3 className="font-semibold">TREINO</h3>
              </div>
              {summary.treino.feito ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-500">✓ Feito</span>
                  </div>
                  {summary.treino.exercicios.length > 0 && (
                    <div className="text-sm">
                      <span className="text-[var(--color-muted)]">Exercícios: </span>
                      <span>{summary.treino.exercicios.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-[var(--color-muted)]">Séries: </span>
                      <span className="font-semibold">{summary.treino.series}</span>
                    </div>
                    {summary.treino.volume_total > 0 && (
                      <div>
                        <span className="text-[var(--color-muted)]">Volume: </span>
                        <span className="font-semibold">{summary.treino.volume_total} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[var(--color-muted)]">
                  Não treinou hoje
                </div>
              )}
            </div>

            {/* Alimentação */}
            <div className="bg-[var(--color-border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Apple size={20} className="text-green-500" />
                <h3 className="font-semibold">ALIMENTAÇÃO</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calorias</span>
                    <span className="font-semibold">
                      {summary.alimentacao.calorias} / {summary.alimentacao.meta_calorias} kcal
                      <span className="text-[var(--color-muted)] ml-1">
                        ({calculatePercentage(summary.alimentacao.calorias, summary.alimentacao.meta_calorias).toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <ProgressBar 
                    current={summary.alimentacao.calorias} 
                    goal={summary.alimentacao.meta_calorias} 
                    color="bg-green-500" 
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-[var(--color-muted)]">Proteínas</div>
                    <div className="font-semibold">{summary.alimentacao.proteinas.toFixed(0)}g</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-muted)]">Carbo</div>
                    <div className="font-semibold">{summary.alimentacao.carboidratos.toFixed(0)}g</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-muted)]">Gorduras</div>
                    <div className="font-semibold">{summary.alimentacao.gorduras.toFixed(0)}g</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Água */}
            <div className="bg-[var(--color-border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplet size={20} className="text-blue-500" />
                <h3 className="font-semibold">ÁGUA</h3>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consumo</span>
                  <span className="font-semibold">
                    {summary.agua.quantidade}ml / {summary.agua.meta}ml
                    <span className="text-[var(--color-muted)] ml-1">
                      ({calculatePercentage(summary.agua.quantidade, summary.agua.meta).toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <ProgressBar 
                  current={summary.agua.quantidade} 
                  goal={summary.agua.meta} 
                  color="bg-blue-500" 
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="bg-[var(--color-border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={20} className="text-orange-500" />
                <h3 className="font-semibold">CHECK-IN</h3>
              </div>
              {summary.checkin.feito ? (
                <div className="text-sm">
                  {summary.checkin.localizacao ? (
                    <span>Feito em {summary.checkin.localizacao}</span>
                  ) : (
                    <span>Check-in realizado</span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-[var(--color-muted)]">
                  Não fez check-in hoje
                </div>
              )}
            </div>

            {/* Mensagem motivacional */}
            {!summary.treino.feito && !summary.checkin.feito && summary.alimentacao.calorias === 0 && summary.agua.quantidade === 0 && (
              <div className="text-center py-4 text-[var(--color-muted)]">
                <p>Nenhuma atividade registrada hoje.</p>
                <p className="text-sm mt-1">Que tal motivá-lo?</p>
              </div>
            )}

            <div className="text-center py-4 text-sm text-[var(--color-muted)] border-t border-[var(--color-border)]">
              Inspire-se e mantenha a consistência!
            </div>

            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default UserStatsModal
