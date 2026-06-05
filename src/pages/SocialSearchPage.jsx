import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get } from '@config/firebase.config'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'

const SocialSearchPage = () => {
  const { session, hasFeature } = useAuth()
  const [socialUsers, setSocialUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSocialUsers()
  }, [session])

  const loadSocialUsers = async () => {
    if (!session) return
    setLoading(true)
    try {
      const snapshot = await get(ref(database, 'gymai_social'))
      const data = snapshot.val()
      if (data) {
        const users = Object.values(data)
        // Filtrar para não mostrar o próprio usuário
        const otherUsers = users.filter(user => user.nome !== session.nome)
        setSocialUsers(otherUsers)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários sociais:', error)
    }
    setLoading(false)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const shareOnX = () => {
    const text = `Acabei de adquirir o PeakOS - Treinos Personalizados! 🏋️‍♂️ Transforme seus treinos com IA. #PeakOS #Fitness #TreinoPersonalizado`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (!hasFeature('treinos_personalizados')) {
    return (
      <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Comunidade PeakOS</h1>
            <p className="text-[var(--color-muted)] mb-6">
              Ative o pacote "Treinos Personalizados" para acessar a comunidade e ver outros usuários que também adquiriram o pacote.
            </p>
            <Button onClick={() => window.location.href = '/features'}>
              Ver Features
            </Button>
          </Card>
        </main>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-2">Comunidade PeakOS</h1>
        <p className="text-[var(--color-muted)] mb-6">Conheça outros usuários que também adquiriram o pacote Treinos Personalizados</p>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Compartilhe no X</h2>
              <p className="text-sm text-[var(--color-muted)]">Mostre que você faz parte da comunidade PeakOS</p>
            </div>
            <Button onClick={shareOnX} variant="outline">
              Compartilhar →
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card>
            <p className="text-center text-[var(--color-muted)]">Carregando comunidade...</p>
          </Card>
        ) : socialUsers.length === 0 ? (
          <Card>
            <p className="text-center text-[var(--color-muted)]">
              Seja o primeiro a compartilhar! Ative o pacote e apareça aqui.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {socialUsers.map((user, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.nome}</h3>
                        <p className="text-xs text-[var(--color-muted)]">
                          Membro desde {formatDate(user.activatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {user.features.map(feature => (
                        <span key={feature} className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}

export default SocialSearchPage
