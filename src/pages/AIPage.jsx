import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { database, ref, get, set, push, onValue } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'

// Função para codificar tokenKey para paths válidos do Firebase
const encodeTokenKey = (tokenKey) => {
  return tokenKey.replace(/[.#$\[\]]/g, '_')
}

const AIPage = () => {
  const { session, hasFeature, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="container mx-auto px-4 py-8">Carregando...</div>
  if (!session) {
    navigate('/login')
    return null
  }
  const [currentPage, setCurrentPage] = useState('ia')
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [groqApiKey, setGroqApiKey] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadGroqApiKey()
    loadChatHistory()
  }, [session])

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadGroqApiKey = async () => {
    try {
      const snapshot = await get(ref(database, 'gymai_config/groq_api_key'))
      const data = snapshot.val()
      if (data) {
        setGroqApiKey(data)
      }
    } catch (error) {
      console.error('Erro ao carregar API key:', error)
    }
  }

  const loadChatHistory = async () => {
    if (!session) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_chat/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const messages = Object.values(data)
        // Manter apenas as últimas 20 mensagens
        setChatHistory(messages.slice(-20))
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de chat:', error)
    }
  }

  const saveMessageToFirebase = async (message) => {
    if (!session) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const chatRef = ref(database, `gymai_chat/${encodedKey}`)
      await push(chatRef, {
        ...message,
        timestamp: Date.now()
      })
      
      // Manter apenas as últimas 20 mensagens no Firebase
      const snapshot = await get(chatRef)
      const data = snapshot.val()
      if (data) {
        const messages = Object.entries(data)
        if (messages.length > 20) {
          // Remover as mensagens mais antigas
          const toDelete = messages.slice(0, messages.length - 20)
          for (const [key] of toDelete) {
            await set(ref(database, `gymai_chat/${encodedKey}/${key}`), null)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem no Firebase:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !session || !groqApiKey) {
      if (!groqApiKey) {
        alert('Chave API Groq não configurada. Configure no portal admin (/admin)')
      }
      return
    }

    setChatLoading(true)
    const userMessage = message
    setMessage('')

    // Adicionar mensagem do usuário imediatamente
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
    await saveMessageToFirebase({ role: 'user', content: userMessage })

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content: `Você é um coach de fitness experiente e motivador. Responda em português brasileiro de forma clara, prática e encorajadora.

IMPORTANTE: Formate suas respostas de forma organizada:
- Use quebras de linha entre parágrafos
- Use listas com marcadores (• ou -) para itens
- Use negrito **texto** para palavras-chave importantes
- Separe tópicos com linhas em branco
- Mantenha respostas concisas e diretas`
            },
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      })

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }])
      await saveMessageToFirebase({ role: 'assistant', content: aiResponse })
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    }

    setChatLoading(false)
  }

  const formatMessage = (content) => {
    // Formatação básica de markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
      .replace(/\n/g, '<br />') // Quebras de linha
      .replace(/^- (.*)/gm, '• $1') // Listas
      .replace(/^• (.*)/gm, '<div class="ml-4">• $1</div>') // Indentação de listas
  }

  const extractSuggestions = (content) => {
    // Detectar sugestões em formato de lista ou entre aspas
    const suggestions = []
    
    // Detectar listas numeradas ou com bullets
    const listMatches = content.match(/^\d+\.\s+(.+)$/gm) || content.match(/^-\s+(.+)$/gm) || content.match(/^•\s+(.+)$/gm)
    if (listMatches) {
      suggestions.push(...listMatches.map(m => m.replace(/^\d+\.\s+|^- |^• /, '').trim()))
    }
    
    // Detectar frases entre aspas
    const quoteMatches = content.match(/"([^"]+)"/g)
    if (quoteMatches) {
      suggestions.push(...quoteMatches.map(q => q.replace(/"/g, '').trim()))
    }
    
    // Detectar frases que começam com "Sugestão:" ou similar
    const suggestionMatch = content.match(/(?:Sugestão|Sugestões|Recomendo|Recomendação):\s*(.+)/i)
    if (suggestionMatch) {
      suggestions.push(suggestionMatch[1].trim())
    }
    
    // Remover duplicatas e limitar a 5 sugestões
    return [...new Set(suggestions)].slice(0, 5)
  }

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion)
    handleSendMessage()
  }

  return (
      
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
                <div key={index}>
                  <div
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white ml-8'
                        : 'bg-[var(--color-border)] mr-8'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                  
                  {/* Sugestões clicáveis para mensagens da IA */}
                  {msg.role === 'assistant' && (
                    <div className="mt-2 mr-8 flex flex-wrap gap-2">
                      {extractSuggestions(msg.content).map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Indicador de digitando */}
            {chatLoading && (
              <div className="bg-[var(--color-border)] mr-8 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[var(--color-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--color-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--color-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-[var(--color-muted)]">Peak<span className="font-bold text-primary-600">OS</span> está digitando...</span>
                </div>
              </div>
            )}
            
            {/* Elemento invisível para scroll automático */}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={chatLoading}
            />
            <Button onClick={handleSendMessage} disabled={chatLoading || !message.trim()}>
              {chatLoading ? 'Enviando...' : 'Enviar'}
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
  )
}

export default AIPage
