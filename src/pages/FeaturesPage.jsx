import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'

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
    price: 29.90,
    icon: '🤖'
  },
  {
    id: 'treinos_personalizados',
    name: 'Treinos Personalizados',
    description: 'Treinos gerados especificamente para o seu objetivo',
    price: 49.90,
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
      const snapshot = await get(ref(database, `gymai_tokens/${session.tokenKey}/features`))
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
      const newFeatures = userFeatures.includes(featureId)
        ? userFeatures.filter(f => f !== featureId)
        : [...userFeatures, featureId]

      await set(ref(database, `gymai_tokens/${session.tokenKey}/features`), newFeatures)
      setUserFeatures(newFeatures)

      // Atualizar sessão local
      const sessionData = JSON.parse(localStorage.getItem('gymai_session'))
      sessionData.features = newFeatures
      localStorage.setItem('gymai_session', JSON.stringify(sessionData))
    } catch (error) {
      console.error('Erro ao atualizar feature:', error)
      alert('Erro ao atualizar feature')
    }

    setLoading(false)
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
