import { useState, useEffect } from 'react'
import { useAuth } from '@context/AuthContext'
import { database, ref, get, set } from '@config/firebase.config'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { TrendingUp, Calendar, Download, Filter, Search, Camera, Scale, Ruler, Activity } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const EvolutionDashboardPage = () => {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [weightData, setWeightData] = useState([])
  const [measurementsData, setMeasurementsData] = useState([])
  const [bodyFatData, setBodyFatData] = useState([])
  const [beforePhoto, setBeforePhoto] = useState(null)
  const [afterPhoto, setAfterPhoto] = useState(null)
  const [timelineEvents, setTimelineEvents] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const encodeTokenKey = (tokenKey) => {
    return tokenKey.replace(/[.#$\[\]]/g, '_')
  }

  useEffect(() => {
    loadWeightData()
    loadMeasurementsData()
    loadTimelineEvents()
  }, [session])

  const loadWeightData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_medidas/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const weightArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            weight: entry.peso
          }))
          .filter(entry => entry.weight)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
        
        setWeightData(weightArray)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de peso:', error)
    }
  }

  const loadMeasurementsData = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const snapshot = await get(ref(database, `gymai_medidas/${encodedKey}`))
      const data = snapshot.val()
      if (data) {
        const measurementsArray = Object.entries(data)
          .map(([date, entry]) => ({
            date,
            cintura: entry.cintura,
            braco: entry.braco,
            coxa: entry.coxa
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
        
        setMeasurementsData(measurementsArray)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de medidas:', error)
    }
  }

  const loadTimelineEvents = async () => {
    if (!session?.tokenKey) return
    
    try {
      const encodedKey = encodeTokenKey(session.tokenKey)
      const events = []
      
      // Carregar treinos
      const workoutSnapshot = await get(ref(database, `gymai_treinos/${encodedKey}`))
      const workoutData = workoutSnapshot.val()
      if (workoutData) {
        Object.entries(workoutData).forEach(([date, workout]) => {
          events.push({
            id: `workout-${date}`,
            type: 'workout',
            date,
            title: 'Treino',
            description: `${workout.exercises?.length || 0} exercícios`,
            icon: '💪'
          })
        })
      }
      
      // Carregar conquistas
      const achievementsSnapshot = await get(ref(database, `gymai_conquistas/${encodedKey}`))
      const achievementsData = achievementsSnapshot.val()
      if (achievementsData) {
        Object.values(achievementsData).forEach((achievement) => {
          events.push({
            id: `achievement-${achievement.unlockedAt}`,
            type: 'achievement',
            date: new Date(achievement.unlockedAt).toISOString().split('T')[0],
            title: achievement.name,
            description: achievement.description,
            icon: achievement.icon
          })
        })
      }
      
      // Carregar check-ins de peso
      const weightSnapshot = await get(ref(database, `gymai_medidas/${encodedKey}`))
      const weightData = weightSnapshot.val()
      if (weightData) {
        Object.entries(weightData).forEach(([date, entry]) => {
          if (entry.peso) {
            events.push({
              id: `weight-${date}`,
              type: 'weight',
              date,
              title: 'Peso',
              description: `${entry.peso} kg`,
              icon: '⚖️'
            })
          }
        })
      }
      
      events.sort((a, b) => new Date(b.date) - new Date(a.date))
      setTimelineEvents(events)
    } catch (error) {
      console.error('Erro ao carregar timeline:', error)
    }
  }

  const weightChartData = {
    labels: weightData.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: 'Peso (kg)',
        data: weightData.map(d => d.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const measurementsChartData = {
    labels: measurementsData.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: 'Cintura (cm)',
        data: measurementsData.map(d => d.cintura),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Braço (cm)',
        data: measurementsData.map(d => d.braco),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Coxa (cm)',
        data: measurementsData.map(d => d.coxa),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: false,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }

  const filteredEvents = timelineEvents.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const generateReport = async () => {
    setIsGeneratingReport(true)
    
    try {
      // Em produção, usar jsPDF para gerar PDF
      // Por enquanto, mostrar alerta simulado
      setTimeout(() => {
        alert('Relatório gerado com sucesso! (Funcionalidade PDF será implementada com jsPDF)')
        setIsGeneratingReport(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      setIsGeneratingReport(false)
    }
  }

  const handleBeforePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBeforePhoto(URL.createObjectURL(file))
    }
  }

  const handleAfterPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAfterPhoto(URL.createObjectURL(file))
    }
  }

  return (
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Dashboard de Evolução</h1>
          <p className="text-[var(--color-muted)]">Acompanhe seu progresso com gráficos e relatórios detalhados</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <TrendingUp size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'reports'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Calendar size={20} />
            Relatórios
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'timeline'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Activity size={20} />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'photos'
                ? 'bg-primary-600 text-white'
                : 'bg-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            <Camera size={20} />
            Fotos
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Weight Chart */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Scale size={24} className="text-primary-600" />
                  <h2 className="text-xl font-bold">Peso Corporal</h2>
                </div>
              </div>
              {weightData.length > 0 ? (
                <Line data={weightChartData} options={chartOptions} />
              ) : (
                <p className="text-center text-[var(--color-muted)] py-8">
                  Nenhum dado de peso registrado. Adicione suas medidas na página de Medidas.
                </p>
              )}
            </Card>

            {/* Measurements Chart */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ruler size={24} className="text-primary-600" />
                  <h2 className="text-xl font-bold">Medidas Corporais</h2>
                </div>
              </div>
              {measurementsData.length > 0 ? (
                <Line data={measurementsChartData} options={chartOptions} />
              ) : (
                <p className="text-center text-[var(--color-muted)] py-8">
                  Nenhum dado de medidas registrado. Adicione suas medidas na página de Medidas.
                </p>
              )}
            </Card>

            {/* Body Fat Chart */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={24} className="text-primary-600" />
                  <h2 className="text-xl font-bold">% Gordura Corporal</h2>
                </div>
              </div>
              <p className="text-center text-[var(--color-muted)] py-8">
                Funcionalidade disponível com scanner de gordura corporal.
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={24} className="text-primary-600" />
                  <h2 className="text-xl font-bold">Relatórios Avançados</h2>
                </div>
                <Button onClick={generateReport} disabled={isGeneratingReport}>
                  {isGeneratingReport ? 'Gerando...' : 'Gerar Relatório PDF'}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório Semanal</h3>
                  <p className="text-sm text-[var(--color-muted)] mb-3">
                    Gráficos detalhados do seu progresso semanal com Chart.js
                  </p>
                  <Button size="sm" variant="outline">
                    <Download size={16} className="mr-2" />
                    Baixar
                  </Button>
                </div>

                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório Mensal</h3>
                  <p className="text-sm text-[var(--color-muted)] mb-3">
                    Comparativo detalhado com o mês anterior
                  </p>
                  <Button size="sm" variant="outline">
                    <Download size={16} className="mr-2" />
                    Baixar
                  </Button>
                </div>

                <div className="p-4 bg-[var(--color-border)] rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório de Suplementação</h3>
                  <p className="text-sm text-[var(--color-muted)] mb-3">
                    O que usar, quando, por quanto tempo
                  </p>
                  <Button size="sm" variant="outline">
                    <Download size={16} className="mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={24} className="text-primary-600" />
                  <h2 className="text-xl font-bold">Timeline de Eventos</h2>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="text"
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
                >
                  <option value="all">Todos</option>
                  <option value="workout">Treinos</option>
                  <option value="achievement">Conquistas</option>
                  <option value="weight">Peso</option>
                </select>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <p className="text-center text-[var(--color-muted)] py-8">
                    Nenhum evento encontrado.
                  </p>
                ) : (
                  filteredEvents.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="text-3xl">{event.icon}</div>
                        {index < filteredEvents.length - 1 && (
                          <div className="w-0.5 h-full bg-[var(--color-border)] mt-2" />
                        )}
                      </div>
                      <div className="flex-1 p-4 bg-[var(--color-border)] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <span className="text-xs text-[var(--color-muted)]">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-muted)]">{event.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Camera size={24} className="text-primary-600" />
                <h2 className="text-xl font-bold">Comparativo Antes/Depois</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Antes</h3>
                  <div className="aspect-square bg-[var(--color-border)] rounded-lg flex items-center justify-center overflow-hidden">
                    {beforePhoto ? (
                      <img src={beforePhoto} alt="Antes" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-[var(--color-muted)]">
                        <Camera size={48} className="mx-auto mb-2" />
                        <p className="text-sm">Carregar foto</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBeforePhotoChange}
                    className="mt-2 w-full text-sm"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Depois</h3>
                  <div className="aspect-square bg-[var(--color-border)] rounded-lg flex items-center justify-center overflow-hidden">
                    {afterPhoto ? (
                      <img src={afterPhoto} alt="Depois" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-[var(--color-muted)]">
                        <Camera size={48} className="mx-auto mb-2" />
                        <p className="text-sm">Carregar foto</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAfterPhotoChange}
                    className="mt-2 w-full text-sm"
                  />
                </div>
              </div>

              {beforePhoto && afterPhoto && (
                <div className="mt-4">
                  <Button className="w-full">
                    <Download size={20} className="mr-2" />
                    Baixar Comparativo
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
  )
}

export default EvolutionDashboardPage
