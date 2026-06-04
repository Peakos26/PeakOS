import { useState } from 'react'
import { useAuth } from '@context/AuthContext'
import Header from '@components/layout/Header'
import Navigation from '@components/layout/Navigation'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'

const AIPage = () => {
  const { session, hasFeature } = useAuth()
  const [currentPage, setCurrentPage] = useState('ia')
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim() || !session) return

    setLoading(true)
    const userMessage = message
    setMessage('')

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.VITE_ANTHROPIC_API_KEY || 'SUA_CHAVE_API_ANTHROPIC',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      })

      const data = await response.json()
      const aiResponse = data.content[0].text

      setChatHistory([
        ...chatHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">IA Coach</h1>

        <Card className="mb-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {chatHistory.length === 0 ? (
              <p className="text-center text-[var(--color-muted)] py-8">
                Olá! Sou seu IA Coach. Como posso ajudar você hoje?
              </p>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white ml-8'
                      : 'bg-[var(--color-border)] mr-8'
                  }`}
                >
                  {msg.content}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </Card>

        {/* Sugestões */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-muted)]">Sugestões:</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setMessage('Qual treino é melhor para ganhar massa?')}>
              Treino para ganho de massa
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMessage('Como melhorar minha dieta?')}>
              Melhorar dieta
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMessage('Dicas para recuperação muscular')}>
              Recuperação muscular
            </Button>
          </div>
        </div>
      </main>

      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default AIPage
