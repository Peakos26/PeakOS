import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Bot, Send, Sparkles, TrendingUp, Clock, MessageSquare, Calendar } from 'lucide-react'

const CoachAvancadoPage = () => {
  const { session, hasFeature } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [quickChips, setQuickChips] = useState([])
  const [weeklyInsight, setWeeklyInsight] = useState(null)
  const [isAnalyzingWeek, setIsAnalyzingWeek] = useState(false)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadChatHistory()
    loadWeeklyInsight()
    generateQuickChips()
  }, [session])

  const loadChatHistory = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_coach/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.entries(data)
          .map(([id, msg]) => ({
            id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-10) // Manter apenas as últimas 10 mensagens
        
        setChatHistory(historyArray)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  const loadWeeklyInsight = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const currentWeekId = getWeekId()
      const snapshot = await get(ref(database, `gymai_insights/${encodedKey}/${currentWeekId}`))
      const data = snapshot.val()
      if (data) {
        setWeeklyInsight(data)
      }
    } catch (error) {
      console.error('Erro ao carregar insight semanal:', error)
    }
  }

  const getWeekId = () => {
    const now = new Date()
    const year = now.getFullYear()
    const week = Math.ceil(now.getDate() / 7)
    return `${year}-W${week}`
  }

  const generateQuickChips = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      
      // Analisar histórico do usuário para gerar chips dinâmicos
      const workoutSnapshot = await get(ref(database, `gymai_treinos/${encodedKey}`))
      const workoutData = workoutSnapshot.val()
      
      const foodSnapshot = await get(ref(database, `gymai_diario_alimentar/${encodedKey}`))
      const foodData = foodSnapshot.val()
      
      const chips = []
      
      // Chips baseados no histórico de treino
      if (workoutData) {
        const lastWorkout = Object.values(workoutData).pop()
        if (lastWorkout) {
          chips.push({ id: 'last_workout', label: 'Como foi meu último treino?', type: 'workout' })
        }
        
        const workoutDays = Object.keys(workoutData).length
        chips.push({ id: 'consistency', label: `Treinei ${workoutDays} dias esse mês`, type: 'consistency' })
      }
      
      // Chips baseados no histórico alimentar
      if (foodData) {
        const today = new Date().toISOString().split('T')[0]
        const todayFood = foodData[today]
        if (todayFood) {
          chips.push({ id: 'today_food', label: 'Analisar minha alimentação hoje', type: 'food' })
        }
      }
      
      // Chips genéricos
      chips.push({ id: 'tips', label: 'Dica rápida de treino', type: 'general' })
      chips.push({ id: 'recovery', label: 'Como melhorar minha recuperação?', type: 'general' })
      
      setQuickChips(chips.slice(0, 5))
    } catch (error) {
      console.error('Erro ao gerar quick chips:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !session?.tokenKey) return
    
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    }
    
    const newHistory = [...chatHistory, userMessage]
    setChatHistory(newHistory)
    setMessage('')
    setIsLoading(true)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      
      // Salvar mensagem do usuário
      const messageRef = push(ref(database, `gymai_coach/${encodedKey}`))
      await set(messageRef, userMessage)
      
      // Simular resposta da IA (em produção, integrar com Groq)
      setTimeout(async () => {
        const aiResponse = await generateAIResponse(message, newHistory)
        
        const assistantMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now()
        }
        
        const responseRef = push(ref(database, `gymai_coach/${encodedKey}`))
        await set(responseRef, assistantMessage)
        
        setChatHistory([...newHistory, assistantMessage])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (userMessage, history) => {
    // Em produção, integrar com Groq API
    // Por enquanto, usar respostas simuladas baseadas no contexto
    
    const context = history.slice(-5).map(m => m.content).join(' ')
    
    if (userMessage.toLowerCase().includes('treino') || userMessage.toLowerCase().includes('exercício')) {
      return 'Baseado no seu histórico, você está progredindo bem! Para otimizar seus resultados, recomendo focar em progressão de carga nos exercícios compostos (agachamento, supino, deadlift). Tente aumentar 2.5-5kg por semana quando conseguir completar todas as séries com boa forma.'
    }
    
    if (userMessage.toLowerCase().includes('dieta') || userMessage.toLowerCase().includes('alimentação')) {
      return 'Para maximizar seus resultados, foque em: 1) Proteína de alta qualidade (1.6-2.2g por kg), 2) Carboidratos complexos antes do treino, 3) Gorduras saudáveis para hormônios. Mantenha-se hidratado e evite alimentos processados.'
    }
    
    if (userMessage.toLowerCase().includes('recuperação') || userMessage.toLowerCase().includes('sono')) {
      return 'A recuperação é tão importante quanto o treino! Priorize: 7-9 horas de sono, alimentação pós-treino em 30 minutos, e 1-2 dias de descanso ativo por semana. Se está sentindo muita fadiga, considere reduzir o volume por uma semana.'
    }
    
    return 'Entendi sua pergunta! Como seu coach IA, estou aqui para ajudar você a alcançar seus objetivos. Posso ajudar com treinos, nutrição, recuperação ou qualquer dúvida sobre fitness. O que mais você gostaria de saber?'
  }

  const analyzeWeek = async () => {
    if (!session?.tokenKey) return
    
    setIsAnalyzingWeek(true)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const currentWeekId = getWeekId()
      
      // Coletar dados da semana
      const workoutSnapshot = await get(ref(database, `gymai_treinos/${encodedKey}`))
      const workoutData = workoutSnapshot.val()
      
      const foodSnapshot = await get(ref(database, `gymai_diario_alimentar/${encodedKey}`))
      const foodData = foodSnapshot.val()
      
      const sleepSnapshot = await get(ref(database, `gymai_sono/${encodedKey}`))
      const sleepData = sleepSnapshot.val()
      
      // Gerar insight (em produção, usar IA)
      setTimeout(async () => {
        const insight = {
          positivePoints: [
            'Você manteve consistência nos treinos',
            'Alimentação equilibrada na maioria dos dias',
            'Sono adequado na maioria das noites'
          ],
          improvements: [
            'Aumentar ingestão de proteína nos dias de treino',
            'Melhorar hidratação durante o treino',
            'Adicionar alongamentos pós-treino'
          ],
          comparison: 'Comparado à semana anterior, você aumentou o volume total em 15%',
          timestamp: Date.now()
        }
        
        await set(ref(database, `gymai_insights/${encodedKey}/${currentWeekId}`), insight)
        setWeeklyInsight(insight)
        setIsAnalyzingWeek(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao analisar semana:', error)
      setIsAnalyzingWeek(false)
    }
  }

  const handleQuickChip = async (chip) => {
    setMessage(chip.label)
    await sendMessage()
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Coach IA</h1>
          <p className="text-[var(--color-muted)]">Seu assistente inteligente de fitness</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'chat'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <MessageSquare size={20} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'insights'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <TrendingUp size={20} />
            Insights
          </button>
        </div>

        {activeTab === 'chat' && (
          <>
            {/* Quick Chips */}
            {quickChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {quickChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => handleQuickChip(chip)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-border)] rounded-full text-sm hover:bg-[var(--color-border)] transition-colors"
                  >
                    <Sparkles size={14} />
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chat History */}
            <Card className="mb-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-[var(--color-border)] text-[var(--color-text)]'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-border)] p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bot size={20} className="animate-pulse" />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Message Input */}
            <Card>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua pergunta para o coach..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isLoading || !message.trim()}>
                  <Send size={20} />
                </Button>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'insights' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Análise Semanal</h2>
              </div>
              <Button onClick={analyzeWeek} disabled={isAnalyzingWeek}>
                {isAnalyzingWeek ? 'Analisando...' : 'Analisar Minha Semana'}
              </Button>
            </div>

            {weeklyInsight ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">✓ Pontos Positivos</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[var(--color-muted)]">
                    {weeklyInsight.positivePoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-orange-600">⚠ Áreas de Melhoria</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[var(--color-muted)]">
                    {weeklyInsight.improvements.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <p className="text-sm text-[var(--color-muted)]">{weeklyInsight.comparison}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-[var(--color-muted)] py-8">
                Clique em "Analisar Minha Semana" para gerar um relatório completo da sua semana.
              </p>
            )}
          </Card>
        )}
      </main>
  )
}

export default CoachAvancadoPage
