import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'

const AdminPage = () => {
  const { session } = useAuth()
  const [tokens, setTokens] = useState({})
  const [newTokenKey, setNewTokenKey] = useState('')
  const [newTokenNome, setNewTokenNome] = useState('')
  const [newTokenFeatures, setNewTokenFeatures] = useState([])
  const [newTokenExpires, setNewTokenExpires] = useState('')

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    const snapshot = await database.ref('gymai_tokens').once('value')
    const data = snapshot.val()
    if (data) {
      setTokens(data)
    }
  }

  const handleCreateToken = async () => {
    if (!newTokenKey || !newTokenNome) {
      alert('Preencha todos os campos')
      return
    }

    const tokenData = {
      nome: newTokenNome,
      features: newTokenFeatures,
      createdAt: Date.now(),
      expiresAt: newTokenExpires ? new Date(newTokenExpires).getTime() : null
    }

    await database.ref(`gymai_tokens/${newTokenKey}`).set(tokenData)
    alert('Token criado com sucesso!')
    
    setNewTokenKey('')
    setNewTokenNome('')
    setNewTokenFeatures([])
    setNewTokenExpires('')
    loadTokens()
  }

  const handleDeleteToken = async (tokenKey) => {
    if (!confirm('Tem certeza que deseja deletar este token?')) return

    await database.ref(`gymai_tokens/${tokenKey}`).remove()
    alert('Token deletado com sucesso!')
    loadTokens()
  }

  const toggleFeature = (feature) => {
    if (newTokenFeatures.includes(feature)) {
      setNewTokenFeatures(newTokenFeatures.filter(f => f !== feature))
    } else {
      setNewTokenFeatures([...newTokenFeatures, feature])
    }
  }

  const FEATURES = [
    'treinos_personalizados',
    'scanner_corporal',
    'metas_inteligentes',
    'performance_score',
    'relatorios_avancados'
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">Administração</h1>

        {/* Criar Novo Token */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Criar Novo Token</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Chave do Token (email)</label>
              <Input
                type="email"
                value={newTokenKey}
                onChange={(e) => setNewTokenKey(e.target.value)}
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Usuário</label>
              <Input
                type="text"
                value={newTokenNome}
                onChange={(e) => setNewTokenNome(e.target.value)}
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data de Expiração (opcional)</label>
              <Input
                type="date"
                value={newTokenExpires}
                onChange={(e) => setNewTokenExpires(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Features</label>
              <div className="space-y-2">
                {FEATURES.map(feature => (
                  <label key={feature} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newTokenFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="rounded"
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateToken}>Criar Token</Button>
          </div>
        </Card>

        {/* Lista de Tokens */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Tokens Ativos</h2>
          <div className="space-y-4">
            {Object.entries(tokens).map(([key, token]) => (
              <div key={key} className="p-4 bg-[var(--color-border)] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{token.nome}</div>
                    <div className="text-sm text-[var(--color-muted)]">{key}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteToken(key)}>
                    Deletar
                  </Button>
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  Features: {token.features?.join(', ') || 'Nenhuma'}
                </div>
                {token.expiresAt && (
                  <div className="text-sm text-[var(--color-muted)]">
                    Expira em: {new Date(token.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminPage
