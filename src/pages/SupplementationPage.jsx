import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set, push } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { Pill, Clock, Calendar, Bell, Plus, Trash2, Check, AlertCircle, Info, TrendingUp, Zap } from 'lucide-react'

const SupplementationPage = () => {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState('guide')
  const [userObjective, setUserObjective] = useState('hipertrofia')
  const [userStack, setUserStack] = useState([])
  const [supplementCycle, setSupplementCycle] = useState(null)
  const [selectedSupplement, setSelectedSupplement] = useState(null)
  const [isEvaluatingStack, setIsEvaluatingStack] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  const supplementsDatabase = [
    {
      id: 1,
      name: 'Creatina Monohidratada',
      category: 'performance',
      objectives: ['hipertrofia', 'forca'],
      benefits: ['Aumenta força e potência', 'Melhora recuperação muscular', 'Aumenta volume celular'],
      dosage: '3-5g/dia',
      timing: 'Pós-treino ou qualquer horário',
      contraindications: 'Pessoas com problemas renais devem consultar médico',
      cycle: 'Carga 5-7 dias (20g/dia) → Manutenção (3-5g/dia)',
      icon: '💪'
    },
    {
      id: 2,
      name: 'Whey Protein',
      category: 'protein',
      objectives: ['hipertrofia', 'emagrecimento'],
      benefits: ['Alta biodisponibilidade de proteína', 'Rico em BCAAs', 'Digestão rápida'],
      dosage: '20-30g pós-treino',
      timing: 'Pós-treino (30min)',
      contraindications: 'Intolerância à lactose (usar isolado ou hidrolisado)',
      cycle: 'Contínuo',
      icon: '🥛'
    },
    {
      id: 3,
      name: 'Beta-Alanina',
      category: 'performance',
      objectives: ['hipertrofia', 'forca'],
      benefits: ['Aumenta capacidade anaeróbica', 'Retarda fadiga muscular', 'Melhora performance em treinos intensos'],
      dosage: '2-5g/dia',
      timing: 'Dividido em 2-3 doses',
      contraindications: 'Pode causar formigamento (parestesia)',
      cycle: 'Contínuo',
      icon: '⚡'
    },
    {
      id: 4,
      name: 'Cafeína',
      category: 'performance',
      objectives: ['forca', 'emagrecimento'],
      benefits: ['Aumenta foco e energia', 'Melhora performance', 'Acelera metabolismo'],
      dosage: '200-400mg pré-treino',
      timing: '30-60min antes do treino',
      contraindications: 'Sensibilidade à cafeína, problemas cardíacos',
      cycle: 'Ciclar 4-6 semanas para evitar tolerância',
      icon: '☕'
    },
    {
      id: 5,
      name: 'BCAAs',
      category: 'recovery',
      objectives: ['hipertrofia', 'emagrecimento'],
      benefits: ['Reduz catabolismo muscular', 'Melhora recuperação', 'Fornece energia durante treino'],
      dosage: '5-10g durante treino',
      timing: 'Intra-treino',
      contraindications: 'Geralmente seguro',
      cycle: 'Contínuo',
      icon: '🏋️'
    },
    {
      id: 6,
      name: 'Glutamina',
      category: 'recovery',
      objectives: ['hipertrofia', 'imunidade'],
      benefits: ['Melhora recuperação', 'Fortalece sistema imune', 'Melhora saúde intestinal'],
      dosage: '5-10g/dia',
      timing: 'Pós-treino ou antes de dormir',
      contraindications: 'Geralmente seguro',
      cycle: 'Contínuo',
      icon: '🩺'
    },
    {
      id: 7,
      name: 'Multivitamínico',
      category: 'health',
      objectives: ['saude', 'hipertrofia'],
      benefits: ['Cobre deficiências nutricionais', 'Melhora energia', 'Suporta metabolismo'],
      dosage: '1 dose/dia (conforme fabricante)',
      timing: 'Com refeição',
      contraindications: 'Excesso de vitaminas lipossolúveis (A, D, E, K)',
      cycle: 'Contínuo',
      icon: '💊'
    },
    {
      id: 8,
      name: 'Ômega-3',
      category: 'health',
      objectives: ['saude', 'emagrecimento'],
      benefits: ['Anti-inflamatório', 'Melhora saúde cardiovascular', 'Melhora função cerebral'],
      dosage: '2-3g EPA/DHA por dia',
      timing: 'Com refeição',
      contraindications: 'Pessoas com distúrbios de coagulação',
      cycle: 'Contínuo',
      icon: '🐟'
    },
    {
      id: 9,
      name: 'ZMA',
      category: 'recovery',
      objectives: ['hipertrofia', 'sono'],
      benefits: ['Melhora qualidade do sono', 'Aumenta testosterona natural', 'Melhora recuperação'],
      dosage: 'Conforme fabricante (geralmente antes de dormir)',
      timing: '30-60min antes de dormir',
      contraindications: 'Não tomar com cálcio',
      cycle: 'Contínuo',
      icon: '😴'
    },
    {
      id: 10,
      name: 'Citrulina Malato',
      category: 'performance',
      objectives: ['hipertrofia', 'bombeamento'],
      benefits: ['Aumenta óxido nítrico', 'Melhora bombeamento', 'Reduz fadiga'],
      dosage: '6-8g pré-treino',
      timing: '30-60min antes do treino',
      contraindications: 'Geralmente seguro',
      cycle: 'Contínuo',
      icon: '💨'
    },
    {
      id: 11,
      name: 'Vitamina D3',
      category: 'health',
      objectives: ['saude', 'hipertrofia'],
      benefits: ['Melhora absorção de cálcio', 'Fortalece sistema imune', 'Melhora função muscular'],
      dosage: '2000-5000 UI/dia',
      timing: 'Com refeição contendo gordura',
      contraindications: 'Excesso pode causar toxicidade',
      cycle: 'Contínuo',
      icon: '☀️'
    },
    {
      id: 12,
      name: 'Magnésio',
      category: 'recovery',
      objectives: ['saude', 'sono'],
      benefits: ['Relaxa músculos', 'Melhora sono', 'Reduz cãibras'],
      dosage: '200-400mg/dia',
      timing: 'Antes de dormir',
      contraindications: 'Problemas renais',
      cycle: 'Contínuo',
      icon: '🌙'
    },
    {
      id: 13,
      name: 'Colágeno',
      category: 'health',
      objectives: ['saude', 'articulacoes'],
      benefits: ['Melhora saúde das articulações', 'Melhora pele', 'Fortalece tendões'],
      dosage: '10g/dia',
      timing: 'Com refeição',
      contraindications: 'Geralmente seguro',
      cycle: 'Contínuo',
      icon: '🦴'
    },
    {
      id: 14,
      name: 'Pre-Workout',
      category: 'performance',
      objectives: ['hipertrofia', 'forca'],
      benefits: ['Aumenta energia', 'Melhora foco', 'Aumenta bombeamento'],
      dosage: 'Conforme fabricante',
      timing: '30min antes do treino',
      contraindications: 'Pode causar insônia se tomado tarde',
      cycle: 'Ciclar 4-6 semanas',
      icon: '🔥'
    },
    {
      id: 15,
      name: 'Caseína',
      category: 'protein',
      objectives: ['hipertrofia', 'emagrecimento'],
      benefits: ['Digestão lenta', 'Fornece aminoácidos durante a noite', 'Reduz catabolismo'],
      dosage: '20-30g antes de dormir',
      timing: 'Antes de dormir',
      contraindications: 'Intolerância à lactose',
      cycle: 'Contínuo',
      icon: '🌙'
    },
    {
      id: 16,
      name: 'HMB',
      category: 'recovery',
      objectives: ['emagrecimento', 'hipertrofia'],
      benefits: ['Reduz catabolismo', 'Preserva massa muscular', 'Melhora recuperação'],
      dosage: '3g/dia',
      timing: 'Dividido em 2-3 doses',
      contraindications: 'Geralmente seguro',
      cycle: 'Contínuo',
      icon: '🛡️'
    },
    {
      id: 17,
      name: 'Tribulus Terrestris',
      category: 'hormonal',
      objectives: ['hipertrofia', 'libido'],
      benefits: ['Pode aumentar testosterona', 'Melhora libido', 'Aumenta energia'],
      dosage: '500-1500mg/dia',
      timing: 'Com refeição',
      contraindications: 'Pode afetar hormônios',
      cycle: 'Ciclar 6-8 semanas',
      icon: '🌿'
    },
    {
      id: 18,
      name: 'L-Carnitina',
      category: 'emagrecimento',
      objectives: ['emagrecimento', 'energia'],
      benefits: ['Melhora queima de gordura', 'Aumenta energia', 'Melhora recuperação'],
      dosage: '2-3g/dia',
      timing: 'Pós-treino ou com refeição',
      contraindications: 'Geralmente seguro',
      cycle: 'Contínuo',
      icon: '🔥'
    },
    {
      id: 19,
      name: 'Arginina',
      category: 'performance',
      objectives: ['hipertrofia', 'bombeamento'],
      benefits: ['Aumenta óxido nítrico', 'Melhora bombeamento', 'Melhora circulação'],
      dosage: '3-6g/dia',
      timing: 'Pré-treino',
      contraindications: 'Pode causar desconforto gastrointestinal',
      cycle: 'Contínuo',
      icon: '💪'
    },
    {
      id: 20,
      name: 'Probióticos',
      category: 'health',
      objectives: ['saude', 'digestao'],
      benefits: ['Melhora saúde digestiva', 'Fortalece sistema imune', 'Melhora absorção de nutrientes'],
      dosage: 'Conforme fabricante',
      timing: 'Com refeição',
      contraindications: 'Geralmente seguro',
      cycle: 'Contínuo',
      icon: '🦠'
    }
  ]

  useEffect(() => {
    loadUserStack()
    loadSupplementCycle()
  }, [session])

  const loadUserStack = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_suplementos/${encodedKey}/stack`))
      const data = snapshot.val()
      if (data) {
        const stackArray = Object.values(data)
        setUserStack(stackArray)
      }
    } catch (error) {
      console.error('Erro ao carregar stack:', error)
    }
  }

  const loadSupplementCycle = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_suplementos/${encodedKey}/cycle`))
      const data = snapshot.val()
      if (data) {
        setSupplementCycle(data)
      }
    } catch (error) {
      console.error('Erro ao carregar ciclo:', error)
    }
  }

  const addToStack = async (supplement) => {
    const newStackItem = {
      id: Date.now(),
      supplementId: supplement.id,
      name: supplement.name,
      dosage: supplement.dosage,
      timing: supplement.timing,
      addedAt: Date.now()
    }
    
    const updatedStack = [...userStack, newStackItem]
    setUserStack(updatedStack)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_suplementos/${encodedKey}/stack`), updatedStack)
    } catch (error) {
      console.error('Erro ao adicionar à stack:', error)
    }
  }

  const removeFromStack = async (itemId) => {
    const updatedStack = userStack.filter(item => item.id !== itemId)
    setUserStack(updatedStack)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_suplementos/${encodedKey}/stack`), updatedStack)
    } catch (error) {
      console.error('Erro ao remover da stack:', error)
    }
  }

  const evaluateStack = async () => {
    setIsEvaluatingStack(true)
    
    // Simulação de análise da stack pela IA
    setTimeout(() => {
      const suggestions = []
      
      if (userStack.length === 0) {
        suggestions.push('Considere adicionar Whey Protein para atingir suas metas proteicas.')
      }
      
      if (userStack.some(item => item.name.includes('Creatina'))) {
        suggestions.push('Ótima escolha! A creatina é o suplemento mais comprovado para hipertrofia.')
      }
      
      if (userStack.some(item => item.name.includes('Cafeína')) && userStack.some(item => item.name.includes('Pre-Workout'))) {
        suggestions.push('Atenção: Você tem cafeína e pre-workout. Isso pode causar excesso de estímulo.')
      }
      
      if (!userStack.some(item => item.name.includes('Multivitamínico'))) {
        suggestions.push('Considere adicionar um multivitamínico para cobrir deficiências nutricionais.')
      }
      
      if (suggestions.length === 0) {
        suggestions.push('Sua stack parece bem equilibrada! Continue assim.')
      }
      
      alert(`Análise da Stack:\n\n${suggestions.join('\n\n')}`)
      setIsEvaluatingStack(false)
    }, 2000)
  }

  const createSupplementCycle = async () => {
    const cycle = {
      objective: userObjective,
      startDate: Date.now(),
      duration: 8, // semanas
      phase: 'carga',
      supplements: userStack,
      reminderTime,
      createdAt: Date.now()
    }
    
    setSupplementCycle(cycle)
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      await set(ref(database, `gymai_suplementos/${encodedKey}/cycle`), cycle)
      alert('Ciclo de suplementação criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar ciclo:', error)
    }
  }

  const getRecommendedSupplements = () => {
    return supplementsDatabase.filter(supplement => 
      supplement.objectives.includes(userObjective)
    )
  }

  const isSupplementInStack = (supplementId) => {
    return userStack.some(item => item.supplementId === supplementId)
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Suplementação</h1>
          <p className="text-[var(--color-muted)]">Guia completo de suplementos, stack personalizada e ciclos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'guide'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Pill size={20} />
            Guia
          </button>
          <button
            onClick={() => setActiveTab('stack')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'stack'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <TrendingUp size={20} />
            Minha Stack
          </button>
          <button
            onClick={() => setActiveTab('cycle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'cycle'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Calendar size={20} />
            Ciclo
          </button>
        </div>

        {activeTab === 'guide' && (
          <div className="space-y-6">
            {/* Objective Selection */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Seu Objetivo</h2>
              </div>
              <select
                value={userObjective}
                onChange={(e) => setUserObjective(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
              >
                <option value="hipertrofia">Hipertrofia</option>
                <option value="forca">Força</option>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="saude">Saúde Geral</option>
                <option value="sono">Melhorar Sono</option>
                <option value="articulacoes">Articulações</option>
              </select>
            </Card>

            {/* Recommended Supplements */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Suplementos Recomendados</h2>
              </div>
              <div className="space-y-4">
                {getRecommendedSupplements().map((supplement) => (
                  <Card key={supplement.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{supplement.icon}</span>
                        <div>
                          <h3 className="font-semibold">{supplement.name}</h3>
                          <span className="text-xs text-[var(--color-muted)] capitalize">{supplement.category}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToStack(supplement)}
                        disabled={isSupplementInStack(supplement.id)}
                      >
                        {isSupplementInStack(supplement.id) ? <Check size={16} /> : <Plus size={16} />}
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Benefícios:</span>
                        <span className="text-[var(--color-muted)] ml-2">{supplement.benefits.join(', ')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Dosagem:</span>
                        <span className="text-[var(--color-muted)] ml-2">{supplement.dosage}</span>
                      </div>
                      <div>
                        <span className="font-medium">Horário:</span>
                        <span className="text-[var(--color-muted)] ml-2">{supplement.timing}</span>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                          <span className="text-yellow-700 dark:text-yellow-300">{supplement.contraindications}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* All Supplements */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Pill size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Todos os Suplementos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplementsDatabase.map((supplement) => (
                  <Card key={supplement.id} className="p-4 cursor-pointer hover:border-primary-600 transition-colors" onClick={() => setSelectedSupplement(supplement)}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{supplement.icon}</span>
                      <div>
                        <h3 className="font-semibold">{supplement.name}</h3>
                        <span className="text-xs text-[var(--color-muted)] capitalize">{supplement.category}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Supplement Detail Modal */}
            {selectedSupplement && (
              <Card className="border-2 border-primary-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedSupplement.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedSupplement.name}</h2>
                      <span className="text-sm text-[var(--color-muted)] capitalize">{selectedSupplement.category}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedSupplement(null)}>
                    Fechar
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <h3 className="font-semibold mb-2">Benefícios</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {selectedSupplement.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--color-border)] rounded-lg">
                      <h3 className="font-semibold mb-2">Dosagem</h3>
                      <p className="text-sm">{selectedSupplement.dosage}</p>
                    </div>
                    <div className="p-4 bg-[var(--color-border)] rounded-lg">
                      <h3 className="font-semibold mb-2">Horário Ideal</h3>
                      <p className="text-sm">{selectedSupplement.timing}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <h3 className="font-semibold mb-2">Ciclo</h3>
                    <p className="text-sm">{selectedSupplement.cycle}</p>
                  </div>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={20} className="text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-700 dark:text-red-300">Contraindicações</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">{selectedSupplement.contraindications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => addToStack(selectedSupplement)} disabled={isSupplementInStack(selectedSupplement.id)} className="w-full">
                    {isSupplementInStack(selectedSupplement.id) ? 'Já na Stack' : 'Adicionar à Minha Stack'}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'stack' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={24} className="text-primary-600" />
                  <h2 className="text-xl font-bold">Minha Stack Atual</h2>
                </div>
                <Button onClick={evaluateStack} disabled={isEvaluatingStack || userStack.length === 0}>
                  {isEvaluatingStack ? 'Analisando...' : 'Analisar Stack'}
                </Button>
              </div>

              {userStack.length === 0 ? (
                <p className="text-center text-[var(--color-muted)] py-8">
                  Sua stack está vazia. Adicione suplementos no guia para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {userStack.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {supplementsDatabase.find(s => s.id === item.supplementId)?.icon || '💊'}
                          </div>
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-[var(--color-muted)]">{item.dosage} - {item.timing}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => removeFromStack(item.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {/* Reminder */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Lembrete de Suplementação</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Horário do Lembrete</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
                  />
                </div>
                <Button onClick={() => alert('Lembrete configurado!')} className="w-full">
                  <Bell size={20} className="mr-2" />
                  Configurar Lembrete
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'cycle' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Ciclo de Suplementação</h2>
              </div>

              {!supplementCycle ? (
                <div className="space-y-4">
                  <p className="text-[var(--color-muted)]">
                    Crie um ciclo de suplementação de 4-12 semanas para organizar sua suplementação.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Objetivo do Ciclo</label>
                    <select
                      value={userObjective}
                      onChange={(e) => setUserObjective(e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
                    >
                      <option value="hipertrofia">Hipertrofia</option>
                      <option value="forca">Força</option>
                      <option value="emagrecimento">Emagrecimento</option>
                      <option value="saude">Saúde Geral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Duração (semanas)</label>
                    <select
                      value={8}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
                    >
                      <option value={4}>4 semanas</option>
                      <option value={6}>6 semanas</option>
                      <option value={8}>8 semanas</option>
                      <option value={10}>10 semanas</option>
                      <option value={12}>12 semanas</option>
                    </select>
                  </div>

                  <Button onClick={createSupplementCycle} disabled={userStack.length === 0} className="w-full">
                    Criar Ciclo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={20} className="text-primary-600" />
                      <h3 className="font-semibold">Ciclo Ativo</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Objetivo:</span> {supplementCycle.objective}</div>
                      <div><span className="font-medium">Duração:</span> {supplementCycle.duration} semanas</div>
                      <div><span className="font-medium">Fase:</span> {supplementCycle.phase}</div>
                      <div><span className="font-medium">Lembrete:</span> {supplementCycle.reminderTime}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <h3 className="font-semibold mb-2">Suplementos no Ciclo</h3>
                    <div className="space-y-2">
                      {supplementCycle.supplements.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span>{supplementsDatabase.find(s => s.id === item.supplementId)?.icon}</span>
                          <span>{item.name}</span>
                          <span className="text-[var(--color-muted)]">({item.dosage})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--color-border)] rounded-lg">
                    <h3 className="font-semibold mb-2">Calendário Visual</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      Calendário de suplementação será exibido aqui.
                    </p>
                  </div>

                  <Button variant="outline" onClick={() => setSupplementCycle(null)} className="w-full">
                    Encerrar Ciclo
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
  )
}

export default SupplementationPage
