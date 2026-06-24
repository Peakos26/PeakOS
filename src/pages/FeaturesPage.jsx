import { useState } from 'react'
import { useAuth } from '@context/AuthContext'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { Heart, Coffee, Rocket, Star, Copy } from 'lucide-react'
import { database, ref, set, push } from '@config/firebase.config'

const SUPPORT_TIERS = [
  {
    id: 'coffee',
    name: 'Café',
    description: 'Apoie o projeto com um café',
    price: 5,
    icon: Coffee,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'supporter',
    name: 'Apoiador',
    description: 'Apoie o desenvolvimento contínuo',
    price: 15,
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Acesso a features premium',
    price: 30,
    icon: Star,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    description: 'Apoie o crescimento do PeakOS',
    price: 50,
    icon: Rocket,
    color: 'from-blue-500 to-cyan-500'
  }
]

const FeaturesPage = () => {
  const { session } = useAuth()
  const [showPixModal, setShowPixModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState(null)
  const [copied, setCopied] = useState(false)

  const PIX_KEY = '14cc72c1-f0d5-4522-a745-3af6c31a13f1'

  const buySupport = async (tier) => {
    setSelectedTier(tier)
    setShowPixModal(true)
  }

  const copyPixKey = () => {
    navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const confirmSupport = async () => {
    if (!selectedTier || !session) return

    try {
      // Registrar doação no Firebase
      const encodedKey = session.tokenKey.replace(/[.#$\[\]]/g, '_')
      const donationRef = push(ref(database, `gymai_donations/${encodedKey}`))
      await set(donationRef, {
        tier: selectedTier.id,
        tierName: selectedTier.name,
        amount: selectedTier.price,
        timestamp: Date.now(),
        status: 'pending'
      })

      setShowPixModal(false)
      alert(`✅ Obrigado pelo apoio!\n\nSua doação de R$ ${selectedTier.price.toFixed(2)} foi registrada.\n\nChave PIX: ${PIX_KEY}\n\nApós o pagamento, envie o comprovante para heltonsales1982@gmail.com`)
      setSelectedTier(null)
    } catch (error) {
      console.error('Erro ao registrar doação:', error)
      alert('Erro ao registrar doação. Tente novamente.')
    }
  }

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2)}`
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Apoie o PeakOS</h1>
          <p className="text-[var(--color-muted)]">Ajude a manter o PeakOS gratuito e em desenvolvimento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {SUPPORT_TIERS.map(tier => {
            const Icon = tier.icon
            return (
              <Card key={tier.id} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-10`} />
                <div className="relative p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-[var(--color-muted)] mb-4">{tier.description}</p>
                  <div className="text-2xl font-bold mb-4">{formatPrice(tier.price)}</div>
                  <Button
                    className="w-full"
                    onClick={() => buySupport(tier)}
                  >
                    Apoiar
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border-primary-500/30">
          <div className="text-center py-6">
            <p className="text-sm text-[var(--color-muted)] mb-2">
              Todo apoio é muito appreciatedo e ajuda a manter o PeakOS gratuito para todos
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              PeakOS é um projeto open-source desenvolvido com ❤️
            </p>
          </div>
        </Card>
      </main>

      {/* Modal PIX */}
      {showPixModal && selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Apoiar {selectedTier.name}</h2>
            <p className="text-[var(--color-muted)] mb-4">
              Valor: <span className="font-semibold">{formatPrice(selectedTier.price)}</span>
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium mb-2">Chave PIX:</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono break-all flex-1">{PIX_KEY}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPixKey}
                  className="flex items-center gap-1"
                >
                  <Copy size={16} />
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-6">
              Após o pagamento, envie o comprovante para heltonsales1982@gmail.com
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPixModal(false)
                  setSelectedTier(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmSupport}
              >
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

export default FeaturesPage
