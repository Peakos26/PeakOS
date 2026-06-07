import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

const FEATURES = [
  {
    id: 'metas_diarias',
    name: 'Metas Diárias',
    description: 'Acompanhe suas metas diárias de treino e nutrição',
    price: 0,
    icon: '🎯',
    unlockMessage: '✅ Metas Diárias (PeakOS) desbloqueado!\n\nVocê agora pode:\n• Definir e acompanhar metas diárias\n• Visualizar progresso em tempo real\n• Receber notificações de conquistas'
  },
  {
    id: 'medidas_corporais',
    name: 'Medidas Corporais',
    description: 'Registre e acompanhe suas medidas corporais',
    price: 0,
    icon: '📏',
    unlockMessage: '✅ Medidas Corporais (PeakOS) desbloqueado!\n\nVocê agora pode:\n• Registrar medidas corporais\n• Acompanhar evolução ao longo do tempo\n• Ver gráficos de progresso'
  },
  {
    id: 'jejum_sono',
    name: 'Jejum e Sono',
    description: 'Controle de jejum intermitente e registro de sono',
    price: 0,
    icon: '🌙',
    unlockMessage: '✅ Jejum e Sono (PeakOS) desbloqueado!\n\nVocê agora pode:\n• Controlar jejum intermitente\n• Registrar horas de sono\n• Acompanhar qualidade do sono'
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    description: 'Integração com Apple Health para dados de saúde',
    price: 0,
    icon: '🍎',
    unlockMessage: '✅ Apple Health (PeakOS) desbloqueado!\n\nVocê agora pode:\n• Sincronizar dados do Apple Health\n• Integrar passos, sono e peso\n• Acompanhar métricas de saúde'
  },
  {
    id: 'treinos_personalizados',
    name: 'Treinos Personalizados',
    description: 'Treinos gerados especificamente para o seu objetivo',
    price: 6,
    icon: '💪',
    unlockMessage: '✅ Treinos Personalizados (PeakOS) desbloqueado!\n\nVocê agora tem acesso a:\n• Treinos personalizados gerados por IA\n• Planos de treino adaptados ao seu objetivo\n• Progressão automática de carga'
  },
  {
    id: 'dieta_personalizada',
    name: 'Dieta Personalizada',
    description: 'Planos alimentares personalizados por IA',
    price: 6,
    icon: '�',
    unlockMessage: '✅ Dieta Personalizada (PeakOS) desbloqueado!\n\nVocê agora tem acesso a:\n• Planos alimentares personalizados\n• Receitas adaptadas ao seu objetivo\n• Cálculo de macros e calorias'
  },
  {
    id: 'cardio_suplementos',
    name: 'Cardio e Suplementos',
    description: 'Guia de cardio e suplementação personalizada',
    price: 6,
    icon: '🏃',
    unlockMessage: '✅ Cardio e Suplementos (PeakOS) desbloqueado!\n\nVocê agora tem acesso a:\n• Planos de cardio personalizados\n• Guia de suplementação\n• Recomendações baseadas no seu objetivo'
  },
  {
    id: 'analise_foto',
    name: 'Análise de Foto',
    description: 'IA analisa fotos para estimar composição corporal',
    price: 6,
    icon: '�',
    unlockMessage: '✅ Análise de Foto (PeakOS) desbloqueado!\n\nVocê agora tem acesso a:\n• Upload de fotos para análise\n• Estimativa de composição corporal\n• Histórico de evolução'
  },
  {
    id: 'perfil_completo',
    name: 'Perfil Completo',
    description: 'Perfil detalhado com métricas avançadas',
    price: 6,
    icon: '👤',
    unlockMessage: '✅ Perfil Completo (PeakOS) desbloqueado!\n\nVocê agora tem acesso a:\n• Perfil detalhado com métricas avançadas\n• Análise completa de composição\n• Recomendações personalizadas'
  }
]

const FeaturesPage = () => {
  const { session, hasFeature } = useAuth()
  const [userFeatures, setUserFeatures] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)

  useEffect(() => {
    loadUserFeatures()
  }, [session])

  const loadUserFeatures = async () => {
    if (!session) return
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      // Sprint 0.3: Ler features de gymai_features/{tokenKey}/{featureId}
      const snapshot = await get(ref(database, `gymai_features/${encodedKey}`))
      const featuresData = snapshot.val() || {}
      const features = Object.keys(featuresData).filter(key => featuresData[key] === true)
      setUserFeatures(features)
    } catch (error) {
      console.error('Erro ao carregar features:', error)
    }
  }

  const activateFreeFeature = async (featureId) => {
    if (!session) return
    setLoading(true)

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      // Sprint 0.3: Features GRATUITAS → set gymai_features/{tk}/{featureId} = true
      await set(ref(database, `gymai_features/${encodedKey}/${featureId}`), true)
      
      const newFeatures = [...userFeatures, featureId]
      setUserFeatures(newFeatures)

      // Atualizar sessão local
      const sessionData = JSON.parse(localStorage.getItem('gymai_session'))
      sessionData.features = newFeatures
      localStorage.setItem('gymai_session', JSON.stringify(sessionData))

      // Mostrar notificação
      const feature = FEATURES.find(f => f.id === featureId)
      alert(feature.unlockMessage || `✅ ${feature.name} (PeakOS) desbloqueado com sucesso!`)
    } catch (error) {
      console.error('Erro ao ativar feature:', error)
      alert('Erro ao ativar feature')
    }

    setLoading(false)
  }

  const buyFeature = async (feature) => {
    setSelectedFeature(feature)
    setShowPixModal(true)
  }

  const confirmPurchase = async () => {
    if (!session || !selectedFeature) return
    setLoading(true)

    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const purchaseId = 'purchase_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
      
      // Sprint 0.3: Features PAGAS → grava gymai_purchases/{purchaseId}
      await set(ref(database, `gymai_purchases/${purchaseId}`), {
        tokenKey: session.tokenKey,
        featureId: selectedFeature.id,
        featureName: selectedFeature.name,
        price: selectedFeature.price,
        status: 'pending',
        createdAt: Date.now(),
        pixKey: '14cc72c1-f0d5-4522-a745-3af6c31a13f1'
      })

      setShowPixModal(false)
      alert(`✅ Solicitação de compra enviada!\n\nChave PIX: 14cc72c1-f0d5-4522-a745-3af6c31a13f1\n\nApós o pagamento, o administrador ativará a feature ${selectedFeature.name} manualmente.`)
    } catch (error) {
      console.error('Erro ao processar compra:', error)
      alert('Erro ao processar compra')
    }

    setLoading(false)
    setSelectedFeature(null)
  }

  const formatPrice = (price) => {
    if (price === 0) return 'Grátis'
    return `R$ ${price.toFixed(2)}`
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-2">Features do Usuário</h1>
        <p className="text-[var(--color-muted)] mb-6">Gerencie as funcionalidades disponíveis para sua conta</p>

        <div className="space-y-4">
          {FEATURES.map(feature => {
            const isActive = userFeatures.includes(feature.id)
            const isFree = feature.price === 0
            return (
              <Card key={feature.id} className={isActive ? 'border-primary-500' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <h3 className="text-lg font-semibold">{feature.name}</h3>
                    </div>
                    <p className="text-sm text-[var(--color-muted)] mb-3">{feature.description}</p>
                    <div className="text-sm font-medium">
                      {formatPrice(feature.price)}
                    </div>
                  </div>
                  <Button
                    variant={isActive ? 'outline' : 'default'}
                    onClick={() => {
                      if (isActive) return
                      if (isFree) {
                        activateFreeFeature(feature.id)
                      } else {
                        buyFeature(feature)
                      }
                    }}
                    disabled={loading || isActive}
                  >
                    {isActive ? 'Ativado' : isFree ? 'Ativar' : 'Comprar'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </main>

      <Navigation />

      {/* Modal PIX para features pagas */}
      {showPixModal && selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Comprar {selectedFeature.name}</h2>
            <p className="text-[var(--color-muted)] mb-4">
              Valor: <span className="font-semibold">{formatPrice(selectedFeature.price)}</span>
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium mb-2">Chave PIX:</p>
              <p className="text-lg font-mono break-all">14cc72c1-f0d5-4522-a745-3af6c31a13f1</p>
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-6">
              Após o pagamento, o administrador ativará a feature manualmente.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPixModal(false)
                  setSelectedFeature(null)
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmPurchase}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Compra'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default FeaturesPage
