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
    id: 'scanner_corporal',
    name: 'Scanner Corporal IA',
    description: 'Análise de fotos para estimar composição corporal',
    price: 0,
    icon: '📷'
  },
  {
    id: 'metas_inteligentes',
    name: 'Metas Inteligentes',
    description: 'IA gera metas personalizadas baseadas no seu perfil',
    price: 0,
    icon: '🎯'
  },
  {
    id: 'performance_score',
    name: 'Performance Score',
    description: 'Dashboard com score de performance em tempo real',
    price: 0,
    icon: '📊'
  },
  {
    id: 'coach_avancado',
    name: 'Coach Avançado',
    description: 'IA com análise avançada e recomendações personalizadas',
    price: 11.99,
    duration: 90,
    icon: '🤖'
  },
  {
    id: 'treinos_personalizados',
    name: 'Treinos Personalizados',
    description: 'Treinos gerados especificamente para o seu objetivo',
    price: 24.32,
    duration: 180,
    icon: '💪'
  }
]

const FeaturesPage = () => {
  const { session, hasFeature } = useAuth()
  const [userFeatures, setUserFeatures] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUserFeatures()
  }, [session])

  const loadUserFeatures = async () => {
    if (!session) return
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_tokens/${encodedKey}/features`))
      const features = snapshot.val() || []
      setUserFeatures(features)
    } catch (error) {
      console.error('Erro ao carregar features:', error)
    }
  }

  const toggleFeature = async (featureId) => {
    if (!session) return
    setLoading(true)

    try {
      let newFeatures

      // Se ativar treinos_personalizados, ativar todas as features
      if (featureId === 'treinos_personalizados' && !userFeatures.includes(featureId)) {
        newFeatures = FEATURES.map(f => f.id)
      } else if (featureId === 'treinos_personalizados' && userFeatures.includes(featureId)) {
        // Se desativar treinos_personalizados, desativar todas
        newFeatures = []
      } else {
        newFeatures = userFeatures.includes(featureId)
          ? userFeatures.filter(f => f !== featureId)
          : [...userFeatures, featureId]
      }

      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_tokens/${encodedKey}/features`), newFeatures)
      setUserFeatures(newFeatures)

      // Calcular nova data de expiração baseada no pacote ativado
      let newExpirationDate = null
      if (newFeatures.includes('treinos_personalizados')) {
        // Treinos Personalizados: 180 dias
        newExpirationDate = new Date()
        newExpirationDate.setDate(newExpirationDate.getDate() + 180)
      } else if (newFeatures.includes('coach_avancado') && !newFeatures.includes('treinos_personalizados')) {
        // Coach Avançado: 90 dias (apenas se não tiver Treinos Personalizados)
        newExpirationDate = new Date()
        newExpirationDate.setDate(newExpirationDate.getDate() + 90)
      }

      // Salvar data de expiração no Firebase
      if (newExpirationDate) {
        await set(ref(database, `gymai_tokens/${encodedKey}/expiresAt`), newExpirationDate.getTime())
      } else if (newFeatures.length === 0) {
        // Se desativou todas as features, remover expiração
        await set(ref(database, `gymai_tokens/${encodedKey}/expiresAt`), null)
      }

      // Atualizar sessão local
      const sessionData = JSON.parse(localStorage.getItem('gymai_session'))
      sessionData.features = newFeatures
      sessionData.expiresAt = newExpirationDate ? newExpirationDate.getTime() : null
      localStorage.setItem('gymai_session', JSON.stringify(sessionData))

      // Salvar no Firebase para pesquisa social
      if (newFeatures.includes('treinos_personalizados')) {
        await set(ref(database, `gymai_social/${encodedKey}`), {
          nome: session.nome,
          features: newFeatures,
          activatedAt: Date.now(),
          expiresAt: newExpirationDate ? newExpirationDate.getTime() : null
        })
      } else {
        await set(ref(database, `gymai_social/${encodedKey}`), null)
      }

      // Mostrar notificação
      const feature = FEATURES.find(f => f.id === featureId)
      if (!userFeatures.includes(featureId)) {
        if (featureId === 'treinos_personalizados') {
          alert(`✅ ${feature.name} (PeakOS) desbloqueado! Todas as features foram liberadas automaticamente.`)
        } else {
          alert(`✅ ${feature.name} (PeakOS) desbloqueado com sucesso!`)
        }
      } else {
        if (featureId === 'treinos_personalizados') {
          alert(`ℹ️ ${feature.name} desativado. Todas as features foram removidas.`)
        } else {
          alert(`ℹ️ ${feature.name} desativado.`)
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar feature:', error)
      alert('Erro ao atualizar feature')
    }

    setLoading(false)
  }

  const formatPrice = (price, duration) => {
    if (price === 0) return 'Grátis'
    return `R$ ${price.toFixed(2)} / ${duration} dias`
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
                      {formatPrice(feature.price, feature.duration)}
                    </div>
                  </div>
                  <Button
                    variant={isActive ? 'outline' : 'default'}
                    onClick={() => toggleFeature(feature.id)}
                    disabled={loading}
                  >
                    {isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </main>

      <Navigation />
    </div>
  )
}

export default FeaturesPage
