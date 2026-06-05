import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'

const AdminPage = () => {
  const { session } = useAuth()
  const [tokens, setTokens] = useState({})
  const [requests, setRequests] = useState({})
  const [newTokenKey, setNewTokenKey] = useState('')
  const [newTokenNome, setNewTokenNome] = useState('')
  const [newTokenFeatures, setNewTokenFeatures] = useState([])
  const [newTokenExpires, setNewTokenExpires] = useState('')
  const [groqApiKey, setGroqApiKey] = useState('')
  const [editingToken, setEditingToken] = useState(null)
  const [editingFeatures, setEditingFeatures] = useState([])

  useEffect(() => {
    loadTokens()
    loadRequests()
    loadGroqApiKey()
  }, [])

  const loadTokens = async () => {
    const snapshot = await get(ref(database, 'gymai_tokens'))
    const data = snapshot.val()
    if (data) {
      setTokens(data)
    }
  }

  const loadRequests = async () => {
    const snapshot = await get(ref(database, 'gymai_requests'))
    const data = snapshot.val()
    if (data) {
      setRequests(data)
    }
  }

  const loadGroqApiKey = async () => {
    const snapshot = await get(ref(database, 'gymai_config/groq_api_key'))
    const data = snapshot.val()
    if (data) {
      setGroqApiKey(data)
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

    await set(ref(database, `gymai_tokens/${newTokenKey}`), tokenData)
    alert('Token criado com sucesso!')
    
    setNewTokenKey('')
    setNewTokenNome('')
    setNewTokenFeatures([])
    setNewTokenExpires('')
    loadTokens()
  }

  const handleDeleteToken = async (tokenKey) => {
    if (!confirm('Tem certeza que deseja deletar este token?')) return

    await set(ref(database, `gymai_tokens/${tokenKey}`), null)
    alert('Token deletado com sucesso!')
    loadTokens()
  }

  const handleSaveGroqApiKey = async () => {
    if (!groqApiKey) {
      alert('Preencha a chave API')
      return
    }

    await set(ref(database, 'gymai_config/groq_api_key'), groqApiKey)
    alert('Chave API salva com sucesso!')
  }

  const handleApproveRequest = async (requestId, requestData) => {
    const tokenKey = requestData.celular
    const tokenData = {
      nome: requestData.nome,
      features: FEATURES,
      createdAt: Date.now(),
      expiresAt: null
    }

    await set(ref(database, `gymai_tokens/${tokenKey}`), tokenData)
    await set(ref(database, `gymai_requests/${requestId}/status`), 'approved')
    await set(ref(database, `gymai_requests/${requestId}/tokenKey`), tokenKey)
    
    alert('Solicitação aprovada com sucesso!')
    loadRequests()
    loadTokens()
  }

  const handleRejectRequest = async (requestId) => {
    if (!confirm('Tem certeza que deseja rejeitar esta solicitação?')) return

    await set(ref(database, `gymai_requests/${requestId}/status`), 'rejected')
    alert('Solicitação rejeitada!')
    loadRequests()
  }

  const toggleFeature = (feature) => {
    if (newTokenFeatures.includes(feature)) {
      setNewTokenFeatures(newTokenFeatures.filter(f => f !== feature))
    } else {
      setNewTokenFeatures([...newTokenFeatures, feature])
    }
  }

  const toggleEditingFeature = (feature) => {
    if (editingFeatures.includes(feature)) {
      setEditingFeatures(editingFeatures.filter(f => f !== feature))
    } else {
      setEditingFeatures([...editingFeatures, feature])
    }
  }

  const handleStartEditFeatures = (tokenKey, tokenData) => {
    setEditingToken(tokenKey)
    setEditingFeatures(tokenData.features || [])
  }

  const handleSaveFeatures = async () => {
    if (!editingToken) return

    try {
      await set(ref(database, `gymai_tokens/${editingToken}/features`), editingFeatures)
      alert('Features atualizadas com sucesso!')
      setEditingToken(null)
      setEditingFeatures([])
      loadTokens()
    } catch (error) {
      console.error('Erro ao atualizar features:', error)
      alert('Erro ao atualizar features')
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
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Tokens Ativos</h2>
          <div className="space-y-4">
            {Object.entries(tokens).map(([key, token]) => (
              <div key={key} className="p-4 bg-[var(--color-border)] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{token.nome}</div>
                    <div className="text-sm text-[var(--color-muted)]">{key}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleStartEditFeatures(key, token)}>
                      Editar Features
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteToken(key)}>
                      Deletar
                    </Button>
                  </div>
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

        {/* Modal de Edição de Features */}
        {editingToken && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Editar Features - {tokens[editingToken]?.nome}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Features</label>
                  <div className="space-y-2">
                    {FEATURES.map(feature => (
                      <label key={feature} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingFeatures.includes(feature)}
                          onChange={() => toggleEditingFeature(feature)}
                          className="rounded"
                        />
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveFeatures}>
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditingToken(null)
                    setEditingFeatures([])
                  }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Solicitações Pendentes */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Solicitações Pendentes</h2>
          <div className="space-y-4">
            {Object.entries(requests).filter(([_, req]) => req.status === 'pending').length === 0 ? (
              <p className="text-[var(--color-muted)]">Nenhuma solicitação pendente</p>
            ) : (
              Object.entries(requests)
                .filter(([_, req]) => req.status === 'pending')
                .map(([requestId, request]) => (
                  <div key={requestId} className="p-4 bg-[var(--color-border)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{request.nome}</div>
                        <div className="text-sm text-[var(--color-muted)]">{request.celular}</div>
                        <div className="text-sm text-[var(--color-muted)]">
                          Solicitado em: {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveRequest(requestId, request)}>
                          Aprovar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRejectRequest(requestId)}>
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        {/* Configuração API Groq */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Configuração IA (Groq)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Chave API Groq (gratuita)</label>
              <Input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="gsk_..."
                autoComplete="off"
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                Gratuita e sem cartão de crédito.<br/>
                Obtenha em <strong>console.groq.com</strong> → API Keys.<br/>
                Salva apenas no Firebase.
              </p>
            </div>
            <Button onClick={handleSaveGroqApiKey}>Salvar chave</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminPage
